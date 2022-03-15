import { Workspace, randomAccountId } from "near-workspaces-ava";
import { ava } from "near-workspaces-ava";
import { NEAR } from "near-units";
import { readFile } from "fs/promises";
import {
  createLinkdrop,
  getTokens,
  checkKey,
  claim,
  hasDelta,
  getDelta,
  create_account_and_claim,
  deploy,
  linkdropCost,
  sleep,
} from "../util";

const base_cost = NEAR.parse("1 N");
const min_cost = NEAR.parse("0.01 N");

if (Workspace.networkIsTestnet()) {
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
          await readFile(`${__dirname}/contracts/testnet.wasm`)
        );
      }
      return { tenk };
    }
  );

  runner.test(
    "Use `claim` to send to existing account with link created with root",
    async (t, { root, tenk }) => {
      const alice = await root.createAccount("alice");
      await sleep(2000);
      t.log(NEAR.from(await tenk.view("token_storage_cost")).toHuman());

      // Create temporary keys for access key on linkdrop
      const [delta, _] = await getDelta(t, tenk, async () => {
        const owner_cost = await linkdropCost(tenk, root.accountId);
        t.log(owner_cost.toHuman());
        const senderKey = await createLinkdrop(t, tenk, root);
        await claim(t, tenk, alice, senderKey);
        t.assert(
          !(await checkKey(senderKey.getPublicKey(), tenk)),
          "key should not exist"
        );
      });
      await delta.isGreaterOrEqual(NEAR.from(0));
      const tokens = await getTokens(tenk, alice);
      t.assert(tokens.length == 1, "should contain only one token");
      t.log(
        `Balance to contract ${
          tenk.accountId
        } after linkdrop is claimed ${await delta.toHuman()}`
      );

      // await deployEmpty(tenk);
    }
  );

  runner.test(
    "Use `claim` to send to existing account with normal account",
    async (t, { root, tenk }) => {
      const alice = await root.createAccount("alice");
      await sleep(2000);
      t.log(NEAR.from(await tenk.view("token_storage_cost")).toHuman());

      // Create temporary keys for access key on linkdrop
      const [delta, _] = await getDelta(t, tenk, async () => {
        const owner_cost = await linkdropCost(tenk, alice.accountId);
        t.log(owner_cost.toHuman());
        const senderKey = await createLinkdrop(t, tenk, alice);
        await claim(t, tenk, alice, senderKey);
        t.assert(
          !(await checkKey(senderKey.getPublicKey(), tenk)),
          "key should not exist"
        );
      });
      await delta.isGreaterOrEqual(NEAR.from(0));
      t.log(await delta.toHuman());
      const tokens = await getTokens(tenk, alice);
      t.assert(tokens.length == 1, "should contain only one token");
      t.log(
        `Balance to contract ${
          tenk.accountId
        } after linkdrop is claimed ${await delta.toHuman()}`
      );

      // await deployEmpty(tenk);
    }
  );

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

  runner.test(
    "Use `create_account_and_claim` with existent account",
    async (t, { root, tenk }) => {
      t.log(root);
      // Create temporary keys for access key on linkdrop
      const senderKey = await createLinkdrop(t, tenk, root);
      // Bad account invalid accountid
      const alice = root;
      const [delta, res] = await getDelta(t, tenk, () =>
        create_account_and_claim(t, tenk, alice.accountId, senderKey)
      );
      await delta.isLessOrEqual(NEAR.parse("1.02 N"));
      const tokens = await getTokens(tenk, root);
      t.log(tokens);

      ///  Currentyl failed linkdrop claims cause the contract to lose funds to gas.
      t.false(
        await checkKey(senderKey.getPublicKey(), tenk),
        "key should not exist"
      );

      // await deployEmpty(tenk);
    }
  );

  runner.test(
    "claim_account_and_claim to create an claim account",
    async (t, { root, tenk }) => {
      const senderKey = await createLinkdrop(t, tenk, root);

      // Create a random subaccount
      const new_account_id = `${randomAccountId("d", 10, 10)}.testnet`;

      // Claim account
      const new_account = await create_account_and_claim(
        t,
        tenk,
        new_account_id,
        senderKey
      );

      t.assert(!(await checkKey(senderKey.getPublicKey(), tenk)));
      const tokens = await getTokens(tenk, new_account);
      t.assert(tokens.length == 1, "should contain only one token");

      // await new_account.delete(root.accountId);
    }
  );
} else {
  ava("skipped on sandbox", (t) => t.assert(true));
}
// Only relevant when not using feature "for_sale"
// runner.test("Owner can create links for free", async (t, { root, tenk }) => {
//   const tenkDelta = await BalanceDelta.create(tenk, t);
//   t.log(tenk.accountId);
//   const [delta, res] = await getDelta(t, root, () =>
//     createLinkdrop(t, tenk, root, NEAR.from(0))
//   );
//   t.log(await tenkDelta.toHuman());
//   await delta.isGreater(NEAR.parse("1.3 mN").neg());
//   ///  Currentyl failed linkdrop claims cause the contract to lose funds to gas.
//   // t.assert(
//   //   !(await checkKey(senderKey.getPublicKey(), tenk)),
//   //   "key should not exist"
//   // );

//   // await deployEmpty(tenk);
// });
