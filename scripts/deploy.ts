import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { join } from "path";
import { Context } from "near-cli/context";


const sale_price = NEAR.parse("0.8 N");


const metadata = {
  uri: "https://bafybeicdbhp5hntuiwkfpfftjv4oxkjkmbhvsytgj3xga5ebysbzi6y4gm.ipfs.dweb.link",
  name: "Kokumo KongZ",
  symbol: "KongZ",
  icon: "https://bafkreiaboggro5ri5eeujb6xzyjbwe45q4w2cp7o3pg5uvjtic6lllkx2i.ipfs.dweb.link",
};

const sale = {
  initial_royalties: {
    percent: 10_000,
    accounts: {
      "tenk.sputnik-dao.near": 1_500,
      "kokumo.near": 8_500,
    },
  },
  royalties: {
    percent: 690,
    accounts: {
      "tenk.sputnik-dao.near": 2500,
      "kukumo.near": 2900,
      "clownpoop.near": 2300,
      "supermariorpg.near": 2300,
    },
  },
};


function binPath(name) {
  const RUST_BIN_FOLDER = ["target", "wasm32-unknown-unknown", "release"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

const CONTRACT_PATH = binPath("tenk");

const initialArgs = {
  metadata,
  size: 5000,
  sale,
  price_structure: {
    base_cost: NEAR.parse("5 N"),
    min_cost: NEAR.parse("5 N"),
  },
};

const ZERO_DEPOSIT = NEAR.from(0);

export async function main({ account, nearAPI }: Context) {
  const contractId = account.accountId;
  if (contractId.endsWith("testnet")) {
    sale.initial_royalties = null;
  }
  const {
    transactions: { deployContract, functionCall },
  } = nearAPI;
  const contractAccount = account;
  const state = await contractAccount.state();
  const contractBytes = await readFile(CONTRACT_PATH);
  const owner_id = contractId;
  const actions = [deployContract(contractBytes)];

  if (state.code_hash === "11111111111111111111111111111111") {
    actions.push(
      functionCall(
        "new_default_meta",
        { owner_id, ...initialArgs },
        Gas.parse("50Tgas"),
        ZERO_DEPOSIT
      )
    );
    console.log("about to initialize");
  }

  // @ts-expect-error currently private
  let res = await contractAccount.signAndSendTransaction({
    receiverId: contractId,
    actions,
  });
  //@ts-ignore
  if (res.status.SuccessValue != undefined) {
    console.log(`deployed ${contractId}`);
  } else {
    console.log(res)
  }
}