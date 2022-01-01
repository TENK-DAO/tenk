const { NEAR, Gas } = require("near-units");
const {readFile} = require("fs/promises");
const {join} = require("path");


function binPath(name) {
  const RUST_BIN_FOLDER = ["target", "wasm32-unknown-unknown", "release"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

const CONTRACT_PATH = binPath("tenk");


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

const uri =
  "https://ipfs.io/ipfs/bafybeihkaal3xdox6sj3gpnptxxu27z5w3hp6jcn7fpctfoa4rkvvibcra";
const icon =
  "https://ipfs.io/ipfs/bafybeihcrg5rv647uq5akyduswxu2fv2mxrsh65c3upbx5nr2p5x6hfwza/tongdao.jpeg";
const name = "TD12 Zodiac Club";
const symbol = "TD12ZC";
const initial_price = NEAR.parse("1.6 N");
// const contractId = "zodiac.tenk.near";

async function main({ account, near, nearAPI }) {
  const contractId = account.accountId;
  const {connection} = near;
  const {
    Account,
    transactions: { deployContract, functionCall },
  } = nearAPI;
  const contractAccount = account ?? new Account(connection, contractId);

  const state = await contractAccount.state();
  // console.log(state);
  // process.exit(0);
  
  const contractBytes = await readFile(CONTRACT_PATH);
  const owner_id = contractId;
  const actions = [deployContract(contractBytes)];

  if (state.code_hash === "11111111111111111111111111111111") {
    actions.push(functionCall("new_default_meta",
    {
      owner_id,
      name,
      symbol,
      icon,
      uri,
      size: 12000,
      base_cost: initial_price,
      min_cost: initial_price,
      royalties,
      initial_royalties,
    }, Gas.parse("50Tgas")));
     console.log("about to initialize")
  }

  await contractAccount.signAndSendTransaction({
    receiverId: contractId,
    actions,
  });
  console.log(`deployed ${contractId}`);
}

module.exports.main = main;