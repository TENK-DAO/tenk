import { Workspace, NearAccount } from "near-workspaces-ava";
import { NEAR } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  MINT_ONE_GAS,
  nftTokensForOwner,
  deployEmpty,
  InitArgs,
  binPath,
  DEFAULT_SALE,
} from "./util";

const price = NEAR.parse("1 N");
// const min_cost = NEAR.parse("0.01 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    let tenk = await root.createAndDeploy("tenk", binPath("tenk"));
    let args: InitArgs = {
      owner_id: root.accountId,
      metadata: {
        name: "TENK NFT",
        symbol: "TENK",
        uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link",
      },
      size: 100,
      sale: DEFAULT_SALE,
    };
    await root.call(tenk, "new_default_meta", args);
    return { tenk };
  }
);

runner.test("can get cost per token", async (t, { tenk }) => {
  const cost = await costPerToken(tenk, 1);
  t.deepEqual(cost.toBigInt(), price.toBigInt());
});

async function assertXTokens(t, root: NearAccount, tenk, num) {
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  let args = num == 1 ? {} : { num };
  const res = await root.call_raw(tenk, method, args, {
    attachedDeposit: await totalCost(tenk, num),
    gas: MINT_ONE_GAS,
  });
  t.true(res.succeeded, [res.Failure, ...res.promiseErrorMessages].join("\n"));
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
