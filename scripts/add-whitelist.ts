import { Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";

async function isWhitelisted(account, contractId, account_id) {
  try {
    return await account.viewFunction(contractId, "whitelisted", {
      account_id,
    });
  } catch (e) {
    console.log(e);
    console.log(`Problem with ${account_id}`);
    return true;
  }
}

export async function main({ account, near, nearAPI, argv }: Context) {
  if (argv.length < 2) {
    console.error("Help:\n<input file> <contractId>");
    process.exit(1);
  }
  const [file, contractId, number] = argv;
  let atATime = number ? parseInt(number) : 100;
  let whitelist = JSON.parse(await readFile(file, "utf8"));

  for (let i = 0; i < whitelist.length; i = i + atATime) {
    let account_ids = whitelist.slice(i, i + atATime);
    // console.log(account_ids)
    let notWhitelisted = await Promise.all(
      account_ids.map(async (account_id) =>
        !(await isWhitelisted(account, contractId, account_id))
          ? account_id
          : undefined
      )
    );
    const accounts = notWhitelisted.filter((account) => account != undefined);
    console.log(accounts)
    if (accounts.length > 0) {
      try {
        console.log(await account.functionCall({
          contractId,
          methodName: "add_whitelist_accounts",
          args: { accounts, allowance: 3 },
          gas: Gas.parse("60 Tgas"),
          // attachedDeposit: NEAR.parse("36mN"),
        }));
      } catch (e) {}
      console.log(accounts)
      // return;
    }
    
    // } catch (e) {
    //   console.error(`Problem with ${account_id}`);
    // }
  }
}
