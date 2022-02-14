import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Contract } from "..";

export async function main({ account, argv }) {
  if (argv.length < 2) {
    console.error("Help:\n<input file> <contractId>");
    process.exit(1);
  }

  const [file, contractId] = argv;
  const contract = new Contract(account, contractId);
  let keys = JSON.parse(await readFile(file, "utf8"));

  for (let i = 0; i < keys.length; i++) {
    const { publicKey } = keys[i];
    const public_key = publicKey;
    const keyAdded = await contract.check_key({ public_key });
    if (!keyAdded) {
      await contract.create_linkdrop(
        { public_key },
        { gas: Gas.parse("30Tgas"), attachedDeposit: NEAR.parse("36mN") }
      );
    }
  }
}
