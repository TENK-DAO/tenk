import { Workspace, NearAccount, ONE_NEAR } from "near-willem-workspaces-ava";
import { NEAR, Gas } from "near-units";
import { nftTokensForOwner, mint, BalanceDelta, deploy, totalCost } from "./util";

const base_cost = NEAR.parse("0 N");
const min_cost = NEAR.parse("0 N");

async function deployEmpty(account: NearAccount): Promise<void> {
  const empty = account.getFullAccount("empty.tn");
  const bytes = await empty.viewCode();
  await account.createTransaction(account).deployContract(bytes).signAndSend();
}

function getRoyalties({ root, alice, eve }) {
  return {
    accounts: {
      [root.accountId]: 10,
      [alice.accountId]: 20,
      [eve.accountId]: 70,
    },
    percent: 20,
  };
}

function delpoyParas(
  root: NearAccount,
  owner_id: NearAccount,
  treasury_id: NearAccount,
  approved_nft_contract_ids: NearAccount[]
): Promise<NearAccount> {
  return root.createAndDeploy(
    "paras-market",
    `${__dirname}/contracts/paras.wasm`,
    {
      method: "new",
      args: {
        owner_id,
        treasury_id,
        // approved_ft_token_ids: Option<Vec<ValidAccountId>>,
        approved_nft_contract_ids,
      },
    }
  );
}

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    const owner_id = root;
    const alice = await root.createAccount("alice");
    const bob = await root.createAccount("bob");
    const eve = await root.createAccount("eve");
    const royalties = getRoyalties({ root, alice, eve });
    const tenk = await deploy(root, "tenk", {royalties});
    const token_id = await mint(tenk, bob, await totalCost(tenk, 1));

    const paras = await delpoyParas(root, root, root, [tenk]);

    await bob.call(
      paras,
      "storage_deposit",
      {},
      {
        attachedDeposit: ONE_NEAR,
      }
    );
    const msg = JSON.stringify({
      market_type: "sale",
      price: ONE_NEAR.toString(),
      ft_token_ids: "near",
    });
    await bob.call(
      tenk,
      "nft_approve",
      {
        token_id,
        account_id: paras,
        msg,
      },
      {
        attachedDeposit: ONE_NEAR,
      }
    );
    return { tenk, paras, eve, bob };
  }
);

runner.test("buy one", async (t, { root, tenk, paras, bob, eve }) => {
  const bob2 = await root.createAccount("bob2");
  const ids = await nftTokensForOwner(bob, tenk);
  t.is(ids.length, 1);
  const token_id = ids[0].token_id;
  t.log(
    await paras.view("get_market_data", {
      nft_contract_id: tenk.accountId,
      token_id,
    })
  );

  const balance = await root.availableBalance();
  const eveBalance = await eve.availableBalance();
  const bobDelta = await BalanceDelta.create(bob, t);
  const bob2Delta = await BalanceDelta.create(bob2, t);

  const res = await bob2.call_raw(
    paras,
    "buy",
    {
      nft_contract_id: tenk,
      token_id,
    },
    {
      gas: Gas.parse("100 Tgas"),
      attachedDeposit: ONE_NEAR,
    }
  );

  await bob2Delta.isLessOrEqual(ONE_NEAR.neg());
  await bobDelta.isGreaterOrEqual(NEAR.parse("750 mN"));

  t.assert(
    res.logsContain("EVENT_JSON"),
    `Expected EVENT_JSON got ${res.logs}`
  );
  t.log(res.logs);
  t.log(await nftTokensForOwner(bob2, tenk));
  const newBalance = await root.availableBalance();
  t.assert(newBalance.gt(balance));
  t.log(newBalance.sub(balance).toHuman());
  const newEveBalance = await eve.availableBalance();
  t.assert(newEveBalance.gt(eveBalance));
  t.log(newEveBalance.sub(eveBalance).toHuman());
  // t.assert(balance.lt(newBalance));
});
