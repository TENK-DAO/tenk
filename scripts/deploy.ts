import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "..";
import { binPath } from "./utils";
import { icon } from "./icon";

const metadata: tenk.InitialMetadata = {
    uri: "https://bafybeiffohfsrx577momb7u7d4ei4vi7de2bnglheqy6kmvmnke457k6lq.ipfs.dweb.link",
    name: "Friendly Turtles",
    symbol: "friendlyturtles.nearocean",
    icon,
};

const size = 993;

const sale: tenk.Sale = {
    price: NEAR.parse("10 N").toJSON(),
    // presale_price: NEAR.parse("6 N").toJSON(),
    mint_rate_limit: 2,
    // allowance: 1,
    presale_start: Date.parse("27 April 2022 1:00 AM UTC"),
    public_sale_start: Date.parse("27 April 2022 7:00 PM UTC"),
    initial_royalties: {
        percent: 10_000,
        accounts: {
            "tenk.sputnik-dao.near": 2_000,
            "fscmint.near": 2_500,
            "fscdonation.near": 2_500,
            "sixxx.near": 1_000,
            "within4d45.near": 500,
            "kcpesce.near": 500,
            "fscteam.near": 500,
            "beetogether.near": 500,
        },
    },
    royalties: {
        percent: 600,
        accounts: {
            "tenk.sputnik-dao.near": 1_500,
            "fscdonation.near": 2_500,
            "fscroyalties.near": 3_000,
            "sixxx.near": 1_000,
            "within4d45.near": 500,
            "kcpesce.near": 500,
            "fscmint.near": 500,
            "beetogether.near": 500,
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
        // media_extension: "png",
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
