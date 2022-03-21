import { Workspace, NearAccount, ONE_NEAR } from "near-workspaces-ava";
import { NEAR, Gas } from "near-units";
import { nftTokensForOwner } from "./util";

const base_cost = NEAR.parse("0 N");
const min_cost = NEAR.parse("0 N");

async function deployEmpty(account: NearAccount): Promise<void> {
  const empty = account.getFullAccount("empty.tn");
  const bytes = await empty.viewCode();
  await account.createTransaction(account).deployContract(bytes).signAndSend();
}

function getRoyalties({ root, alice, bob, eve }) {
  return {
    accounts: {
      [root.accountId]: 10,
      [alice.accountId]: 10,
      [bob.accountId]: 10,
      [eve.accountId]: 70,
    },
    percent: 20,
  };
}

const network = "sandbox";

const PRICE = NEAR.parse("3 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    const owner_id = root;
    const alice = await root.createAccount("alice");
    const bob = await root.createAccount("bob");
    const eve = await root.createAccount("eve");
    const royalties = getRoyalties({ root, bob, alice, eve });
    const tenk = await root.createAndDeploy(
      "tenk",
      `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`,
      {
        method: "new_default_meta",
        args: {
          owner_id,
          name: "meerkats",
          symbol: "N/A",
          uri: "QmaDR7ozkawfnmEirvErfcJm27FEyFv5U1KQDfWkHGj5qD",
          size: 10_000,
          base_cost,
          min_cost,
          royalties,
        },
        gas: Gas.parse("20 TGas"),
      }
    );

    const token_id = (
      (await root.call(
        tenk,
        "nft_mint_one",
        {},
        {
          attachedDeposit: ONE_NEAR,
        }
      )) as any
    ).token_id;

    const mintbase = await root.createAndDeploy(
      "mintbase-market",
      `${__dirname}/contracts/mintbase_marketplace_contract.wasm`,
      {
        method: "new",
        args: {
          init_allowlist: [tenk],
        },
      }
    );

    // await root.call(
    //   mintbase,
    //   "storage_deposit",
    //   {},
    //   {
    //     attachedDeposit: ONE_NEAR,
    //   }
    // );
    const msg = JSON.stringify({
      price: PRICE,
      autotransfer: true,
    });
    await root.call(
      tenk,
      "nft_approve",
      {
        token_id,
        account_id: mintbase,
        msg,
      },
      {
        attachedDeposit: ONE_NEAR,
      }
    );
    return { mintbase, eve, tenk };
  }
);

runner.test("buy one", async (t, { root, tenk, mintbase, eve }) => {
  const bob = await root.createAccount("bob2");
  const ids = await nftTokensForOwner(root, tenk);
  t.is(ids.length, 1);
  const token_id = ids[0].token_id;
  t.log(token_id);
  // t.log(
  //   await mintbase.view("get_market_data", {
  //     nft_contract_id: tenk.accountId,
  //     token_id,
  //   })
  // );

  const balance = await root.availableBalance();
  const eveBalance = await eve.availableBalance();

  await bob.call(
    mintbase,
    "make_offer",
    {
      price: PRICE,
      token_key: `${token_id}:${tenk.accountId}`,
      token_id,
      timeout: {
        Hours: 24,
      },
    },
    {
      gas: Gas.parse("100 Tgas"),
      attachedDeposit: ONE_NEAR,
    }
  );
  t.log(await nftTokensForOwner(bob, tenk));
  const newBalance = await root.availableBalance();
  t.assert(newBalance.gt(balance));
  t.log(newBalance.sub(balance).toHuman());
  const newEveBalance = await eve.availableBalance();
  t.assert(newEveBalance.gt(eveBalance));
  t.log(newEveBalance.sub(eveBalance).toHuman());
  // t.assert(balance.lt(newBalance));
});
