// import { Workspace, NearAccount } from "near-workspaces-ava";
// import { NEAR } from "near-units";
// import {
//   costPerToken,
//   tokenStorageCost,
//   totalCost,
//   MINT_ONE_GAS,
//   nftTokensForOwner,
//   deployEmpty,
//   deploy,
// } from "./util";

// const base_cost = NEAR.parse("1 N");
// const min_cost = NEAR.parse("0.01 N");

// const runner = Workspace.init(
//   { initialBalance: NEAR.parse("15 N").toString() },
//   async ({ root }) => {
//     const tenk = await deploy(root, "tenk", { price_structure: {base_cost, min_cost}, size: 2 });
//     return { tenk };
//   }
// );

// runner.test("token ids start at 1", async (t, { root, tenk }) => {
//   const tokens: { token_id: string }[] = await root.call(
//     tenk,
//     "nft_mint_many",
//     { num: 2 },
//     { attachedDeposit: NEAR.parse("2.1 N") }
//   );
//   const token_ids = tokens.map((t) => t.token_id);
//   t.is(token_ids.length, 2);
//   t.true(token_ids.includes("1"));
//   t.true(token_ids.includes("2"));
// });
