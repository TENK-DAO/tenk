import { Workspace } from "near-workspaces-ava";
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
                presale_start: Date.now(),
                price: price.toJSON(),
                allowance,
            }
        });
        return { tenk, alice };
    }
);

runner.test("public allowance should allow only 2 tokens", async (t, { root, tenk, alice }) => {
    await root.call(tenk, "start_sale", {});
    const cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    let last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed, "tx didn't fail");
    const tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 2);
});

runner.test("owner has unlimited public allowance", async (t, { root, tenk, alice }) => {
    await root.call(tenk, "start_sale", {});
    const cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, root, cost);
    await mint(tenk, root, cost);
    let last_try = await mint_raw(tenk, root, cost);
    t.assert(last_try.succeeded);
    const tokens = await getTokens(tenk, root);
    t.assert(tokens.length == 3);
});


runner.test("presale allowance should only allow 2", async (t, { root, tenk, alice }) => {
    await root.call(tenk, "add_whitelist_accounts", { accounts: [alice], max_allowance: 2 });
    const cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    let last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed, "tx didn't fail");
    const tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 2);
});

runner.test("presale allowance should only allow 2 then 2 in public", async (t, { root, tenk, alice }) => {
    await root.call(tenk, "update_allowance", { allowance: 4 });
    await root.call(tenk, "add_whitelist_accounts", { accounts: [alice], max_allowance: 2 });
    let cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    let last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed, "tx didn't fail");
    let tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 2);

    let info =  await tenk.view<any>("get_user_sale_info", {account_id: alice});
    t.is(info.remaining_allowance, 0)

    await root.call(tenk, "start_sale", {});

    info =  await tenk.view("get_user_sale_info", {account_id: alice});
    t.is(info.remaining_allowance, 2)

    cost = await totalCost(tenk, 1, alice.accountId);
    await mint(tenk, alice, cost);
    await mint(tenk, alice, cost);
    last_try = await mint_raw(tenk, alice, cost);
    t.assert(last_try.failed, "tx didn't fail");
    tokens = await getTokens(tenk, alice);
    t.assert(tokens.length == 4);
});


runner.test("presale allowance should only allow 1", async (t, { root, tenk, alice }) => {
  await root.call(tenk, "add_whitelist_accounts", { accounts: [alice], max_allowance: 1 });
  const cost = await totalCost(tenk, 1, alice.accountId);
  await mint(tenk, alice, cost);
  let last_try = await mint_raw(tenk, alice, cost);
  t.assert(last_try.failed, "tx didn't fail");
  const tokens = await getTokens(tenk, alice);
  t.assert(tokens.length == 1);

  await root.call(tenk, "start_sale", {})
  t.log(await tenk.view("get_sale_info"));

  t.is(await tenk.view("remaining_allowance",{account_id: alice}), 1);

  t.assert(await root.call(tenk, "update_allowance", {}));

  t.is(await tenk.view("remaining_allowance",{account_id: alice}), null);
});