import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import { icon } from "./icon";

const metadata: tenk.InitialMetadata = {
    uri: "https://bafybeif4zfuh2qnx2zrdpgxp3plllnxmrbwcxin2ffe43odid6bxxnjt3q.ipfs.dweb.link",
    name: "World of the Abyss (WOTA)",
    symbol: "wotaverse",
    icon,
};

const size = 120;

const sale: tenk.Sale = {
    allowance: 3,
    price: NEAR.parse("5 N").toJSON(),
    public_sale_start: Date.parse("27 April 2022 18:00 UTC"),
    initial_royalties: {
        percent: 10_000,
        accounts: {
            "tenk.sputnik-dao.near": 2_500,
            "wotaverse.sputnik-dao.near": 7_500,
        },
    },
    royalties: {
      percent: 1_000,
      accounts: {
        "tenk.sputnik-dao.near": 2_500,
        "wotaverse.sputnik-dao.near": 7_500,
      },
    },
};


export async function main({ account, nearAPI, argv, near }: Context) {
    let { Account } = nearAPI;
    const contractBytes = await readFile(binPath("tenk"));

    let [contractId] = argv ?? [];
    contractId = contractId ?? account.accountId;
    let contractAccount = new Account(near.connection, contractId);

    const isTestnet = contractId.endsWith("testnet");
    if (isTestnet) {
        sale.initial_royalties = null;
        sale.public_sale_start = Date.now();
    }

    const initialArgs = {
        owner_id: account.accountId,
        metadata,
        size,
        sale,
    };

    const contract = new tenk.Contract(account, contractId);

    const tx = account
        .createTransaction(contractId)
        .deployContract(contractBytes);

    if (await contractAccount.hasDeployedContract()) {
        console.log(`initializing with: \n${JSON.stringify(initialArgs, null, 2)}`);
        tx.actions.push(
            contract.new_default_metaTx(initialArgs, { gas: Gas.parse("50Tgas") })
        );
    }
    let res = await tx.signAndSend();
    console.log(
        `https://explorer${isTestnet ? ".testnet" : ""}.near.org/transactions/${
        res.transaction_outcome.id
        }`
    );
    //@ts-ignore
    if (res.status.SuccessValue != undefined) {
        console.log(`deployed ${contractId}`);
    } else {
        console.log(res);
    }
}
