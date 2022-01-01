import * as fs from "fs/promises";

const res = process.argv.slice(2);

if (res.length < 2) {
  console.error("Help:\n<input file> <contractId>");
  process.exit(1);
}

const [file, contractId]  = res;
const walletUrl = (contractId, key, url) =>
`https://wallet.near.org/linkdrop/${contractId}/${key}?redirectUrl=${url}/my-nfts`;

async function main() {
  let keys = JSON.parse(await fs.readFile(file, "utf8"));
  for (let i = 0; i < keys.length; i++) {
    let {secretKey} = keys[i];
    console.log(walletUrl(contractId, secretKey, "https://app.tongdao.art"))
  }
}

void main()


