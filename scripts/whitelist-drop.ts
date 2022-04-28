import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";
import { Gas } from "near-units";

const gas = Gas.parse("250 Tgas");

import { tokens } from "./tokens";

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
  let owners = new Set(tokens.map(t => t.owner_id));
  console.log(owners.size);
  // return;
  let owners_count = Array.from(owners).map(o => {
    let num = tokens.reduce((acc, curr) => curr.owner_id === o ? acc + 1 : acc, 0);
    return {owner_id: o, num}
  });
  // console.log(owners_count)
  let owner_array = Array.from(owners);
  // console.log(owners_count);
  let owner_buckets: {[key: number]:string[]} = {}

  for (let {owner_id, num} of owners_count) {
    if (owner_buckets[num] === undefined) {
      owner_buckets[num] = [];
    }
    owner_buckets[num].push(owner_id);
  }
  // console.log(owner_buckets)
  let total = 0;
  const contract = new Contract(account, account.accountId);
  for (let [a, owners] of Object.entries(owner_buckets)) {
    
    let allowance = parseInt(a) * 2;
    
    
    let accounts = [];
    for (let owner of owners) {
      if (!(await isWhitelisted(contract, owner))) {
        accounts.push(owner);
      } else {
        console.log(owner, "already on whitelist");
      }
    }
    console.log("About to add to whitelist")
    try {
      await contract.add_whitelist_accounts({ accounts, allowance }, { gas });
    } catch (e) {
      console.log(`Failed ${accounts}`);
      continue;
    }
    console.log("added", allowance, accounts)
    total += allowance*accounts.length;
  }
  console.log(total)
  return;

  let max = owner_array.length;

  for (let i = 0; i < owner_array.length; i = i + 20){
    let token_owners = owner_array.slice(i, i + 20);
    // const tokens = await contract.nft_tokens_for_owner({account_id});
    console.log(`about to mint ${token_owners}`);
    // await contract.nft_mint_many({token_owners, max}, {gas})
  //   if (tokens.length < owner.num * 2) {
  //     console.log("owner", owner.owner_id, tokens.length, owner.num*2);
  //     const newToken = await contract.nft_mint_one();
  //     console.log("minted", newToken);
  //     await contract.nft_transfer({receiver_id: owner.owner_id, token_id: newToken.token_id}, {attachedDeposit: "1"});
  //     console.log("transfer completed", owner.owner_id)

  //   }
  }
}
