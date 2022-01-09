import * as fs from "fs/promises";

const res = process.argv.slice(2);

if (res.length < 4) {
  console.error("Create linkdrop urls:\n<input file> <contractId> <redirectUrl> <output file>?\n\nIf no output file, output to stdout");
  process.exit(1);
}

const [file, contractId, url, outputFile] = res;
const walletUrl = (contractId, key, url) =>
  `https://wallet.near.org/linkdrop/${contractId}/${key}?redirectUrl=${url}`;

async function main() {
  let keys = JSON.parse(await fs.readFile(file, "utf8"));
  const output = keys
    .map(({ secretKey }) => walletUrl(contractId, secretKey, url))
    .join("\n");
  if (outputFile) {
    await fs.writeFile(outputFile, output);
  } else {
    console.log(output);
  }
}

void main();
