import { Workspace } from "near-workspaces-ava";
import { NEAR } from "near-units";
import {
  costPerToken,
  DEFAULT_SALE,
  deploy,
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

runner.test("admin only", async (t, { root, tenk, alice }) => {
  await t.throwsAsync(alice.call(tenk, "update_price", {price: NEAR.parse("1N")}));
});

runner.test("can add admin", async (t, { root, tenk, alice }) => {
  await root.call(tenk, "add_admin", {account_id: alice});
  const price = await costPerToken(tenk, 1);
  await alice.call(tenk, "update_price", {price: NEAR.parse("1N")});
  const newPrice = await costPerToken(tenk,1);
  t.assert(newPrice.eq(NEAR.parse("1N")));
  t.assert(price.lt(newPrice));

  t.deepEqual(await tenk.view("admins"), [alice.accountId]);
});

