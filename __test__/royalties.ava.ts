import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import { deploy, getDelta, mint, totalCost } from "./util";

if (Workspace.networkIsSandbox()) {
  function createRoyalties({ root, alice, bob, eve }) {
    return {
      accounts: {
        [root.accountId]: 10,
        [alice.accountId]: 10,
        [bob.accountId]: 10,
        [eve.accountId]: 70,
      },
      percent: 20,
    };
  }

  function subaccounts(root: NearAccount): Promise<NearAccount[]> {
    return Promise.all(
      ["bob", "alice", "eve"].map((n) => root.createAccount(n))
    );
  }

  const runner = Workspace.init(
    { initialBalance: NEAR.parse("20 N").toString() },
    async ({ root }) => {
      const [bob, alice, eve] = await subaccounts(root);
      const royalties = createRoyalties({ root, bob, alice, eve });
      const tenk = await deploy(root, "tenk", {
        royalties,
        initial_royalties: royalties,
        base_cost: NEAR.parse("5 N"),
        min_cost: NEAR.parse("5 N"),
      });
      return { tenk, bob, alice, eve };
    }
  );

  runner.test("Get Payout", async (t, { root, tenk, eve, alice, bob }) => {
    const balance = NEAR.parse("500 N");
    const token_id = await mint(tenk, root);
    const payouts = await tenk.view("nft_payout", {
      token_id,
      balance,
      max_len_payout: 10,
    });
    let innerPayout = createRoyalties({ root, bob, alice, eve }).accounts;
    t.log(innerPayout);
    Object.keys(innerPayout).map(
      (key) =>
        (innerPayout[key] = NEAR.parse(`${innerPayout[key]}N`).toString())
    );
    innerPayout[root.accountId] = balance
      .mul(NEAR.from(4))
      .div(NEAR.from(5))
      .add(NEAR.from(innerPayout[root.accountId]))
      .toString();
    const payout = { payout: innerPayout };
    t.deepEqual(payouts, payout);
  });

  runner.test("Initial Payout", async (t, { root, tenk, eve }) => {
    let charlie = await root.createAccount("charlie");
    const cost = await totalCost(tenk, 1);
    let [delta, token_id] = await getDelta(t, eve, async () =>
      mint(tenk, charlie, cost)
    );
    t.log(
      cost.toHuman(),
      await delta.toHuman(),
      cost.mul(NEAR.from(1)).div(NEAR.from(5)).toHuman()
    );
  });
}
