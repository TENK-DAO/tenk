import { Context } from "near-cli/context";

const contractId = "misfits.tenk.near";
// const contractId = "zodiac.tenk.testnet";

const royalties = {
  percent: 7,
  accounts: {
    "tenk.sputnik-dao.near": 2,
    "misfits.sputnikdao.near": 20,
    "appalabs.near": 39,
    "siliconpty.near": 39,
  },
};

export async function main({ account, near, nearAPI }: Context) {
  const {
    Contract,
  } = nearAPI;

  let contract = new Contract(account, contractId, {
    changeMethods: ["update_royalties"],
    viewMethods: ["nft_payout"],
  });

  // @ts-expect-error Currently private
  let res = await contract.update_royalties({ args: { royalties }});
  console.log("Old royalties");
  console.log(res);
  console.log(
    // @ts-ignore
    await contract.nft_payout({
      balance: "14285",
      token_id: "1533",
    })
  );
}
