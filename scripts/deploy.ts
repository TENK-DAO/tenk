import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import {icon} from "./icon";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeiftfhiz2ya62htk3gzshq7mbdl4veykmwf37mhvlup7yztixbcb7e.ipfs.dweb.link",
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
  initial_royalties: {
    percent: 10_000,
    accounts: {
      "beerverse.near": 4_250,
      "tenk.sputnik-dao.near": 1_500,
      "beerpunks.near": 4_250,
    },
  },
  royalties: {
    percent: 1_000,
    accounts: {
      "beerverse.near": 4_250,
      "tenk.sputnik-dao.near": 1_500,
      "beerpunks.near": 4_250,
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
