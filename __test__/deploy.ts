import { Runner } from "near-runner";
import { NEAR, Gas } from "near-units";
import * as nearAPI from "near-api-js";
import * as os from "os";
import { CONTRACT_PATH, DEFAULT_INIT_ARGS } from "./utils";

const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(
  os.homedir() + "/.near-credentials"
);
const network = "testnet";

const runner = Runner.create(
  { network, rootAccount: "test.tenk.testnet", homeDir: os.homedir(), keyStore },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    if (rootBalance.lt(NEAR.parse("350 N"))) {
      // @ts-expect-error is private
      await root.manager.addFundsFromNetwork();
    }
    const accountView = await root.accountView();
    if (accountView.code_hash == "11111111111111111111111111111111") {
      const tx = await root
        .createTransaction(root)
        .deployContractFile(CONTRACT_PATH);
      tx.functionCall(
        "new_default_meta",
        DEFAULT_INIT_ARGS(root.accountId, network, NEAR.from(0), NEAR.from(0)),
        {
          gas: Gas.parse("20 TGas"),
        }
      ).signAndSend();
    }

    return {};
  }
);
//@ts-expect-error is private
runner.ready.then(() => {
  // @ts-expect-error is private
  runner.runtime.run(async ({ root }) => {});
});
