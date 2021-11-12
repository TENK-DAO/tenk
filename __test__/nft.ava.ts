import {
  Workspace,
  createKeyPair,
  tGas,
  NearAccount,
  KeyPair,
  randomAccountId,
} from "near-workspaces-ava";
import { NEAR, Gas } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  linkdropCost,
  ActualTestnet,
  MINT_ONE_GAS,
} from "./utils";
import { nftTokensForOwner, deployEmpty } from "./util";

const base_cost = NEAR.parse("1 N");
const min_cost = NEAR.parse("0.01 N");



const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    const network: NearAccount = Workspace.networkIsTestnet()
      ? // Just need accountId "testnet"
        new ActualTestnet("testnet")
      : // Otherwise use fake linkdrop acconut on sandbox
        await root.createAccountFrom({
          testnetContract: "testnet",
          withData: false,
        });
    const owner_id = root;
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
        },
        gas: Gas.parse("20 TGas"),
      }
    );
    return { tenk, network };
  }
);

runner.test("can get cost per token", async (t, { tenk }) => {
  const cost = await costPerToken(tenk, 1);
  t.log(cost.toHuman());
  // const delta = await discount(tenk, 24);
  // t.log(delta.toHuman())
  t.log((await tokenStorageCost(tenk)).toHuman());
  t.deepEqual(
    cost.toBigInt(),
    base_cost.add(await tokenStorageCost(tenk)).toBigInt()
  );
  if (cost.toBigInt() > 0) {
    t.assert(cost.gt(await costPerToken(tenk, 24)));
  }
  t.log(
    "One token costs " +
      NEAR.from(await tenk.view("token_storage_cost")).toHuman()
  );
});



async function assertXTokens(t, root: NearAccount, tenk, num) {
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  let args = num == 1 ? {} : { num };
  let balance = await tenk.availableBalance();
  let storage = (await tenk.accountView()).storage_usage;
  const res = await root.call_raw(tenk, method, args, {
    attachedDeposit: await totalCost(tenk, num),
    gas: MINT_ONE_GAS,
  });
  // t.log(res);
  t.log(balance.sub(await tenk.availableBalance()).toString());
  t.log((await tenk.accountView()).storage_usage - storage);
  t.is(num, (await nftTokensForOwner(root, tenk)).length);
  if (num == 30 && Workspace.networkIsTestnet()) {
    await deployEmpty(tenk);
  }
}

[
  ["one", 1],
  ["two", 2],
  ["five", 5],
  ["ten", 10],
  // ["thirty", 30],
].forEach(async ([num, x]) => {
  runner.test("mint " + num, async (t, { root, tenk }) => {
    await assertXTokens(t, root, tenk, x);
  });
});

runner.test(
  "Owner uses `create_account_and_claim` to create a new account",
  async (t, { root, tenk, network }, runtime) => {
    // Create temporary keys for access key on linkdrop
    const senderKey = createKeyPair();
    const public_key = senderKey.getPublicKey().toString();
    // const linkdrop_cost

    const contractStorage = (await tenk.accountView()).storage_usage;
    // This adds the key as a function access key on `create_account_and_claim`
    t.log((await linkdropCost(tenk)).toHuman());
    await root.call(
      tenk,
      "create_linkdrop",
      {
        public_key,
      },
      {
        attachedDeposit: await linkdropCost(tenk),
        gas: tGas("100"),
      }
    );
    t.log((await tenk.accountView()).storage_usage - contractStorage);

    // Create a random subaccount
    const new_account_id = `${randomAccountId("d", 10, 10)}.${
      network.accountId
    }`;
    const actualKey = createKeyPair();
    const new_public_key = actualKey.getPublicKey().toString();
    t.log(new_account_id);

    await tenk.call_raw(
      tenk,
      "create_account_and_claim",
      {
        new_account_id,
        new_public_key,
      },
      {
        signWithKey: senderKey,
        gas: tGas("100"),
      }
    );

    let new_account = root.getFullAccount(new_account_id);
    new_account.setKey(actualKey);
    t.log(
      `new account created: ${new_account.accountId} with balance ${
        (await new_account.balance()).available
      } yoctoNear`
    );
    t.is(1, (await nftTokensForOwner(new_account, tenk)).length);
    if (Workspace.networkIsTestnet()) {
      t.log(
        `http://explorer.testnet.near.org/accounts/${new_account.accountId}`
      );
      // Must delete since created account via linkdrop
      await new_account.delete(root.accountId);
      await deployEmpty(tenk);
    }
  }
);

function claim(tenk: NearAccount, alice: NearAccount, signWithKey: KeyPair) {
  return tenk.call(
    tenk,
    "claim",
    {
      account_id: alice,
    },
    {
      signWithKey,
      gas: tGas("200"),
    }
  );
}
runner.test(
  "Use `claim` to send to existing account",
  async (t, { root, tenk, network }) => {
    // Create temporary keys for access key on linkdrop
    const senderKey = createKeyPair();
    const public_key = senderKey.getPublicKey().toString();
    const alice = await root.createAccount("alice");

    // This adds the key as a function access key on `create_account_and_claim`
    await root.call(
      tenk,
      "create_linkdrop",
      {
        public_key,
      },
      {
        attachedDeposit: await linkdropCost(tenk),
        gas: tGas("100"),
      }
    );

    await claim(tenk, alice, senderKey);

    const tokens: any[] = await tenk.view("nft_tokens_for_owner", {
      account_id: alice,
      from_index: null,
      limit: null,
    });
    t.assert(tokens.length > 0, "should contain at least one token");

    if (Workspace.networkIsTestnet()) {
      await deployEmpty(tenk);
    }
  }
);
