import {Context} from "near-cli/context";
import { generateSeedPhrase } from "near-seed-phrase";

export async function main({account, argv}: Context): Promise<void> {
  if (!account) {
    throw new Error("Must pass account!")
  }
  let keys = generateSeedPhrase();
  let [add] = argv;
  if (add === "--help") {
    console.error(".. --add  Add generated key to account")
    return;
  }
  console.log(keys);
  if (add === "--add") {
    await account.addKey(keys.publicKey);
    console.log("Added key", keys.publicKey);
  }
}
