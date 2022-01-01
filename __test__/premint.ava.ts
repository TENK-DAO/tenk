import { ONE_NEAR, Workspace } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import { claim, createLinkdrop, deploy, mint, mint_raw, sleep, totalCost } from "./util";

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
  const linkkeys = await createLinkdrop(t, tenk, root);
  t.log(cost.toHuman());
  await claim(t, tenk, alice, linkkeys);
  await root.call(tenk, "start_premint", { duration: 10 });
  const sleepTimer = sleep(1000 * 11);

  let initial_try = await mint_raw(tenk, alice, cost);
  t.assert(initial_try.failed);
  t.log(initial_try.promiseErrorMessages);

  // owner can still mint
  const second_token = await mint(tenk, root);


  await root.call(tenk, "add_whitelist_account", { account_id: alice });
  let try_mint = await mint_raw(tenk, alice, cost);
  t.log(try_mint.parseResult());
  let last_try = await mint_raw(tenk, alice, cost);
  t.assert(last_try.succeeded);
  await sleepTimer;

  await root.call(tenk, "end_premint", {
    base_cost: ONE_NEAR,
    min_cost: ONE_NEAR,
  });
  const sale_price = await totalCost(tenk, 1, alice.accountId);
  t.log(sale_price.toHuman());
  t.assert(sale_price.gt(cost), "actual sale price has increased");
});
