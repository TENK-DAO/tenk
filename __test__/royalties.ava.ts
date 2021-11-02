import { Workspace, NearAccount } from "near-workspaces-ava";
import { NEAR, Gas } from "near-units";
import { ActualTestnet } from "./utils";

const base_cost = NEAR.parse("0 N");
const min_cost = NEAR.parse("0 N");

function getRoyalties({root, alice, bob, eve}) {
  return {
    accounts: {
      [root.accountId]: 10,
      [alice.accountId]: 10,
      [bob.accountId]: 10,
      [eve.accountId]: 70,
    },
    percent: 20,
  }
}

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const owner_id = root.accountId;
    const [bob, alice, eve] = await Promise.all(
      ["bob", "alice", "eve"].map((n) => root.createAccount(n))
    );
    const accounts = {bob, alice, eve};
    const royalties = getRoyalties({root, ...accounts});
    const tenk = await root
      .createTransaction(root.makeSubAccount("tenk"))
      .createAccount()
      .deployContractFile(
        `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`
      );

    const res = await tenk.transfer(NEAR.parse("8 N"))
        .functionCall(
          "new_default_meta",
          {
            owner_id,
            name: "meerkats",
            symbol: "N/A",
            uri: "QmaDR7ozkawfnmEirvErfcJm27FEyFv5U1KQDfWkHGj5qD",
            size: 10_000,
            base_cost,
            min_cost,
            royalties,
          },
          {
            gas: Gas.parse("20 TGas"),
          }
        )
        .signAndSend();        
    return { tenk: root.getAccount("tenk"), bob, alice, eve };
  }
);

runner.test("Get Payout", async (t, { root, tenk, bob, alice, eve }) => {
  const payouts = await tenk.view("nft_payout", {
    token_id: "0",
    balance: "500",
    max_len_payout: 10,
  });
  const payout = getRoyalties({root, bob, alice, eve}).accounts;
  Object.keys(payout).map((key) => payout[key] = `${payout[key]}`);
  t.deepEqual(payouts, { payout })

});
