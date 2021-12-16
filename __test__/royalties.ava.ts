import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR, Gas } from "near-units";
import { ActualTestnet, mint } from "./util";

const base_cost = NEAR.parse("0 N");
const min_cost = NEAR.parse("0 N");

function createRoyalties({ root, alice, bob, eve }) {
  return {
    accounts: {
      [root.accountId]: 10,
      [alice]: 10,
      [bob]: 10,
      [eve]: 70,
    },
    percent: 20,
  };
}

function subaccounts(root): string[] {
  return ["bob", "alice", "eve"].map((n) => root.makeSubAccount(n));
}

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const owner_id = root.accountId;
    const [bob, alice, eve] = subaccounts(root);
    // const accounts = { bob, alice, eve };
    const royalties = createRoyalties({ root, bob, alice, eve });
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
          size: 10_000,
          base_cost,
          min_cost,
          royalties,
        },
        initialBalance: NEAR.parse("8 N"),
      }
    );
    // const tenk = await root
    //   .createTransaction(root.makeSubAccount("tenk"))
    //   .createAccount()
    //   .deployContractFile(

    //   );

    // const res = await tenk.transfer(NEAR.parse("8 N"))
    //     .functionCall(
    //       "new_default_meta",
    //       {

    //       },
    //       {
    //         gas: Gas.parse("20 TGas"),
    //       }
    //     )
    //     .signAndSend();
    return { tenk };
  }
);

runner.test("Get Payout", async (t, { root, tenk}) => {
  const balance = NEAR.parse("500 N");
  const token_id = await mint(tenk, root);
  const payouts = await tenk.view("nft_payout", {
    token_id,
    balance,
    max_len_payout: 10,
  });
  const [bob, alice, eve] = subaccounts(root);
  let innerPayout = createRoyalties({ root, bob, alice, eve }).accounts;
  t.log(innerPayout);
  Object.keys(innerPayout).map((key) => (innerPayout[key] = NEAR.parse(`${innerPayout[key]}N`).toString()));
  innerPayout[root.accountId] = balance.mul(NEAR.from(4)).div(NEAR.from(5)).add(NEAR.from(innerPayout[root.accountId])).toString();
  const payout = {payout: innerPayout};
  t.log(payout, payouts);
  t.deepEqual(payouts, payout);

  
});
