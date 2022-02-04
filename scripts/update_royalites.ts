import { Context } from "near-cli/context";
import { init } from "..";

const royalties = {
  percent: 690,
  accounts: {
    "tenk.sputnik-dao.near": 2500,
    "kokumo.near": 2900,
    "clownpoop.near": 2300,
    "supermariorpg.near": 2300,
  }
};

export async function main({ account }: Context) {

  const contractId = account.accountId
  let contract = init(account, contractId);
  let res = await contract.update_royalties({ royalties });
  console.log("Old royalties");
  console.log(res);
  console.log(
    await contract.nft_payout({
      balance: "14285",
      token_id: "1533",
    })
  );
}
