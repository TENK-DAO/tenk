import { Workspace, NearAccount } from "near-workspaces-ava";
import { NEAR } from "near-units";
import {
    InitArgs,
    binPath,
    DEFAULT_SALE,
    mint,
    getTokens,
} from "./util";

const price = NEAR.parse("1 N");
// const min_cost = NEAR.parse("0.01 N");

const runner = Workspace.init(
    { initialBalance: NEAR.parse("15 N").toString() },
    async ({ root }) => {
        let tenk = await root.createAndDeploy("tenk", binPath("tenk"));
        let args: InitArgs = {
            owner_id: root.accountId,
            metadata: {
                name: "TENK NFT",
                symbol: "TENK",
                uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link",
            },
            size: 100,
            sale: DEFAULT_SALE,
        };
        await root.call(tenk, "new_default_meta", args);
        return { tenk };
    }
);


runner.test("mint and burn", async (t, { root, tenk }) => {
    let token_id = await mint(tenk, root);
    let tokens = await getTokens(tenk, root);
    t.is(tokens.length, 1);
    t.is(tokens[0].token_id, token_id);
    await root.call(tenk, "nft_burn", { token_id }, { attachedDeposit: "1" });

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