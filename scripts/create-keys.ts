import {createKeyPair, KeyPairEd25519} from "near-workspaces";
import * as fs from "fs";

const res = process.argv.slice(2);

if (res.length < 2) {
  console.error("Create list of keys for linkdrop:\n<num of links> <output file>");
  process.exit(1);
}

const [numStr, file]  = res;

const num = parseInt(numStr);

const keys = [];

for (let i = 0; i < num; i++) {
  let key = createKeyPair() as KeyPairEd25519;
  keys.push({ 
    publicKey: key.getPublicKey().toString(), secretKey: key.secretKey
  })
}

const keysString = JSON.stringify(keys, null, 1);
fs.writeFileSync(file, keysString);


