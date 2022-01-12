import { ONE_NEAR, Workspace } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import {
  claim,
  createLinkdrop,
  deploy,
  getTokens,
  mint,
  mint_raw,
  sleep,
  totalCost,
} from "./util";

const sale_price = NEAR.parse("0.8 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const alice = await root.createAccount("alice");
    const tenk = await deploy(root, "tenk", {
      is_premint_over: false,
      base_cost: sale_price,
      min_cost: sale_price,
    });
    return { tenk, alice };
  }
);
// This is currently hard to test without fast forwarding so I think the best to test it fails then add delay.

runner.test("premint", async (t, { root, tenk, alice }) => {
  const cost = await totalCost(tenk, 1, alice.accountId);
  const token = await mint(tenk, root);
  const duration = 20;
  const linkkeys = await createLinkdrop(t, tenk, root);
  await claim(t, tenk, alice, linkkeys);
  await root.call(tenk, "start_premint", { duration });
  const sleepTimer = sleep(1000 * duration);
  await t.throwsAsync(
    root.call(tenk, "end_premint", {
      base_cost: ONE_NEAR,
      min_cost: ONE_NEAR,
    })
  );

  let initial_try = await mint_raw(tenk, alice, cost);
  t.assert(initial_try.failed);
  // owner can still mint
  const second_token = await mint_raw(tenk, root);

  await root.call(tenk, "add_whitelist_account", {
    account_id: alice,
    allowance: 2,
  });
  await mint(tenk, alice, cost);
  await mint(tenk, alice, cost);
  let last_try = await mint_raw(tenk, alice, cost);
  t.assert(last_try.failed);
  const tokens = await getTokens(tenk, alice);
  t.assert(tokens.length == 3);

  await sleepTimer;
  await root.call(tenk, "end_premint", {
    base_cost: ONE_NEAR,
    min_cost: ONE_NEAR,
  });
  const sale_price = await totalCost(tenk, 1, alice.accountId);
  t.assert(sale_price.gt(cost), "actual sale price has increased");

  await mint(tenk, alice, sale_price);
});
