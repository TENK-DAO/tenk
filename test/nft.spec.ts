import { Runner, toYocto, createKeyPair, BN, tGas, Account } from "near-runner";

class ActualTestnet extends Account {
  constructor(private name: string) {
    super(null as any);
  }

  get accountId(): string {
    return this.name;
  }
}

const ONE_NFT_STORAGE_COST = "7020000000000000000000";
const ONE_NFT_STORAGE_COST_BN: BN = Runner.networkIsTestnet() ? new BN("7130000000000000000000") : new BN("7020000000000000000000");
const MINT_ONE_GAS = tGas("50");

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

describe(`Running on ${Runner.getNetworkFromEnv()}`, () => {
  jest.setTimeout(60000);
  let runner: Runner;

  beforeAll(async () => {
    runner = await Runner.create(async ({ runtime }) => {
      const tenk = await runtime.createAndDeploy(
        "linkdrop",
        `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`
      );
      const networkLinkdrop = Runner.networkIsTestnet() 
          // Just need accountId "testnet"
        ? new ActualTestnet("testnet")
        // Otherwise use fake linkdrop acconut on sandbox
        : await runtime.createAndDeploy(
            "sandbox",
            `${__dirname}/../target/wasm32-unknown-unknown/release/sandbox_linkdrop.wasm`
          );
      await tenk.call(
        tenk,
        "new_default_meta",
        {
          owner_id: runtime.getRoot().accountId,
          name: "meerkats",
          symbol: "N/A",
          uri: "QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe",
          linkdrop_contract: networkLinkdrop.accountId,
        },
        {
          gas: tGas("20"),
        }
      );
      return { tenk, networkLinkdrop };
    });
  });

  test("mint one", async () => {
    await runner.run(async ({root, tenk}) => {
      const res = await root.call(tenk, "nft_mint_one", {}, {
        attachedDeposit: costOfMinting(1),
        gas: MINT_ONE_GAS
      });
      console.log(res)
    });
  });

  test("mint five", async () => {
    await runner.run(async ({root, tenk}) => {
      const res = await root.call(tenk, "nft_mint_many", {num: 5}, {
        attachedDeposit: costOfMinting(5),
        gas: MINT_ONE_GAS
      });
      console.log(res)
    });
  });

  test("mint six", async () => {
    await expect(async () => await runner.run(async ({root, tenk}) => {
      const res = await root.call(tenk, "nft_mint_many", {num: 6}, {
        attachedDeposit: costOfMinting(6)
      });
      console.log(res)
    })).rejects.toThrow();
  });

  test.only("Use `create_account_and_claim` to create a new account", async () => {
    await runner.run(async ({ root, tenk, networkLinkdrop }, runtime) => {
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
          attachedDeposit: toYocto("3"),
          gas: tGas("300")
        }
      );
      // Create a random subaccount
      const new_account_id = `${randomAccountId()}.${networkLinkdrop.accountId}`;
      const actualKey = createKeyPair();
      const new_public_key = actualKey.getPublicKey().toString();

      let res = await tenk.call(
        tenk,
        "create_account_and_claim",
        {
          new_account_id,
          new_public_key,
        },
        {
          signWithKey: senderKey,
          gas: tGas("300"),
        }
      );
      console.log(JSON.stringify(res, null, 4))

      let new_account = runtime.getAccount(new_account_id, false);
      if (Runner.networkIsTestnet()) {
        console.log(
          `http://explorer.testnet.near.org/accounts/${new_account.accountId}`
        );
      }
      console.log(
        `new account created: ${
          new_account.accountId
        } with balance ${(await new_account.balance()).available} yoctoNear`
      );
      res = await tenk.view("nft_tokens_for_owner", {
        account_id: new_account.accountId,
        from_index: null,
        limit: null
      })
      console.log(JSON.stringify(res, null, 4))
    });
  });

  // test("Use `claim` to transfer to an existing account", async () => {
  //   await runner.run(async ({ root, tenk }, runtime) => {
  //     const bob = await runtime.createAccount("bob");
  //     const originalBalance = await bob.balance();
  //     // Create temporary keys for access key on linkdrop
  //     const senderKey = createKeyPair();
  //     const public_key = senderKey.getPublicKey().toString();

  //     // This adds the key as a function access key on `create_account_and_claim`
  //     await root.call(
  //       tenk,
  //       "send",
  //       {
  //         public_key,
  //       },
  //       {
  //         attachedDeposit: toYocto("2"),
  //       }
  //     );
  //     // can only create subaccounts

  //     let res = await tenk.call_raw(
  //       tenk,
  //       "claim",
  //       {
  //         account_id: bob.accountId,
  //       },
  //       {
  //         signWithKey: senderKey,
  //         gas: tGas("70"),
  //       }
  //     );

  //     const newBalance = await bob.balance();

  //     const originalAvaiable = new BN(originalBalance.available);
  //     const newAvaiable = new BN(newBalance.available);
  //     expect(originalAvaiable.lt(newAvaiable)).toBeTruthy();

  //     console.log(
  //       `${bob.accountId} claimed ${newAvaiable
  //         .sub(originalAvaiable)
  //         .toString()} yoctoNear`
  //     );
  //   });
  // });
});
