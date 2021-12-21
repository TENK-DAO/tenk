import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import { deploy, mint } from "./util";

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

function subaccounts(root: NearAccount): string[] {
  return ["bob", "alice", "eve"].map((n) => root.makeSubAccount(n));
}

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const [bob, alice, eve] = subaccounts(root);
    const royalties = createRoyalties({ root, bob, alice, eve });
    const tenk = await deploy(root, "tenk", {
      royalties,
    });
    return { tenk };
  }
);

runner.test("Get Payout", async (t, { root, tenk }) => {
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
  Object.keys(innerPayout).map(
    (key) => (innerPayout[key] = NEAR.parse(`${innerPayout[key]}N`).toString())
  );
  innerPayout[root.accountId] = balance
    .mul(NEAR.from(4))
    .div(NEAR.from(5))
    .add(NEAR.from(innerPayout[root.accountId]))
    .toString();
  const payout = { payout: innerPayout };
  t.deepEqual(payouts, payout);
});
