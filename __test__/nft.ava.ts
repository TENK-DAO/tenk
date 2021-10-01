import {
  Runner,
  createKeyPair,
  BN,
  tGas,
  NearAccount,
  Account,
} from "near-runner-ava";
import { NEAR, Gas } from "near-units";

class ActualTestnet extends Account {
  constructor(private name: string) {
    super(null as any, null as any);
  }

  get accountId(): string {
    return this.name;
  }
}
const KEY_ALLOWANCE = NEAR.parse("2 N");
const ONE_NFT_STORAGE_COST_BN: NEAR = Runner.networkIsTestnet()
  ? NEAR.parse("7.18 mN")
  : NEAR.parse("7.56 mN");
const MINT_ONE_GAS = Gas.parse("300 TGas");

function costOfMinting(num: number): string {
  return ONE_NFT_STORAGE_COST_BN.mul(new BN(num)).toString();
}

/* Contract API for reference
impl Linkdrop {
  pub fn create_account(new_account_id: &str, new_public_key: &str){}
  pub fn get_key_balance(public_key: &str){}
  pub fn send(public_key: &str){}
  pub fn create_account_and_claim(new_account_id: &str, new_public_key: &str){}
  pub fn on_account_created(predecessor_account_id: &str, amount: &str){}
  pub fn on_account_created_and_claimed(amount: &str){}
  pub fn claim(account_id: &str){}
}
*/

function randomAccountId(): string {
  let accountId;
  // create random number with at least 7 digits
  const randomNumber = Math.floor(Math.random() * (9999 - 1000) + 1000);
  accountId = `${Date.now()}-${randomNumber}`;
  return accountId;
}

async function costOf(tenk: NearAccount, num: number): Promise<NEAR> {
  return NEAR.from(await tenk.view("cost_per_token", { num }));
}

async function discount(tenk: NearAccount, num: number): Promise<NEAR> {
  return NEAR.from(await tenk.view("discount", { num }));
}

async function tokenStorageCost(tenk: NearAccount): Promise<NEAR> {
  return NEAR.from(await tenk.view("token_storage_cost"));
}

// async function deployContract(account?: Account): Promise<Account> {
// return
// }

const base_cost = NEAR.parse("10 N");
const min_cost = NEAR.parse("1 N");

const runner = Runner.create(async ({ root }) => {
  const network: NearAccount = Runner.networkIsTestnet()
    ? // Just need accountId "testnet"
      new ActualTestnet("testnet")
    : // Otherwise use fake linkdrop acconut on sandbox
      await root.createAndDeploy(
        "sandbox",
        `${__dirname}/../target/wasm32-unknown-unknown/release/sandbox_linkdrop.wasm`
      );
  const owner_id = root;
  const linkdrop_contract = network.accountId;
  const tenk = await root.createAndDeploy(
    "tenk",
    `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`,
    {
      method: "new_default_meta",
      args: {
        owner_id,
        name: "meerkats",
        symbol: "N/A",
        uri: "QmaDR7ozkawfnmEirvErfcJm27FEyFv5U1KQDfWkHGj5qD",
        linkdrop_contract,
        size: 10_000,
        base_cost,
        min_cost,
      },
      gas: Gas.parse("20 TGas"),
    }
  );
  return { tenk, network };
});

runner.test("can get cost per token", async (t, { tenk }) => {
  const cost = await costOf(tenk, 1);
  t.log(cost.toHuman());
  // const delta = await discount(tenk, 24);
  // t.log(delta.toHuman())
  t.log((await tokenStorageCost(tenk)).toHuman());
  t.deepEqual(
    cost.toBigInt(),
    base_cost.add(await tokenStorageCost(tenk)).toBigInt()
  );
  t.true(cost.gt(await costOf(tenk, 24)));
  t.log(
    "One token costs " +
      NEAR.from(await tenk.view("token_storage_cost")).toHuman()
  );
});

async function nftTokensForOwner(root, tenk, from_index = null, limit = null) {
  return tenk.view("nft_tokens_for_owner", {
    account_id: root,
    from_index,
    limit,
  });
}

