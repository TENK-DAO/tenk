import { Workspace } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import {
  DEFAULT_SALE,
  deploy,
  getTokens,
  mint,
  mint_raw,
  now,
  totalCost,
} from "./util";

const price = NEAR.parse("0.8 N");
const allowance = 2;

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const alice = await root.createAccount("alice");
    const tenk = await deploy(root, "tenk", {
      sale: {
        ...DEFAULT_SALE,
        price: price.toJSON(),
        allowance,
      }
    });
    return { tenk, alice };
  }
);

runner.test("allowance should allow only 2 tokens", async (t, { root, tenk, alice }) => {
  const cost = await totalCost(tenk, 1, alice.accountId);
  await mint(tenk, alice, cost);
  await mint(tenk, alice, cost);
  let last_try = await mint_raw(tenk, alice, cost);
  t.assert(last_try.failed, "tx didn't fail");
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