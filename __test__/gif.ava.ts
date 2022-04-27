import { Workspace, NearAccount } from "near-workspaces-ava";
import { NEAR } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  MINT_ONE_GAS,
  nftTokensForOwner,
  deployEmpty,
  InitArgs,
  binPath,
  DEFAULT_SALE,
} from "./util";

const price = NEAR.parse("1 N");
// const min_cost = NEAR.parse("0.01 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    let tenk = await root.createAndDeploy("tenk", binPath("tenk"));
    let args: InitArgs = {
      owner_id: root.accountId,
      metadata: {
        name: "TENK NFT",
        symbol: "TENK",
        uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link",
      },
      size: 100,
      sale: DEFAULT_SALE,
    };
    await root.call(tenk, "new_default_meta", args);
    return { tenk };
  }
);

runner.test("can mint special", async (t, { tenk, root }) => {
  let token = await root.call(tenk, "mint_special", {});
  console.log(token);
});
