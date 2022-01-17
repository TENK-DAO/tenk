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
      base_cost: sale_price,
      min_cost: sale_price,
      allowance,
    });
    return { tenk, alice };
  }
);

runner.test("allowance should allow only 2 tokens", async (t, { root, tenk, alice }) => {
  const cost = await totalCost(tenk, 1, alice.accountId);
  await mint(tenk, alice, cost);
  await mint(tenk, alice, cost);
  let last_try = await mint_raw(tenk, alice, cost);
  t.assert(last_try.failed);
  const tokens = await getTokens(tenk, alice);
  t.assert(tokens.length == 2);
});

runner.test("owner has no allowance", async (t, { root, tenk, alice }) => {
  const cost = await totalCost(tenk, 1, alice.accountId);
  await mint(tenk, root, cost);
  await mint(tenk, root, cost);
  let last_try = await mint_raw(tenk, root, cost);
  t.assert(last_try.succeeded);
  const tokens = await getTokens(tenk, root);
  t.assert(tokens.length == 3);
});