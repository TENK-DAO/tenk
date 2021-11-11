import { Workspace } from "near-workspaces";
import { NEAR, Gas } from "near-units";
import { CONTRACT_PATH, DEFAULT_INIT_ARGS } from "./utils";

const network = "testnet";

Workspace.open(
  { network, rootAccount: "minimofan0.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    if (rootBalance.lt(NEAR.parse("350 N"))) {
      // @ts-expect-error is private
      await root.manager.addFundsFromNetwork();
    }
  }
);
