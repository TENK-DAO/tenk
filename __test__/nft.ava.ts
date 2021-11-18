import {
  Workspace,
  createKeyPair,
  tGas,
  NearAccount,
  KeyPair,
  randomAccountId,
} from "near-willem-workspaces-ava";
import { NEAR, Gas } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  linkdropCost,
  ActualTestnet,
  MINT_ONE_GAS,
  nftTokensForOwner,
  deployEmpty,
  createLinkAndNewAccount,
} from "./util";

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

