import { ONE_NEAR, Workspace } from "near-workspaces-ava";
import { NEAR } from "near-units";
import {
  claim,
  createLinkdrop,
  deploy,
  getTokens,
  mint,
  mint_raw,
  now,
  sleep,
  start_presale_args,
  totalCost,
} from "./util";

const presale_price = NEAR.parse("0.8 N").toJSON();
const allowance = 2;

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const alice = await root.createAccount("alice");
    const tenk = await deploy(root, "tenk", {
      sale: {
        allowance,
        price: ONE_NEAR.toJSON(),
        presale_price,
      },
    });
    return { tenk, alice };
  }
);

async function premint_period<T>(
  { tenk, root, duration },
  fn: () => Promise<T>
): Promise<T> {
  const public_sale_start = now() + duration * 1_000;
  const args: start_presale_args = { public_sale_start };
  await root.call(tenk, "start_presale", args);
  const sleepTimer = sleep(1000 * duration);
  const res = await fn();
  await sleepTimer;
  return res;
}

runner.test("premint", async (t, { root, tenk, alice }) => {
  const cost = await totalCost(tenk, 1, alice.accountId);
  const token = await mint(tenk, root);
  const duration = 20;
  const linkkeys = await createLinkdrop(t, tenk, root);
  await claim(t, tenk, alice, linkkeys);

  await premint_period({ tenk, root, duration }, async () => {
    // await t.throwsAsync(
    //   root.call(tenk, "end_premint", {
    //     base_cost,
    //     min_cost: base_cost,
    //   })
    // );

    let initial_try = await mint_raw(tenk, alice, cost);
    t.assert(initial_try.failed);
    // owner can still mint
    const second_token = await mint_raw(tenk, root);
    t.assert(second_token.succeeded);

    await root.call(tenk, "add_whitelist_accounts", {
      accounts: [alice],
      allowance: 2,
    });
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    let last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed);
    const tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 3);
  });
  t.log(await tenk.view("get_sale_info"));
  const sale_price = await totalCost(tenk, 1, alice.accountId);
  t.log(sale_price.toHuman(), cost.toHuman());
  t.assert(sale_price.gt(cost), "actual sale price has increased");

  t.assert((await mint_raw(tenk, alice, sale_price)).failed);
  t.assert((await mint_raw(tenk, root, sale_price)).succeeded);
});
