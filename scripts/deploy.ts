import { Workspace, NEAR, Gas } from "near-willem-workspaces";

import { CONTRACT_PATH } from "../__test__/util/bin";

const network = "testnet";
const uri =
  "https://bafybeiffwsfco67klvesltd7yavfpdf5jov2a27ykhcyhoqhih7f6lrkmu.ipfs.dweb.link/";

const sale_price = NEAR.parse("0.8 N");

const initial_royalties = {
  percent: 100,
  accounts: {
    "tenk.sputnik-dao.near": 2,
    "near-cn-nft-club.sputnik-dao.near": 15,
    "ca2079.sputnik-dao.near": 83,
  },
};

const royalties = {
  percent: 10,
  accounts: { "tenk.sputnik-dao.near": 20, "ca2079.sputnik-dao.near": 80 },
};

const icon = "https://bafybeihcrg5rv647uq5akyduswxu2fv2mxrsh65c3upbx5nr2p5x6hfwza.ipfs.dweb.link/tongdao.jpeg";
const name = "TD12 Zodiac Club";
const symbol= "TD12ZC";
const initial_price = NEAR.parse("1.6 N");
const contract = "zodiac.tenk.near"

void Workspace.open(
  { network, rootAccount: "tongv0.tenk.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
    // if (rootBalance.lt(NEAR.parse("350 N"))) {
    //   // @ts-expect-error is private
    //   await root.manager.addFundsFromNetwork();
    // }

    const royalties = {
      accounts: { "tenk.testnet": 20, meta: 70, "eve.testnet": 10 },
      percent: 20,
    };
    const accountView = await root.accountView();
    const owner_id = root.accountId;
    if (accountView.code_hash == "11111111111111111111111111111111") {
      const tx = await root
        .createTransaction(root)
        .deployContractFile(CONTRACT_PATH);
      await tx
        .functionCall(
          "new_default_meta",
          {
            owner_id,
            name,
            symbol,
            icon,
            uri,
            size: 12000,
            base_cost: sale_price,
            min_cost: sale_price,
            royalties,
            initial_royalties: royalties,
          },
          {
            gas: Gas.parse("20 TGas"),
          }
        )
        .signAndSend();
    }
  }
);
