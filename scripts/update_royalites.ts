import { Context } from "near-cli/context";
import { Contract } from "..";


export async function main({ account, argv }: Context) {
  let [contractId] = argv;
  if (contractId === null) {
    console.error("need to supply contract's accountId")
    console.error("... -- <contractId>")
  }
  let contract = new Contract(account, contractId);
  const royalties = {
    percent: 690,
    accounts: {
      "tenk.sputnik-dao.near": 2500,
      "bob.near": 7500,
    }
  };
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
