import { Workspace, NearAccount } from "near-workspaces-ava";
import { NEAR } from "near-units";
import { DEFAULT_SALE, deploy, getDelta, mint, now, totalCost } from "./util";
import { Royalties, Sale } from "..";

if (Workspace.networkIsSandbox()) {
  function createRoyalties({ root, alice, bob, eve }, extra_account?) {
    const percent = extra_account ? 0.952 : 1;
    let res = {
      accounts: {
        [root.accountId]: 1_000 * percent,
        [alice.accountId]: 1_000 * percent,
        [bob.accountId]: 1_000 * percent,
        [eve.accountId]: 7_000 * percent,
      },
      percent: 2_000,
    };

    if (extra_account && percent < 100) {
      res.accounts[extra_account] = 480
    }

    return res;
  }

  function subaccounts(root: NearAccount): Promise<NearAccount[]> {
    return Promise.all(
      ["bob", "alice", "eve"].map((n) => root.createAccount(n))
    );
  }

  const runner = Workspace.init(
    { initialBalance: NEAR.parse("20 N").toString() },
    async ({ root }) => {
      try {
        const [bob, alice, eve] = await subaccounts(root);
        const royalties = createRoyalties({ root, bob, alice, eve });
        const tenk = await deploy(root, "tenk", {
          sale: {
            ...DEFAULT_SALE,
            royalties,
            initial_royalties: royalties,
          }
        });
        return { tenk, bob, alice, eve };
    }
    catch (err) {
      console.log(err);
      process.exit(1);
    }
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
    t.log(payouts);

    let innerPayout = createRoyalties({ root, bob, alice, eve }, "tenk.testnet").accounts;
    t.log(innerPayout);
    Object.keys(innerPayout).map(
      (key) =>
        (innerPayout[key] = NEAR.parse(`${innerPayout[key]}cN`).toString())
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

  function sale(royalties: Royalties): Sale{
    return {...DEFAULT_SALE, royalties}
  }

  runner.test("bad initial payout", async (t, { root }) => {
    let bad_royalties: Royalties = {
      percent: 10000,
      accounts: {
        bob: 10,
      },
    };
    await t.throwsAsync(
      () =>
        deploy(root, "tenk1", {
          sale: sale(bad_royalties)
        }),
      null,
      "too little"
    );
    const [bob, alice, eve] = await subaccounts(root);
    const royalties = createRoyalties({ root, bob, alice, eve });

    await t.throwsAsync(
      () =>
        deploy(root, "tenk2", {
          sale: {
            ...DEFAULT_SALE,
            initial_royalties: bad_royalties,
          }
        }),
      null,
      "too little initial"
    );
  });

  runner.test("too much", async (t, { root }) => {
    let bad_royalties = {
      percent: 10_000,
      accounts: {
        bob: 9_000,
        alice: 1_100,
      },
    };
    await t.throwsAsync(
      () =>
        deploy(root, "tenk1", {
          sale: sale(bad_royalties)
        }),
      null,
      "secondary"
    );
    const [bob, alice, eve] = await subaccounts(root);
    const royalties = createRoyalties({ root, bob, alice, eve });

    await t.throwsAsync(
      () =>
        deploy(root, "tenk2", {
          sale: {
            ...DEFAULT_SALE,
            initial_royalties: bad_royalties,
          }
        }),
      null,
      "initial"
    );
  });
}
