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

const DEFAULT_PER_TX = 200;

export async function main({ account, argv }: Context) {
  if (argv.length < 3) {
    console.error(
      `Help:\n<input file> <contractId> <allowance> <amount per tx? (default ${DEFAULT_PER_TX})>`
    );
    process.exit(1);
  }
  const [file, contractId, allowance_str, number] = argv;
  let whitelist = filter_accounts(JSON.parse(await readFile(file, "utf8")));

  const max_allowance = parseInt(allowance_str);
  let atATime = number ? parseInt(number) : DEFAULT_PER_TX;
  const contract = new Contract(account, contractId);

  for (let i = 0; i < whitelist.length; i = i + atATime) {
    let account_ids = whitelist.slice(i, i + atATime);
    let notInWl = new Set<string>();
    await Promise.all(
      account_ids.map(async (account_id) => {
        try {
          if (!(await isWhitelisted(contract, account_id))) {
            notInWl.add(account_id);
          }

        }catch(e) {
          console.error(`issue with account: ${account_id}`);
        }
      })
    );
    const accounts = Array.from(notInWl);
    const gas = Gas.parse("250 Tgas");
    if (accounts.length > 0) {
      try {
        await contract.add_whitelist_accounts({ accounts, max_allowance }, { gas });
      } catch (e) {
        console.log(`Failed ${accounts}`);
        continue;
      }
      console.log(`Added ${accounts}`);
    }
  }
}

function filter_accounts(raw_account_ids: string[]): string[] {
  const account_ids = raw_account_ids.map(s => s.trim().toLowerCase());
  let invalid_account_ids = account_ids.filter(
    (id) => !valid_account_id.test(id)
  );
  if (invalid_account_ids.length > 0) {
    console.log(`invalid Ids "${invalid_account_ids}"`);
  }
  return account_ids.filter((id) => valid_account_id.test(id));
}
