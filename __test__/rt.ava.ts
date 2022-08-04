import { Workspace, NearAccount, ONE_NEAR } from "near-workspaces-ava";
import { NEAR, Gas } from "near-units";
import {
    nftTokensForOwner,
    mint,
    BalanceDelta,
    deploy,
    totalCost,
    now,
    DEFAULT_SALE,
} from "./util";
import { getRokeToArgs } from "../scripts/utils";


function delpoyRoketo(
    root: NearAccount,
): Promise<NearAccount> {
    const args = getRokeToArgs(root, []);
    return root.createAndDeploy(
        "roketo",
        `${__dirname}/contracts/roketo.wasm`,
        {
            method: "new",
            args
        }
    );
}

const runner = Workspace.init(
    { initialBalance: NEAR.parse("15 N").toString() },
    async ({ root }) => {
        const owner_id = root;
        const rt = await delpoyRoketo(root);
        const tenk = await deploy(root, "tenk", {
            sale: { ...DEFAULT_SALE }, roketo_address: rt.accountId,
        });
        const wrap = await root.createAndDeploy("wrap", `${__dirname}/contracts/wrap.wasm`, { method: "new", args: {} })
        return { tenk, wrap, rt };
    }
);

async function setup_rt(t, { tenk, root, rt, wrap }) {
    await root.call(wrap, "near_deposit", {}, { attachedDeposit: NEAR.parse("1.2 N") });
    await rt.call(wrap, "near_deposit", {}, { attachedDeposit: NEAR.parse("1.2 N") });
    await root.call(rt, "dao_update_token", {
        token: {
            account_id: wrap,
            commission_on_create: "100000000000000000000000",
            is_listed: true,
            is_payment: true,
            storage_balance_needed: "1250000000000000000000",
            commission_coef: { val: 1, pow: -4 },
            gas_for_ft_transfer: '10000000000000',
            gas_for_storage_deposit: '10000000000000',
            commission_on_transfer: '1000000000000000000000',

        }
    }, { attachedDeposit: "1" })
    await root.call(rt, "dao_add_approved_nft", { new_nft_id: tenk }, { attachedDeposit: "1" });
    // t.log(await rt.view("get_dao"));

}

async function attach_stream(t, { root, rt, wrap, bob }): Promise<string> {
    let args = {
        amount: NEAR.parse("1 N"),
        receiver_id: rt,
        memo: "test",
        msg: JSON.stringify({
            Create: { request: { owner_id: root, receiver_id: bob, tokens_per_sec: "385802469135802500" } }
        })
    }

    await root.call(wrap, "ft_transfer_call", args, { attachedDeposit: "1", gas: Gas.parse("100 Tgas") });
    let streams = await rt.view("get_streams");
    // t.log(streams);
    return streams[0].id;
}

async function mint_and_attach_stream() { }

runner.test("buy one", async (t, { root, tenk, wrap, rt }) => {
    const bob = await root.createAccount("bob");
    await setup_rt(t, { tenk, root, wrap, rt });
    let stream_id = await attach_stream(t, { root, rt, wrap, bob });
    let token_id = await mint(tenk, bob);
    // try {
    let res = await root.call_raw(tenk, "attach_stream_to_nft", { token_id, stream_id }, { attachedDeposit: "1110000000000000000000", gas: Gas.parse("200 Tgas") });
    t.log(res.logs)
    t.assert(res.succeeded);
    // t.log(JSON.stringify(res.result, null, 3))
    // } catch (e) {
    //     t.log(JSON.stringify(JSON.parse(e.message).result, null, 3))
    // }

    const alice = await root.createAccount("alice");

    res = await bob.call_raw(tenk, "nft_transfer", { receiver_id: alice, token_id }, { attachedDeposit: "1" });
    t.assert(res.failed);
    res = await bob.call_raw(tenk, "nft_transfer_payout", { receiver_id: alice, token_id, balance: NEAR.parse("1 N") }, { attachedDeposit: "1", gas: Gas.parse("300 Tgas") });
    t.log(Gas.from(res.gas_burnt));

    t.is((await rt.view<{ receiver_id: string }[]>("get_streams"))[0].receiver_id, alice.accountId);
    t.is((await tenk.view<{ owner_id: string }[]>("nft_tokens"))[0].owner_id, alice.accountId);


});