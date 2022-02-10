import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/",
  name: "Cute Penguin Club",
  symbol: "cutepenguinclub",
};

const price_structure: tenk.PriceStructure = {
  base_cost: NEAR.parse("3.5 N").toJSON(),
};

const sale: tenk.Sale = {
  initial_royalties: {
    percent: 10_000,
    accounts: {
      "tenk.sputnik-dao.near": 3000,
      "collectiblesdao.sputnik-dao.near": 1000,
      "deadman1854.near": 3000,
      "theduck.near": 3000,
    },
  },
  royalties: {
    percent: 800,
    accounts: {
      "tenk.sputnik-dao.near": 3000,
      "collectiblesdao.sputnik-dao.near": 6000,
      "theduck.near": 1000,
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
    size: 100,
    sale,
    price_structure,
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
