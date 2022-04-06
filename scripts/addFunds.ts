import { Workspace, NEAR } from "near-workspaces";

const network = "testnet";
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Fund a testnet acount with 200N");
  console.error("<testnetAccount>");
  process.exit(1);
}

const rootAccount = args[0];


void Workspace.open(
  { network, rootAccount },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();
      // @ts-expect-error is private
    await root.manager.addFundsFromNetwork();
  }
);
