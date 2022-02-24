import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  MINT_ONE_GAS,
  nftTokensForOwner,
  deployEmpty,
  deploy,
  binPath,
} from "./util";

const price = NEAR.parse("1 N");
// const min_cost = NEAR.parse("0.01 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    let tenk = await root.createAndDeploy("tenk", binPath("tenk"));

    await root.call(tenk, "new_default_meta", {
      owner_id: root,
      metadata: {
        name: "TENK NFT",
        symbol: "TENK",
        uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link",
      },
      size: 100,
      price: NEAR.parse("1 N"),
      sale: {
        is_premint_over: true,
      },
    });
    return { tenk };
  }
);

runner.test("can get cost per token", async (t, { root, tenk }) => {
  const cost = await costPerToken(tenk, 1);
  const storageCost = await tokenStorageCost(tenk);
  t.log(
    "One token costs " +
      cost.toHuman() +
      "to buy and " +
      storageCost.toHuman() +
      " to store"
  );
  t.deepEqual(cost.toBigInt(), price.add(storageCost).toBigInt());
  // if (cost.toBigInt() > 0) {
  //   t.assert(cost.gt(await costPerToken(tenk, 24)));
  // }
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
