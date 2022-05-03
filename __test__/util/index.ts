import { Gas, NEAR } from "near-units";
import {
  Account,
  BN,
  createKeyPair,
  NearAccount,
  Workspace,
  randomAccountId,
  KeyPair,
  PublicKey,
  AccountManager,
} from "near-workspaces";
import { ONE_NEAR, TransactionResult } from "near-workspaces-ava";
import { binPath } from "./bin";
import { BalanceDelta, getDelta } from "./delta";
import {Contract} from "../..";

let c: Contract;
type f = typeof c.new_default_meta;
type NewfuncArgs = Parameters<f>;
export type InitArgs = NewfuncArgs[0];

export type start_presale_args = Parameters<typeof c.start_presale>[0];

export * from "./bin";

// This will allow the contract account to be deleted since the size is reduced
export async function deployEmpty(account: NearAccount): Promise<void> {
  if (!Workspace.networkIsTestnet()) {
    return;
  }
  const empty = account.getFullAccount("empty.tn");
  const bytes = await empty.viewCode();
  await account.createTransaction(account).deployContract(bytes).signAndSend();
}

export function now() {
  return Date.now();
}
export const DEFAULT_SALE = {
  price: NEAR.parse("1 N").toJSON(),
  public_sale_start: now(),
}

export async function deploy(
  owner: NearAccount,
  name = "tenk",
  args: Partial<InitArgs> = {}
): Promise<NearAccount> {
  const account =  await  owner.createAndDeploy(name, binPath("tenk"));
  let passed_args: InitArgs = {
    owner_id: owner.accountId,
    metadata: {
      name: "TENK NFT",
      symbol: "TENK",
      uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link",
    },
    size: 100,
    sale: DEFAULT_SALE,
    ...args,
  };
  await owner.call(account, "new_default_meta", passed_args);
  return account;
}

export async function nftTokensForOwner(
  root,
  tenk,
  from_index = null,
  limit = null
) {
  return tenk.view("nft_tokens_for_owner", {
    account_id: root,
    from_index,
    limit,
  });
}

// export const ONE_NEAR = NEAR.parse("1 N")


export const DEFAULT_BASE_COST = NEAR.parse("10 N");
export const DEFAULT_MIN_COST = NEAR.parse("1 N");

export function DEFAULT_INIT_ARGS(
  owner_id: string,
  base_cost = DEFAULT_BASE_COST,
  min_cost = DEFAULT_MIN_COST
) {
  return {
    owner_id,
    name: "minimo",
    symbol: "MIMO",
    uri: "https://ipfs.io/ipfs/bafybeifxzm547rdsckq2crw4dipjvsw4togrnhwzb7gy7ae4anqqgjt264",
    size: 10000,
    base_cost,
    min_cost,
  };
}

export async function costPerToken(
  tenk: NearAccount,
  num: number,
  minter: string = "alice.near"
): Promise<NEAR> {
  return NEAR.from(await tenk.view("cost_per_token", { num, minter }));
}

export async function totalCost(
  tenk: NearAccount,
  num: number,
  minter: string = "alice.near"
): Promise<NEAR> {
  return NEAR.from(await tenk.view("total_cost", { num, minter }));
}

export async function linkdropCost(
  tenk: NearAccount,
  minter: string = "alice.near"
): Promise<NEAR> {
  return NEAR.from(await tenk.view("cost_of_linkdrop", { minter }));
}

export async function discount(tenk: NearAccount, num: number): Promise<NEAR> {
  return NEAR.from(await tenk.view("discount", { num }));
}

export async function tokenStorageCost(tenk: NearAccount): Promise<NEAR> {
  return NEAR.from(await tenk.view("token_storage_cost"));
}

export class ActualTestnet extends Account {
  constructor(private name: string) {
    super(null as any, null as any);
  }

  get accountId(): string {
    return this.name;
  }
}
// const KEY_ALLOWANCE = NEAR.parse("0.69 N");
const ONE_NFT_STORAGE_COST_BN: NEAR = Workspace.networkIsTestnet()
  ? NEAR.parse("320 μN")
  : NEAR.parse("7.56 mN");

export const MINT_ONE_GAS = Gas.parse("300 TGas");

function costOfMinting(num: number): string {
  return ONE_NFT_STORAGE_COST_BN.mul(new BN(num)).toString();
}

export async function checkKey(
  key: PublicKey,
  contract: NearAccount
): Promise<boolean> {
  const provider = ((contract as any).manager as AccountManager).provider;
  try {
    const res = await provider.view_access_key(contract.accountId, key);
    return res.permission.FunctionCall.method_names[0] === "claim";
    // return true;
  } catch (_) {
    return false;
  }
}

