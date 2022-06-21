import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import { icon } from "./icon";

const metadata: tenk.InitialMetadata = {
    uri: "https://bafybeiepthksposqu75ou43fhqeozti6ihqn2k2y5fb6epn6ajxpumvw6e.ipfs.dweb.link",
    name: "BEGUILING LADIES",
    symbol: "Beguiling Ladies",
    icon,
};

const size = 969;

const sale: tenk.Sale = {
    price: NEAR.parse("2 N").toJSON(),
    presale_price: NEAR.parse("1.69 N").toJSON(),
    mint_rate_limit: 5,
    presale_start: Date.parse("22 June 2022 15:00 UTC"),
    public_sale_start: Date.parse("23 June 2022 15:00 UTC"),
    initial_royalties: {
        percent: 10_000,
        accounts: {
            "tenk.sputnik-dao.near": 2000,
            "tan.sputnik-dao.near": 2000,
            "jhezer.near": 6000,
        },
    },
    royalties: {
        percent: 800,
        accounts: {
            "tenk.sputnik-dao.near": 2000,
            "tan.sputnik-dao.near": 2000,
            "jhezer.near": 6000,
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
