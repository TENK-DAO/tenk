import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import { icon } from "./icon";

const metadata: tenk.InitialMetadata = {
  uri,
  name: "NEAR Extinct Heroes",
  symbol: "extinctheroes",
  icon,
};

const size = 2000;

const sale: tenk.Sale = {
  presale_start: Date.parse("03 Mar 2022 18:00 UTC"),
  public_sale_start: Date.parse("04 Mar 2022 17:00 UTC"),
  price: NEAR.parse("5 N").toJSON(),

  // is_premint_over: true,
  initial_royalties: {
    percent: 10_000,
    accounts: {
      "tenk.sputnik-dao.near": 2_000,
      "neh.sputnik-dao.near": 5_000,
      "anthonypacheco.near": 2_000,
      "isaacwilson.near": 1_000,
    },
  },
  royalties: {
    percent: 800,
    accounts: {
      "tenk.sputnik-dao.near": 2_000,
      "neh.sputnik-dao.near": 5_000,
      "anthonypacheco.near": 2_000,
      "isaacwilson.near": 1_000,
    },
  },
};

export async function main({ account, nearAPI, argv, near }: Context) {
  let { Account } = nearAPI;
  const contractBytes = await readFile(binPath("tenk"));

  let [contractId] = argv ?? [];
  contractId = contractId ?? account.accountId;
  let contractAccount = new Account(near.connection, contractId);

  const isTestnet = contractId.endsWith("testnet");
  if (isTestnet) {
    sale.initial_royalties = null;
  }
  const initialArgs = {
    owner_id: account.accountId,
    metadata,
    size,
    sale,
  };

  const contract = new tenk.Contract(account, contractId);

  const tx = account
    .createTransaction(contractId)
    .deployContract(contractBytes);

  if (await contractAccount.hasDeployedContract()) {
    console.log(`initializing with: \n${JSON.stringify(initialArgs, null, 2)}`);
    tx.actions.push(
      contract.new_default_metaTx(initialArgs, { gas: Gas.parse("50Tgas") })
    );
  }
  let res = await tx.signAndSend();
  console.log(
    `https://explorer${isTestnet ? ".testnet" : ""}.near.org/transactions/${
      res.transaction_outcome.id
    }`
  );
  //@ts-ignore
  if (res.status.SuccessValue != undefined) {
    console.log(`deployed ${contractId}`);
  } else {
    console.log(res);
  }
}
