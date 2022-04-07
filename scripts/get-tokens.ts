import { Contract } from "..";

export async function main({ account, argv }) {
  if (argv.length < 2) {
    console.error("Help:\n<start> <end>");
    process.exit(1);
  }

  const [start, end] = argv;
  const contract = new Contract(account, account.accountId);
  console.log("let tokens = [")
  for (let i = parseInt(start); i < parseInt(end); i++) {
    const token = await contract.nft_token({ token_id: `${i}` });
    if (token != null) {
      console.log(
        JSON.stringify(
          {
            token_id: token.token_id,
            owner_id: token.owner_id,
          },
          null,
          2
        ) + ","
      );
    }
  }
  console.log("]")
}