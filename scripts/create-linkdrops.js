const { NEAR, Gas } = require("near-units");
const { readFile } = require("fs/promises");
const { join } = require("path");

async function main({ account, near, nearAPI, argv }) {
  if (argv.length < 2) {
    console.error("Help:\n<input file> <contractId>");
    process.exit(1);
  }

  const [file, contractId] = argv;
  let keys = JSON.parse(await readFile(file, "utf8"));

  for (let i = 500; i < 900; i++) {
    const { publicKey } = keys[i];
    const public_key = publicKey;
    const keyAdded = await account.viewFunction(contractId, "check_key", {
      public_key,
    });
    if (!keyAdded) {
      await account.functionCall({
        contractId,
        methodName: "create_linkdrop",
        args: { public_key },
        gas: Gas.parse("30Tgas"),
        attachedDeposit: NEAR.parse("36mN"),
      });
    }
  }
}

module.exports.main = main;
