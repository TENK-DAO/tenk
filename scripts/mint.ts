import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";
import { getPublicKey } from "./utils";
import { TokenId } from '../contracts/tenk/ts/index';


export async function main({ account, argv }: Context) {
  const contract = new Contract(account, account.accountId);
  let owners = new Set(tokens.map(t => t.owner_id));
  let owners_count = Array.from(owners).map(o => {
    let num = tokens.reduce((acc, curr) => curr.owner_id === o ? acc + 1 : acc, 0);
    return {owner_id: o, num}
  });
  console.log(await contract.cost_per_token({minter: account.accountId}));
  // console.log(owners_count)
  for (let owner of owners_count) {
    
    const tokens = await contract.nft_tokens_for_owner({account_id: owner.owner_id});
    if (tokens.length < owner.num * 2) {
      console.log("owner", owner.owner_id, tokens.length, owner.num*2);
      // break
      const newToken = await contract.nft_mint_one();
      console.log("minted", newToken);
      // const newToken = {token_id: '1988'};
      await contract.nft_transfer({receiver_id: owner.owner_id, token_id: newToken.token_id}, {attachedDeposit: "1"});
      console.log("transfer completed", owner.owner_id)
      // break;
    }
  }
}


let tokens = [
  {
    "token_id": "30",
    "owner_id": "ebfdf73819c0ee04ab8ba663043d77e0069d7ecf1f7625bb876d23068dc65514"
  },
  {
    "token_id": "166",
    "owner_id": "cfc6267d6ed886b8321acfd3c33c6029562eca311706b1f50777e9bc0237ee3b"
  },
  {
    "token_id": "230",
    "owner_id": "mistcop.near"
  },
  {
    "token_id": "243",
    "owner_id": "69fc316844be2318073f58cc903e0acb2d11f06b7052805a07a5055de9756fdd"
  },
  {
    "token_id": "354",
    "owner_id": "69fc316844be2318073f58cc903e0acb2d11f06b7052805a07a5055de9756fdd"
  },
  {
    "token_id": "522",
    "owner_id": "jen.near"
  },
  {
    "token_id": "531",
    "owner_id": "axuenno.near"
  },
  {
    "token_id": "542",
    "owner_id": "833caccca5c541c7949698d15f17b5b0c88b0823e915f76c4053ab8f7e14ac2d"
  },
  {
    "token_id": "610",
    "owner_id": "kinvin.near"
  },
  {
    "token_id": "673",
    "owner_id": "endofrainbow.near"
  },
  {
    "token_id": "693",
    "owner_id": "snip.near"
  },
  {
    "token_id": "726",
    "owner_id": "vills.near"
  },
  {
    "token_id": "794",
    "owner_id": "starpause.near"
  },
  {
    "token_id": "940",
    "owner_id": "starpause.near"
  },
  {
    "token_id": "952",
    "owner_id": "afiqshofy.near"
  },
  {
    "token_id": "1020",
    "owner_id": "fuck669.near"
  },
  {
    "token_id": "1043",
    "owner_id": "axuenno.near"
  },
  {
    "token_id": "1049",
    "owner_id": "69fc316844be2318073f58cc903e0acb2d11f06b7052805a07a5055de9756fdd"
  },
  {
    "token_id": "1098",
    "owner_id": "ariiies.near"
  },
  {
    "token_id": "1269",
    "owner_id": "ebfdf73819c0ee04ab8ba663043d77e0069d7ecf1f7625bb876d23068dc65514"
  },
  {
    "token_id": "1305",
    "owner_id": "stoofsama.near"
  },
  {
    "token_id": "1384",
    "owner_id": "mhiwyga.near"
  },
  {
    "token_id": "1390",
    "owner_id": "mhiwyga.near"
  },
  {
    "token_id": "1392",
    "owner_id": "ac05708662ecfd7a1863b3efb46dda7836c0cbcbf45e164df449cdf1faf91912"
  },
  {
    "token_id": "1466",
    "owner_id": "starpause.near"
  },
  {
    "token_id": "1507",
    "owner_id": "jen.near"
  },
  {
    "token_id": "1613",
    "owner_id": "near24072021.near"
  },
  {
    "token_id": "1661",
    "owner_id": "cfc6267d6ed886b8321acfd3c33c6029562eca311706b1f50777e9bc0237ee3b"
  },
  {
    "token_id": "1692",
    "owner_id": "ac05708662ecfd7a1863b3efb46dda7836c0cbcbf45e164df449cdf1faf91912"
  },
  {
    "token_id": "1804",
    "owner_id": "near24072021.near"
  },
  {
    "token_id": "1837",
    "owner_id": "stoofsama.near"
  },
  {
    "token_id": "1845",
    "owner_id": "neontl.near"
  },
  {
    "token_id": "1888",
    "owner_id": "69fc316844be2318073f58cc903e0acb2d11f06b7052805a07a5055de9756fdd"
  },
  {
    "token_id": "1898",
    "owner_id": "neontl.near"
  },
  {
    "token_id": "1945",
    "owner_id": "ebfdf73819c0ee04ab8ba663043d77e0069d7ecf1f7625bb876d23068dc65514"
  },
  {
    "token_id": "1990",
    "owner_id": "stepfam.near"
  },
  {
    "token_id": "2016",
    "owner_id": "cfc6267d6ed886b8321acfd3c33c6029562eca311706b1f50777e9bc0237ee3b"
  },
  {
    "token_id": "2056",
    "owner_id": "eliasmintburner.near"
  },
  {
    "token_id": "2220",
    "owner_id": "andreapn1709.near"
  },
  {
    "token_id": "2275",
    "owner_id": "fuck669.near"
  },
  {
    "token_id": "2475",
    "owner_id": "bish0p.near"
  },
  {
    "token_id": "2497",
    "owner_id": "0xjerry.near"
  },
  {
    "token_id": "2574",
    "owner_id": "iamlamham.near"
  },
  {
    "token_id": "2585",
    "owner_id": "delrex.near"
  },
  {
    "token_id": "2595",
    "owner_id": "ac05708662ecfd7a1863b3efb46dda7836c0cbcbf45e164df449cdf1faf91912"
  },
  {
    "token_id": "2637",
    "owner_id": "xsession.near"
  },
  {
    "token_id": "2704",
    "owner_id": "ac05708662ecfd7a1863b3efb46dda7836c0cbcbf45e164df449cdf1faf91912"
  },
  {
    "token_id": "2746",
    "owner_id": "fuck669.near"
  },
  {
    "token_id": "2781",
    "owner_id": "alvinagustus.near"
  },
  {
    "token_id": "2830",
    "owner_id": "neontl.near"
  },
  {
    "token_id": "2881",
    "owner_id": "riqi.near"
  },
  {
    "token_id": "2886",
    "owner_id": "andreapn1709.near"
  },
  {
    "token_id": "2955",
    "owner_id": "luiidachris.near"
  },
  {
    "token_id": "3031",
    "owner_id": "luiidachris.near"
  },
  {
    "token_id": "3074",
    "owner_id": "nearbuckets.near"
  },
  {
    "token_id": "3175",
    "owner_id": "bish0p.near"
  },
  {
    "token_id": "3178",
    "owner_id": "mistcop.near"
  },
  {
    "token_id": "3240",
    "owner_id": "kinvin.near"
  },
  {
    "token_id": "3247",
    "owner_id": "stepfam.near"
  },
  {
    "token_id": "3311",
    "owner_id": "bish0p.near"
  },]
  