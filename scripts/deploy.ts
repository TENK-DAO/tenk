import { Workspace, NEAR, Gas } from "near-willem-workspaces";

import { CONTRACT_PATH } from "../__test__/util/bin";

const network = "testnet";
const uri = "https://bafybeiffwsfco67klvesltd7yavfpdf5jov2a27ykhcyhoqhih7f6lrkmu.ipfs.dweb.link/"

const sale_price = NEAR.parse("0.8 N");

void Workspace.open(
  { network, rootAccount: "tongv0.tenk.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    // if (rootBalance.lt(NEAR.parse("350 N"))) {
    //   // @ts-expect-error is private
    //   await root.manager.addFundsFromNetwork();
    // }

    const royalties = {accounts: {"tenk.testnet": 20, "meta":70, "eve.testnet":10}, percent: 20};
    const accountView = await root.accountView();
    const owner_id = root.accountId;
    if (accountView.code_hash == "11111111111111111111111111111111") {
      const tx = await root
        .createTransaction(root)
        .deployContractFile(CONTRACT_PATH);
      await tx.functionCall(
        "new_default_meta",
        {
            owner_id,
            name: "tongdao",
            symbol: "TONG",
            uri,
            size: 1111,
            base_cost: sale_price,
            min_cost: sale_price,
            royalties,
            initial_royalties: royalties,
          
        },
        {
          gas: Gas.parse("20 TGas"),
        }
      ).signAndSend();
    }
  }
);
