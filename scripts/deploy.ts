import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/",
  name: "TENK NFT",
  symbol: "TENK",
};
 
const price = NEAR.parse("6.9 N").toJSON();

const sale: tenk.Sale = {
  price,
  presale_start: Date.parse("01 March 2022 9:00 PM UTC"),
  public_sale_start: Date.parse("02 March 2022 9:00 PM UTC"),
  // is_premint_over: true,
  // initial_royalties: {
  //   percent: 10_000,
  //   accounts: {
  //     "tenk.sputnik-dao.near": 1_500,
  //     "kokumo.near": 8_500,
  //   },
  // },
  // royalties: {
  //   percent: 690,
  //   accounts: {
  //     "tenk.sputnik-dao.near": 2500,
  //     "kukumo.near": 2900,
  //     "clownpoop.near": 2300,
  //     "supermariorpg.near": 2300,
  //   },
  // },
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
    size: 100,
    sale,
    price,
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
