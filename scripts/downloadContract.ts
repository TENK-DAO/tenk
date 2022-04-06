import { JsonRpcProvider } from "near-workspaces";
import * as path from "path";
import * as fs from "fs/promises";

let network: "testnet" | "mainnet" = "testnet";
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Download the binary of a contract");
  console.error("<contract> <network = testnet>");
  process.exit(1);
}

const contract = args[0];

let filePath; // = args[1] || path.join(__dirname,"..", "__test__", "contracts", `${contract}.wasm`);

if (args.length > 1) {
  if (args[1] == "mainnet" || args[1] == "testnet") {
    network = args[1];
  } else {
    filePath = path.join(args[1], `${contract}.wasm`);
  }
}

async function main() {
  const provider = JsonRpcProvider.fromNetwork(network);
  const binary = await provider.viewCode(contract);
  if (filePath) {
    await fs.writeFile(filePath, binary);
  } else {
    process.stdout.write(binary);
  }
}

void main();
