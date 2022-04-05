import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import {icon} from "./icon";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeiddy7ndhpd7fiz6i3pc2muuy67r2dtyov6pxssrd3c7ebpyepy6e4.ipfs.dweb.link",
  name: "NEAR Nymphs",
  symbol: "nymphs",
  icon,
};
 

const price = NEAR.parse("2 N").toJSON();
const size = 1969;
const sale: tenk.Sale = {
  price,
  // presale_price,
  mint_rate_limit: 3,
  presale_start: Date.parse("06 April 2022 7:00 UTC"),
  public_sale_start: Date.parse("06 April 2022 19:00 UTC"),
  initial_royalties: {
    percent: 10_000,
    accounts: {
      "tenk.sputnik-dao.near":	1_500,
      "tan.sputnik-dao.near":	1_500,
      "ceaze.near":	7_000,
    },
  },
  royalties: {
    percent: 500,
    accounts: {
      "tenk.sputnik-dao.near": 1_500,
      "tan.sputnik-dao.near": 1_500,
      "ceaze.near": 7_000,
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
    sale.public_sale_start = Date.now();
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
