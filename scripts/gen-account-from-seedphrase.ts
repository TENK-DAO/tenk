import {Context} from "near-cli/context";
import { parseSeedPhrase } from "near-seed-phrase";
import * as readline from "readline";

const phrase = "<SEED PHRASE HERE>";

export async function main({account, nearAPI, near}: Context): Promise<void> {
  if (!account) {
    throw new Error("Must pass account!")
  }
  const { deps: {keyStore}, networkId, accountId} = near.config;
  let {utils: {KeyPair}} = nearAPI;
  const { secretKey } = parseSeedPhrase(phrase);
  const key = KeyPair.fromString(secretKey);
  console.log(key, `${key.getPublicKey()}`)
  console.log("about to add key to ", accountId, " on network", networkId);
  await keyStore.setKey(networkId, accountId, key);
  console.log(`Set key for ${accountId}`);
}

