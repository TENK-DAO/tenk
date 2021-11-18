import { Workspace, NEAR, Gas } from "near-willem-workspaces";

import { CONTRACT_PATH, DEFAULT_INIT_ARGS } from "./util";

const network = "testnet";

Workspace.open(
  { network, rootAccount: "minimo.tenk.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    // if (rootBalance.lt(NEAR.parse("350 N"))) {
    //   // @ts-expect-error is private
    //   await root.manager.addFundsFromNetwork();
    // }
    const accountView = await root.accountView();
    if (accountView.code_hash == "11111111111111111111111111111111") {
      const tx = await root
        .createTransaction(root)
        .deployContractFile(CONTRACT_PATH);
      tx.functionCall(
        "new_default_meta",
        DEFAULT_INIT_ARGS(root.accountId, NEAR.from(0), NEAR.from(0)),
        {
          gas: Gas.parse("20 TGas"),
        }
      ).signAndSend();
    }
  }
);
