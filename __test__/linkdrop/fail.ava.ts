import {
    Workspace,
    NearAccount,
    randomAccountId,
    createKeyPair,
} from "near-workspaces-ava";
import {
    ava
} from "near-workspaces-ava";
import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import {
    ActualTestnet,
    createLinkdrop,
    getTokens,
    checkKey,
    BalanceDelta,
    claim,
    claim_raw,
    // repeat,
    // zeroDelta,
    hasDelta,
    getDelta,
    create_account_and_claim,
    deploy,
    linkdropCost,
} from "../util";

const base_cost = NEAR.parse("1 N");
const min_cost = NEAR.parse("0.01 N");



const runner = Workspace.init(
    { initialBalance: NEAR.parse("15 N").toString() },
    async ({ root }) => {
        const tenk = await deploy(root, "tenk");
        if (Workspace.networkIsSandbox()) {
            const testnet = root.getFullAccount("testnet");
            await testnet.updateAccount({
                amount: NEAR.parse("1000 N").toString(),
                code_hash: "12XoaQ18TQYJhj9SaZR3MGUjcvgkE8rtKn4ZMCnVG8Lq",
            });
            await testnet.updateContract(
                await readFile(`${__dirname}/../contracts/testnet.wasm`)
            );
        }
        return { tenk };
    }
);

runner.test(
    "Use `claim` to send to existing account without enough gas",
    async (t, { root, tenk }) => {
        const alice = await root.createAccount("alice");
        // Create temporary keys for access key on linkdrop
        const [delta, _] = await getDelta(t, tenk, async () => {
            let [linkDelta, senderKey] = await getDelta(t, root, () =>
                createLinkdrop(t, tenk, root)
            );
            t.log(await linkDelta.toHuman());
            await claim_raw(tenk, alice, senderKey, Gas.parse("50 Tgas"));
            t.assert(
                await checkKey(senderKey.getPublicKey(), tenk),
                "key should still exist"
            );
        });
        await delta.isGreaterOrEqual(NEAR.from(0));

        const tokens = await getTokens(tenk, alice);
        t.assert(tokens.length == 0, "should contain not token");
        t.log(
            `Balance to contract ${
            tenk.accountId
            } after linkdrop is claimed ${await delta.toHuman()}`
        );

        // await deployEmpty(tenk);
    }
);

runner.test(
    "claim_account_and_claim to create an claim account with not enough gas",
    async (t, { root, tenk }) => {
        const senderKey = await createLinkdrop(t, tenk, root);

        // Create a random subaccount
        const new_account_id = `${randomAccountId("d", 10, 10)}.testnet`;

        // Claim account
        const new_account = await create_account_and_claim(
            t,
            tenk,
            new_account_id,
            senderKey,
            Gas.parse("50 Tgas"),
            false
        );

        t.assert(await checkKey(senderKey.getPublicKey(), tenk));
        const tokens = await getTokens(tenk, new_account);
        t.assert(tokens.length == 0, "should contain only one token");

        // await new_account.delete(root.accountId);
    }
);

runner.test(
  "Use `claim` to send to existing account with normal account should fail",
  async (t, { root, tenk }) => {
      const alice = await root.createAccount("alice");
      t.log(NEAR.from(await tenk.view("token_storage_cost")).toHuman());
      const attachedDeposit = await linkdropCost(tenk, alice.accountId);
      t.log(attachedDeposit.toHuman());
      const senderKey = createKeyPair();
      const public_key = senderKey.getPublicKey().toString();
      let res = await alice.call_raw(
        tenk,
        "create_linkdrop",
        {
          public_key,
        },
        {
          attachedDeposit,
          gas: Gas.parse("40 Tgas"),
        }
      );
      t.assert(res.failed, "transaction should fail")

  }
);

// TODO: there is a race condition on the key store.  Either need multiple keys per account,
// runner.test(
//   "Use `claim` to send to existing account back-to-back",
//   async (t, { root, tenk }) => {
//     const contractDelta = await BalanceDelta.create(tenk, t);
//     // Create temporary keys for access key on linkdrop
//     const senderKey = await createLinkdrop(t, tenk, root);
//     t.log("linkdrop cost", await contractDelta.toHuman());
//     const alice = await root.createAccount("alice");
//     const delta = await BalanceDelta.create(root, t);
//     claim_raw(tenk, alice, senderKey);
//     claim_raw(tenk, root, senderKey);
//     await claim_raw(tenk, alice, senderKey);
//     const tokens = await getTokens(tenk, alice);
//     t.log(tokens);
//     t.is(tokens.length, 1, "should contain at least one token");
//     t.assert(
//       !(await checkKey(senderKey.getPublicKey(), tenk)),
//       "key should not exist"
//     );
//     await delta.isGreater();
//     await contractDelta.isZero();
//     // await deployEmpty(tenk);
//   }
// );

runner.test(
    "Use `claim` to send to non-existent account",
    async (t, { root, tenk }) => {
        // Create temporary keys for access key on linkdrop
        const delta = await BalanceDelta.create(tenk, t);
        const senderKey = await createLinkdrop(t, tenk, root);
        // Bad account invalid accountid
        const alice = await root.getFullAccount("alice--");
        t.log(`Delta ${await delta.toHuman()}`);
        await claim_raw(tenk, alice, senderKey);
        t.assert(
            await checkKey(senderKey.getPublicKey(), tenk),
            "key should still exist"
        );
    }
);

const GAS_COST_ON_FAILURE = NEAR.parse("570 μN").neg();

runner.test("Call `claim` with invalid key", async (t, { root, tenk }) => {
    // Create temporary keys for access key on linkdrop
    // const senderKey = await createLinkdrop(t, tenk, root);
    // Bad account invalid accountid
    // const alice = await root.createAccount("alice");
    const senderKey = await root.getKey();
    const res = await paidFailureGas(t, tenk, async () => {
        try {
            await claim_raw(tenk, root, senderKey);
        } catch { }
    });

    // TODO: add back after fix in api -js is released
    // t.assert(res.failed, `${root.accountId} claiming from ${tenk.accountId}`);
});

// runner.test(
//   "Spam `claim` to send to non-existent account",
//   async (t, { root, tenk }) => {
//     // Create temporary keys for access key on linkdrop
//     const senderKey = await createLinkdrop(t, tenk, root);
//     // Bad account invalid accountid
//     const alice = await root.getFullAccount("alice--");
//     const delta = await BalanceDelta.create(tenk, t);

//     await repeat(5, () => claim_raw(tenk, alice, senderKey));
//     debugger;
//     t.log(`Delta ${await delta.toHuman()}`);
//     t.assert(
//       await checkKey(senderKey.getPublicKey(), tenk),
//       "key should still exist"
//     );
//   }
// );

// TODO figure out why this fails on sandbox


function paidFailureGas<T>(t, tenk, fn: () => Promise<T>): Promise<T> {
    return hasDelta<T>(t, tenk, GAS_COST_ON_FAILURE, false, fn);
}

