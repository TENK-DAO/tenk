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
} from "near-willem-workspaces";
import * as ava from "near-willem-workspaces-ava";

// This will allow the contract account to be deleted since the size is reduced
export async function deployEmpty(account: NearAccount): Promise<void> {
  if (!Workspace.networkIsTestnet()) {
    return;
  }
  const empty = account.getFullAccount("empty.tn");
  const bytes = await empty.viewCode();
  await account.createTransaction(account).deployContract(bytes).signAndSend();
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

export const CONTRACT_PATH = `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`;

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
  num: number
): Promise<NEAR> {
  return NEAR.from(await tenk.view("cost_per_token", { num }));
}

export async function totalCost(tenk: NearAccount, num: number): Promise<NEAR> {
  return NEAR.from(await tenk.view("total_cost", { num }));
}

export async function linkdropCost(tenk: NearAccount): Promise<NEAR> {
  return NEAR.from(await tenk.view("cost_of_linkdrop"));
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
  root: NearAccount
): Promise<KeyPair> {
  // Create temporary keys for access key on linkdrop
  const senderKey = createKeyPair();
  const public_key = senderKey.getPublicKey().toString();
  // const linkdrop_cost

  // This adds the key as a function access key on `create_account_and_claim`
  await root.call(
    contract,
    "create_linkdrop",
    {
      public_key,
    },
    {
      attachedDeposit: await linkdropCost(contract),
      gas: Gas.parse("100 Tgas"),
    }
  );
  t.assert(await checkKey(senderKey.getPublicKey(), contract));
  return senderKey;
}

export function claim(
  tenk: NearAccount,
  alice: NearAccount,
  signWithKey: KeyPair
) {
  return tenk.call(
    tenk,
    "claim",
    {
      account_id: alice,
    },
    {
      signWithKey,
      gas: Gas.parse("200 Tgas"),
    }
  );
}

export function claim_raw(
  tenk: NearAccount,
  account_id: NearAccount,
  signWithKey: KeyPair
) {
  return tenk.call_raw(
    tenk,
    "claim",
    {
      account_id,
    },
    {
      signWithKey,
      gas: Gas.parse("200 Tgas"),
    }
  );
}

export async function create_account_and_claim(
  t,
  contract: NearAccount,
  new_account_id,
  senderKey
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
      signWithKey: senderKey,
      gas: Gas.parse("300 Tgas"),
    }
  );

  t.log(res);

  let new_account = contract.getFullAccount(new_account_id);
  t.assert(await new_account.exists());
  await new_account.setKey(actualKey);
  return new_account;
}

export async function createLinkAndNewAccount(
  t,
  contract: NearAccount,
  root: NearAccount
): Promise<NearAccount> {
  const senderKey = await createLinkdrop(t, contract, root);

  // Create a random subaccount
  const new_account_id = `${randomAccountId("d", 10, 10)}.testnet`;

  // Claim account
  const new_account = await create_account_and_claim(
    t,
    contract,
    new_account_id,
    senderKey
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

export class Delta {
  static readonly ZERO_NEAR = NEAR.from(0);
  constructor(public readonly amount: NEAR) {}

  toHuman(): string {
    if (this.isZero()) {
      return `0 N`
    }
    const absAmount = this.amount.abs();
    return `${this.amount.isNeg() ? "-" : ""}${absAmount.toHuman()}`;
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  gt(by: NEAR = Delta.ZERO_NEAR): boolean {
    return this.amount.gt(by);
  }

  gte(by: NEAR = Delta.ZERO_NEAR): boolean {
    return this.amount.gte(by);
  }

  lt(by: NEAR = Delta.ZERO_NEAR): boolean {
    return this.amount.lt(by);
  }

  lte(by: NEAR = Delta.ZERO_NEAR): boolean {
    return this.amount.lte(by);
  }
}

export class BalanceDelta {
  private constructor(
    public readonly initial: NEAR,
    public readonly account: NearAccount,
    private t: any
  ) {}

  static async create(account: NearAccount, t): Promise<BalanceDelta> {
    return new BalanceDelta(await account.availableBalance(), account, t);
  }

  async delta(): Promise<Delta> {
    const newBalance = await this.account.availableBalance();
    return new Delta(newBalance.sub(this.initial));
  }

  async isZero(): Promise<void> {
    return this.assert((delta) => delta.isZero(), "zero");
  }

  async isGreater(by?: NEAR): Promise<void> {
    return this.assert((delta) => delta.gt(by), "greater");
  }
  async isGreaterOrEqual(by?: NEAR): Promise<void> {
    return this.assert((delta) => delta.gte(by), "greater or equal");
  }

  async isLess(by?: NEAR): Promise<void> {
    return this.assert((delta) => delta.lt(by), "less");
  }

  async isLessOrEqual(by?: NEAR): Promise<void> {
    return this.assert((delta) => delta.lte(by), "less or equal");
  }

  private async assert(
    fn: (d: Delta) => boolean,
    innerString: string
  ): Promise<void> {
    const delta = await this.delta();
    this.t.assert(
      fn(delta),
      `Account ${
        this.account.accountId
      } expected ${innerString} got: ${delta.toHuman()}`
    );
  }

  async toHuman(): Promise<string> {
    return (await this.delta()).toHuman();
  }
}

function isZero(bd: BalanceDelta): Promise<void> {
  return bd.isZero();
}

function gt(bd: BalanceDelta, by?: NEAR): Promise<void> {
  return bd.isGreater(by);
}
function gte(bd: BalanceDelta, by?: NEAR): Promise<void> {
  return bd.isGreaterOrEqual(by);
}
function lt(bd: BalanceDelta, by?: NEAR): Promise<void> {
  return bd.isLess(by);
}
function lte(bd: BalanceDelta, by?: NEAR): Promise<void> {
  return bd.isLessOrEqual(by);
}

type DeltaFn = (bd: BalanceDelta, by?: NEAR) => Promise<void>;

export async function applyDelta<T>(
  t,
  account: NearAccount,
  txns: () => Promise<T>,
  deltaFn: DeltaFn,
  by?: NEAR,
): Promise<T> {
  const deltaBalance = await BalanceDelta.create(account, t);
  const res = await txns();
  await deltaFn(deltaBalance, by);
  return res;
}

export function zeroDelta<T>(
  t,
  account: NearAccount,
  txns: () => Promise<T>
): Promise<T> {
  return applyDelta(t, account, txns, isZero);
}

/* 
  Asserts that the delata is within the bounds passed
*/
export function hasDelta<T>(
  t,
  account: NearAccount,
  amount: NEAR,
  // Whether to include equal to
  inclusive: boolean,
  txns: () => Promise<T>
): Promise<T> {
  let fn: DeltaFn;

  if (amount.isNeg()) {
    fn = inclusive ? gte : gt;
  } else {
    fn = inclusive ? lte : lt;
  }

  return applyDelta(t, account, txns, fn, amount);
}

export function repeat<T>(
  iterations: number,
  fn: (i: number) => Promise<T>
): Promise<T[]> {
  return Promise.all(Array(iterations).map(fn));
}


export async function getDelta<T>(t, account: NearAccount, txns: () => Promise<T>): Promise<[BalanceDelta, T]> {
  const delta = await BalanceDelta.create(account, t);
  
  return [delta, await txns()]
}