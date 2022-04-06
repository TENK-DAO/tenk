import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";


export async function main({ account, argv }: Context) {
  let [contractId] = argv;
  if (contractId === null) {
    console.error("need to supply contract's accountId")
    console.error("... -- <contractId>")
  }
  let contract = new Contract(account, contractId);
  const initial_royalties = {
    percent: 10_000,
    accounts: {
      "tenk.sputnik-dao.near":	1_500,
      "tan.sputnik-dao.near":	1_500,
      "sauercrumb.near":	7_000,
    },
  };
  let res = await contract.update_initial_royalties({ initial_royalties });
  console.log("Old royalties");
  console.log(res);
  const royalties = {
    percent: 500,
    accounts: {
      "tenk.sputnik-dao.near": 1_500,
      "tan.sputnik-dao.near": 1_500,
      "sauercrumb.near": 7_000,
    },
  };
  res = await contract.update_royalties({ royalties });
  console.log("Old royalties");
  console.log(res);
  
  
}
