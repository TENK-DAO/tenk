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
const allowance = 2;

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const alice = await root.createAccount("alice");
    const tenk = await deploy(root, "tenk", {
      price_structure: {
        base_cost: sale_price,
        min_cost: sale_price,
      },
      sale: {
        is_premint_over: false,
        allowance,
      },
    });
    return { tenk, alice };
  }
);

async function premint_period<T>(
  { tenk, root, duration, base_cost },
  fn: () => Promise<T>
): Promise<T> {
  await root.call(tenk, "start_premint", { duration });
  const sleepTimer = sleep(1000 * duration);
  const res = await fn();
  await sleepTimer;
  let min_cost = base_cost;
  await root.call(tenk, "end_premint", { base_cost, min_cost });
  return res;
}

runner.test("premint", async (t, { root, tenk, alice }) => {
  t.log(tenk.accountId)
  // const cost = await totalCost(tenk, 1, alice.accountId);
  const token = await mint(tenk, root);
  const duration = 20;
  const linkkeys = await createLinkdrop(t, tenk, root);
  await claim(t, tenk, alice, linkkeys);
  const base_cost = ONE_NEAR;

  await premint_period({ tenk, root, duration, base_cost }, async () => {
    await t.throwsAsync(
      root.call(tenk, "end_premint", {
        base_cost,
        min_cost: base_cost,
      })
    );

    let initial_try = await mint_raw(tenk, alice, sale_price);
    t.assert(initial_try.failed);
    // owner can still mint
    const second_token = await mint_raw(tenk, root);
    t.assert(second_token.succeeded);

    await root.call(tenk, "add_whitelist_accounts", {
      accounts: [alice],
      allowance: 2,
    });
    t.log((await totalCost(tenk, 3, alice.accountId)).toHuman());
    const cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    let last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed);
    const tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 3);
  });
  const cost = await totalCost(tenk, 1, alice.accountId);
  t.log(sale_price.toHuman(), cost.toHuman());
  t.assert(sale_price.gt(cost), "actual sale price has increased");

  t.assert((await mint_raw(tenk, alice, sale_price)).failed);
  t.assert((await mint_raw(tenk, root, sale_price)).succeeded);
});
