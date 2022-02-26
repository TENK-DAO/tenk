import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { join } from "path";
import { Context } from "near-cli/context";

function binPath(name) {
  const RUST_BIN_FOLDER = ["target", "wasm32-unknown-unknown", "release"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

const CONTRACT_PATH = binPath("tenk");

let initial_royalties = undefined;

initial_royalties = {
  percent: 10_000,
  accounts: {
    "pandastreetcharity.near": 1_000,
    "pandao.near": 500,
    "krai.near": 3_500,
    "pocketrockets.near": 3_500,
    "tenk.sputnik-dao.near": 1_000,
  },
};

const royalties = {
  percent: 1_000,
  accounts: {
    "krai.near": 4_500,
    "pocketrockets.near": 4_500,
    "tenk.sputnik-dao.near": 1_000,
  },
};

const initialArgs = {
  name: "Panda Street",
  symbol: "PANDA",
  // icon,
  uri: "https://bafybeiexwgnm2fjkvtbamu6yha2bol7acux2vy2sw62bnxebcvgqq6drpm.ipfs.dweb.link",
  size: 2172,
  base_cost: NEAR.parse("5 N"),
  min_cost: NEAR.parse("5 N"),
  royalties,
  initial_royalties,
};
const final_cost = NEAR.parse("6 N");
const ZERO_DEPOSIT = NEAR.from(0);

export async function main({ account, nearAPI }: Context) {
  const contractId = account.accountId;
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
