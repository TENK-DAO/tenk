import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";
import { getPublicKey } from "./utils";


export async function main({ account, argv }: Context) {
  let [public_key, is_link] = argv;
  if (is_link) {
    public_key = getPublicKey(public_key).toString();
  }
  let contract = new Contract(account, account.accountId);
  console.log(`key: ${public_key} - ${await contract.check_key({public_key})}`);
}
