import { Workspace, JsonRpcProvider } from "near-willem-workspaces";
import * as path from "path";
import * as fs from "fs/promises";

const args = process.argv.slice(2);
let network: "testnet" | "mainnet" = "testnet";

if (args.length < 1) {
  console.error("<contract> <network = testnet>");
  process.exit(1);
}

const contract = args[0];

let filePath = path.join(__dirname, "contracts", `${contract}.wasm`);

if (args.length > 1) {
  if (args[1] == "mainnet" || args[1] == "testnet") {
    network = args[1];
  } else {
    filePath = path.join(args[1], `${contract}.wasm`);
  }
}

// Workspace.open(
//   { network: "sandbox", rootAccount: "eve.testnet" },
//   async ({ root }) => {
async function main() {
  const provider = JsonRpcProvider.fromNetwork(network);
  const binary = await provider.viewCode(contract);
  process.stdout.write(binary);
  // await fs.writeFile(filePath, binary);
  //   }
  // );
}

main();
