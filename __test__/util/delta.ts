import { NEAR, NearAccount } from "near-workspaces-ava";

export class NEARDelta {
  static readonly ZERO_NEAR = NEAR.from(0);
  constructor(public readonly amount: NEAR) {}

  toHuman(): string {
    if (this.isZero()) {
      return `0 N`;
    }
    const absAmount = this.amount.abs();
    return `${this.amount.isNeg() ? "-" : ""}${absAmount.toHuman()}`;
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  gt(by = NEARDelta.ZERO_NEAR): boolean {
    return this.amount.gt(by);
  }

  gte(by = NEARDelta.ZERO_NEAR): boolean {
    return this.amount.gte(by);
  }

  lt(by = NEARDelta.ZERO_NEAR): boolean {
    return this.amount.lt(by);
  }

  lte(by = NEARDelta.ZERO_NEAR): boolean {
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

  async delta(): Promise<NEARDelta> {
    const newBalance = await this.account.availableBalance();
    return new NEARDelta(newBalance.sub(this.initial));
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
    fn: (d: NEARDelta) => boolean,
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

  async log(): Promise<void> {
    this.t.log(`${this.account.accountId} has delta ${await this.toHuman()}`);
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
  by?: NEAR
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
  return Promise.all(Array.from({ length: iterations }).map(fn));
}

export async function getDelta<T>(
  t,
  account: NearAccount,
  txns: () => Promise<T>
): Promise<[BalanceDelta, T]> {
  const delta = await BalanceDelta.create(account, t);
  return [delta, await txns()];
}
