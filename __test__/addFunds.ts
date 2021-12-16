import { Workspace, NEAR } from "near-willem-workspaces";

const network = "testnet";

Workspace.open(
  { network, rootAccount: "testnetv0.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    if (rootBalance.lt(NEAR.parse("350 N"))) {
      // @ts-expect-error is private
      await root.manager.addFundsFromNetwork();
    }
  }
);
