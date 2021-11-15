import { Gas, NEAR } from "near-units";
import { Account, BN, NearAccount, Workspace } from "near-workspaces";

export const CONTRACT_PATH = `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`;

export const DEFAULT_BASE_COST = NEAR.parse("10 N");
export const DEFAULT_MIN_COST= NEAR.parse("1 N");


export function DEFAULT_INIT_ARGS(owner_id: string, base_cost = DEFAULT_BASE_COST, min_cost = DEFAULT_MIN_COST) {
  return {
    owner_id,
    name: "meerkats",
    symbol: "MK",
    uri: "https://ipfs.io/ipfs/QmaDR7ozkawfnmEirvErfcJm27FEyFv5U1KQDfWkHGj5qD",
    size: 10000,
    base_cost,
    min_cost,
  };
}

export function randomAccountId(): string {
  let accountId;
  // create random number with at least 7 digits
  const randomNumber = Math.floor(Math.random() * (9999 - 1000) + 1000);
  accountId = `d${Date.now() % 100000}${randomNumber}`;
  return accountId;
}

export async function costPerToken(tenk: NearAccount, num: number): Promise<NEAR> {
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
