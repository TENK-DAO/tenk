import { NEAR, NearAccount, ONE_NEAR } from "near-workspaces-ava";

export async function deployEmpty(account: NearAccount): Promise<void> {
  const empty = account.getFullAccount("empty.tn");
  const bytes = await empty.viewCode();
  await account.createTransaction(account).deployContract(bytes).signAndSend();
}

export async function nftTokensForOwner(root, tenk, from_index = null, limit = null) {
  return tenk.view("nft_tokens_for_owner", {
    account_id: root,
    from_index,
    limit,
  });
}

// export const ONE_NEAR = NEAR.parse("1 N")