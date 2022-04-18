import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import {
    mint,
    deploy,
    getTokens,
} from "./util";

const base_cost = NEAR.parse("1 N");
const min_cost = NEAR.parse("0.01 N");

const runner = Workspace.init(
    { initialBalance: NEAR.parse("15 N").toString() },
    async ({ root }) => {
        const tenk = await deploy(root, "tenk", { base_cost, min_cost });

        return { tenk };
    }
);


runner.test("mint and burn", async (t, { root, tenk }) => {
    let token_id = await mint(tenk, root);
    let tokens = await getTokens(tenk, root);
    t.is(tokens.length, 1);
    t.is(tokens[0].token_id, token_id);
    await root.call(tenk, "nft_burn", { token_id }, { attachedDeposit: "1" });
    t.log(root.accountId);

    t.is((await getTokens(tenk, root)).length, 0)
});

runner.test("mint and can't burn with different account", async (t, { root, tenk }) => {
  let token_id = await mint(tenk, root);
  let alice = await root.createAccount("alice");
  let tokens = await getTokens(tenk, root);
  t.is(tokens.length, 1);
  t.is(tokens[0].token_id, token_id);
  await t.throwsAsync(alice.call(tenk, "nft_burn", { token_id }, { attachedDeposit: "1" }));
  t.is((await getTokens(tenk, root)).length, 1, "should still have token")
});