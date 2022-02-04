import { Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import { init, Contract } from "..";

async function isWhitelisted(contract: Contract, account_id: string): Promise<boolean> {
  try {
    return contract.whitelisted({account_id});
  } catch (e) {
    console.log(e);
    console.log(`Problem with ${account_id}`);
    return true;
  }
}

export async function main({ account, argv }: Context) {
  if (argv.length < 3) {
    console.error(
      "Help:\n<input file> <contractId> <allowance> <amount per tx? (default 100)>"
    );
    process.exit(1);
  }
  const [file, contractId, allowance_str, number] = argv;
  const allowance = parseInt(allowance_str);
  let atATime = number ? parseInt(number) : 100;
  let whitelist = JSON.parse(await readFile(file, "utf8"));
  const contract = init(account, contractId);

  for (let i = 0; i < whitelist.length; i = i + atATime) {
    let account_ids = whitelist.slice(i, i + atATime);
    // console.log(account_ids)
    let notWhitelisted = await Promise.all(
      account_ids.map(async (account_id) =>
        !(await isWhitelisted(contract, account_id))
          ? account_id
          : undefined
      )
    );
    const accounts = notWhitelisted.filter((account) => account != undefined);
    const gas = Gas.parse("60 Tgas");
    if (accounts.length > 0) {
      try {
          await contract.add_whitelist_accounts({accounts, allowance}, {gas})
      } catch (e) {}
        console.log(`Failed ${accounts}`);
      // return;
    } else {
      console.log(`Added ${accounts}`);
    }
  }
}