async function assertXTokens(t, root, tenk, num) {
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  const args = num == 1 ? {} : {num}
  const res = await root.call(
    tenk,
    method,
    args,
    {
      attachedDeposit: costOfMinting(num),
      gas: MINT_ONE_GAS,
    }
  );
  t.log(res);
  t.is(num, (await nftTokensForOwner(root, tenk)).length);
}

[["one", 1], ["five",5] , ["ten",10]].forEach(async ([num, x]) => {
  runner.test("mint " + num, async (t, { root, tenk }) => {
    await assertXTokens(t, root, tenk, x);
  });
})

// runner.test("mint six", async () => {
//   await expect(async () => {
//     await runner.run(async ({ root, tenk }) => {
//       let num = 24;
//       try {
//         while (true) {
//           await root.call(
//             tenk,
//             "nft_mint_many",
//             { num },
//             {
//               attachedDeposit: await costOf(tenk, num),
//               gas: tGas("300"),
//             }
//           );
//           num++;
//         }
//       } catch (e) {
//         t.log(e);
//         t.log(`Minted ${num - 1} in one transaction`);
//         throw e;
//       }
//     });
//   }).rejects.toThrow();
// });

runner.test(
  "Owner uses `create_account_and_claim` to create a new account",
  async (t, { root, tenk, network }) => {
    // Create temporary keys for access key on linkdrop
    const senderKey = createKeyPair();
    const public_key = senderKey.getPublicKey().toString();

    // This adds the key as a function access key on `create_account_and_claim`
    await root.call(
      tenk,
      "create_linkdrop",
      {
        public_key,
      },
      {
        attachedDeposit: KEY_ALLOWANCE.add(await costOf(tenk, 1)),
        gas: tGas("100"),
      }
    );
    // Create a random subaccount
    const new_account_id = `${randomAccountId()}.${network.accountId}`;
    const actualKey = createKeyPair();
    const new_public_key = actualKey.getPublicKey().toString();

    let res = await tenk.call_raw(
      tenk,
      "create_account_and_claim",
      {
        new_account_id,
        new_public_key,
      },
      {
        signWithKey: senderKey,
        gas: tGas("200"),
      }
    );
    //@ts-ignore
    t.log(res.errors.map(e => e.ActionError?.kind));

    let new_account = root.getFullAccount(new_account_id);
    if (Runner.networkIsTestnet()) {
      t.log(
        `http://explorer.testnet.near.org/accounts/${new_account.accountId}`
      );
    }
    t.log(
      `new account created: ${new_account.accountId} with balance ${
        (await new_account.balance()).available
      } yoctoNear`
    );

    t.is(1, (await nftTokensForOwner(new_account, tenk)).length);
  }
);

// runner.test(
//   "Use `create_account_and_claim` to create a new account",
//   async (t, { root, tenk, network }) => {
//     // Create temporary keys for access key on linkdrop
//     const senderKey = createKeyPair();
//     const public_key = senderKey.getPublicKey().toString();
//     const alice = await root.createAccount("alice");

//     // This adds the key as a function access key on `create_account_and_claim`
//     await alice.call(
//       tenk,
//       "create_linkdrop",
//       {
//         public_key,
//       },
//       {
//         attachedDeposit: KEY_ALLOWANCE.add(await costOf(tenk, 1)),
//         gas: tGas("100"),
//       }
//     );
//     // Create a random subaccount
//     const new_account_id = `${randomAccountId()}.${network.accountId}`;
//     const actualKey = createKeyPair();
//     const new_public_key = actualKey.getPublicKey().toString();

//     let res = await tenk.call(
//       tenk,
//       "create_account_and_claim",
//       {
//         new_account_id,
//         new_public_key,
//       },
//       {
//         signWithKey: senderKey,
//         gas: tGas("200"),
//       }
//     );
//     t.log(res);

//     let new_account = root.getFullAccount(new_account_id);
//     if (Runner.networkIsTestnet()) {
//       t.log(
//         `http://explorer.testnet.near.org/accounts/${new_account.accountId}`
//       );
//     }
//     t.log(
//       `new account created: ${new_account.accountId} with balance ${
//         (await new_account.balance()).available
//       } yoctoNear`
//     );
//     res = await tenk.view("nft_tokens_for_owner", {
//       account_id: new_account.accountId,
//       from_index: null,
//       limit: null,
//     });
//     t.log(res);
//   }
// );
