import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";


async function burn_tokens(contract: Contract): Promise<void> {
  const total_tokens = await contract.total_tokens();
  const num_to_burn = Math.min(300, total_tokens - 3333);
  console.log("about to burn ", num_to_burn);
}

export async function main({ account, argv }: Context) {
  let [contractId] = argv;
  if (contractId === null) {
    console.error("need to supply contract's accountId")
    console.error("... -- <contractId>")
  }
  let contract = new Contract(account, contractId);
 
  await burn_tokens(contract);
}
