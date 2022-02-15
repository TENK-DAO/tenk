import { Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import { Contract } from "..";
import { valid_account_id } from "./utils";

async function isWhitelisted(
  contract: Contract,
  account_id: string
): Promise<boolean> {
  try {
    return contract.whitelisted({ account_id });
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
  const contract = new Contract(account, contractId);

  for (let i = 0; i < whitelist.length; i = i + atATime) {
    let account_ids = filter_accounts(whitelist.slice(i, i + atATime));
    let notInWl = new Set<string>();
    await Promise.all(
      account_ids.map(async (account_id) => {
        if (!(await isWhitelisted(contract, account_id))) {
          notInWl.add(account_id);
        }
      }
      )
    );
    const accounts = Array.from(notInWl);
    const gas = Gas.parse("60 Tgas");
    if (accounts.length > 0) {
      try {
        await contract.add_whitelist_accounts({ accounts, allowance }, { gas });
      } catch (e) {
        console.log(`Failed ${accounts}`);
        continue;
      }
      console.log(`Added ${accounts}`);
    }
  }
}

function filter_accounts(account_ids: string[]): string[] {
  let invalid_account_ids = account_ids.filter(
    (id) => !valid_account_id.test(id)
  );
  if (invalid_account_ids.length > 0) {
    console.log(`invalid Ids ${invalid_account_ids}`);
  }
  return account_ids.filter((id) => valid_account_id.test(id));
}
