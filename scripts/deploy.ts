import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import {icon} from "./icon";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeihmtke7glg2aec5oav5btzlv6ec4fxkbbh4xjre4x5ipaqdxroahe.ipfs.dweb.link",
  name: "BeerPunks",
  symbol: "BP",
  icon,
};

const size = 4_200;
 
const sale: tenk.Sale = {
  price: NEAR.parse("7.77 N").toJSON(),
  presale_price: NEAR.parse("5.55 N").toJSON(),
  mint_rate_limit: 5,
  presale_start: Date.parse("29 April 2022 7:30 AM UTC"),
  public_sale_start: Date.parse("30 April 2022 7:30 AM UTC"),
  allowance: 5,
  // initial_royalties: {
  //   percent: 10_000,
  //   accounts: {
  //     "tenk.sputnik-dao.near": 2_000,
  //     "project.sputnik-dao.near": 2_000,
  //     "mistcop.near": 6_000,
  //   },
  // },
  // royalties: {
  //   percent: 500,
  //   accounts: {
  //     "tenk.sputnik-dao.near": 4_000,
  //     "project.sputnik-dao.near": 2_000,
  //     "mistcop.near": 4_000,
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
