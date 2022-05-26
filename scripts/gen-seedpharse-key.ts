import { Context } from "near-cli/context";
import { generateSeedPhrase } from "near-seed-phrase";

export async function main({ account, argv }: Context): Promise<void> {
    let keys = generateSeedPhrase();
    let [add] = argv ?? [undefined];
    if (add === "--help") {
        console.error(".. --add  Add generated key to account")
        return;
    }
    console.log(keys);
    if (add === "--add") {
        if (!account) {
            throw new Error("Must pass account if using `--add`")
        }
        await account.addKey(keys.publicKey);
        console.log("Added key", keys.publicKey);
    }
}
