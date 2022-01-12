const { NEAR, Gas } = require("near-units");
const { readFile } = require("fs/promises");
const { join } = require("path");

async function main({ account, near, nearAPI, argv }) {
  if (argv.length < 2) {
    console.error("Help:\n<input file> <contractId>");
    process.exit(1);
  }

  const [file, contractId] = argv;
  let accounts = JSON.parse(await readFile(file, "utf8"));

    for (let i = 0; i < accounts.length; i++) {
      const account_id = accounts[i];
      const isWhitelisted = await account.viewFunction(contractId, "whitelisted", {
        account_id,
      });
      if (!isWhitelisted){
        await account.functionCall({
          contractId,
          methodName: "add_whitelist_account",
          args: { account_id },
          gas: Gas.parse("30Tgas"),
          // attachedDeposit: NEAR.parse("36mN"),
        });
        console.log(`${i}: ${account_id} whitelisted`)

      } else {
        console.log(`${i}: ${account_id} already whitelisted`)
      }
    }  
}

module.exports.main = main;
