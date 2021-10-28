import { NEAR } from "near-units";

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