export async function createLinkdrop(
  t,
  contract: NearAccount,
  root: NearAccount,
  attachedDeposit?: NEAR
): Promise<KeyPair> {
  // Create temporary keys for access key on linkdrop
  const senderKey = createKeyPair();
  const public_key = senderKey.getPublicKey().toString();
  // const linkdrop_cost
  attachedDeposit =
    attachedDeposit ?? (await linkdropCost(contract, root.accountId));
  const contract_delta = await BalanceDelta.create(contract, t);
  // This adds the key as a function access key on `create_account_and_claim`
  const root_delta = await BalanceDelta.create(root, t);
  const [delta, res] = await getDelta(t, root, async () => {
    let res = await root.call_raw(
      contract,
      "create_linkdrop",
      {
        public_key,
      },
      {
        attachedDeposit,
        gas: Gas.parse("40 Tgas"),
      }
    );
    return res;
  });
  // await contract_delta.log();
  // t.log(res.logs);
  // await delta.log();
  t.assert(res.succeeded);
  t.assert(await checkKey(senderKey.getPublicKey(), contract));
  return senderKey;
}

export async function claim(
  t,
  tenk: NearAccount,
  alice: NearAccount,
  signWithKey: KeyPair
): Promise<TransactionResult> {
  return tenk.call_raw(
    tenk,
    "claim",
    {
      account_id: alice,
    },
    {
      signWithKey,
      gas: Gas.parse("100 Tgas"),
    }
  )
}

export function claim_raw(
  tenk: NearAccount,
  account_id: NearAccount,
  signWithKey: KeyPair,
  gas = Gas.parse("100 Tgas")
) {
  return tenk.call_raw(
    tenk,
    "claim",
    {
      account_id,
    },
    {
      signWithKey,
      gas,
    }
  );
}

export function get_gas_profile(res) {
  return res.result.receipts_outcome
    .map((outcome) => {
      const gas_profile = outcome.outcome["metadata"].gas_profile;
      return gas_profile.map((info) => {
        info.gas_used = Gas.parse(info.gas_used).toHuman();
        return JSON.stringify(info, null, 2);
      });
    })
    .join("\n");
}

export async function create_account_and_claim(
  t,
  contract: NearAccount,
  new_account_id: string,
  signWithKey,
  gas = Gas.parse("100 Tgas"),
  testAccount = true
): Promise<NearAccount> {
  const actualKey = createKeyPair();
  const new_public_key = actualKey.getPublicKey().toString();
  const res = await contract.call_raw(
    contract,
    "create_account_and_claim",
    {
      new_account_id,
      new_public_key,
    },
    {
      signWithKey,
      gas,
    }
  );

  let new_account = contract.getFullAccount(new_account_id);
  if (testAccount) {
    // t.log(res.errors, res.promiseErrorMessages);
    if (res.failed) {
      t.log(get_gas_profile(res));
    }
    t.assert(
      await new_account.exists(),
      `account ${new_account_id} does not exist`
    );
    await new_account.setKey(actualKey);
  }
  return new_account;
}

export async function createLinkAndNewAccount(
  t,
  contract: NearAccount,
  root: NearAccount,
  gas
): Promise<NearAccount> {
  const senderKey = await createLinkdrop(t, contract, root);

  // Create a random subaccount
  const new_account_id = `${randomAccountId("d", 10, 10)}.testnet`;

  // Claim account
  const new_account = await create_account_and_claim(
    t,
    contract,
    new_account_id,
    senderKey,
    gas
  );

  // Add roots key to ensure it can be deleted later
  const res = await new_account
    .createTransaction(new_account)
    .addKey((await root.getKey()).getPublicKey())
    .signAndSend();
  t.assert(res.succeeded);
  return new_account;
}

export async function getTokens(
  contract: NearAccount,
  account_id: NearAccount
): Promise<any[]> {
  return contract.view("nft_tokens_for_owner", { account_id });
}

export async function mint(
  tenk: NearAccount,
  root: NearAccount,
  attachedDeposit = ONE_NEAR
): Promise<string> {
  let res = await mint_raw(tenk, root, attachedDeposit);
  return res.parseResult<any>().token_id;
}

export function mint_raw(
  tenk: NearAccount,
  root: NearAccount,
  attachedDeposit = ONE_NEAR
): Promise<TransactionResult> {
  return root.call_raw(
    tenk,
    "nft_mint_one",
    {},
    {
      attachedDeposit,
    }
  );
}

export * from "./delta";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
