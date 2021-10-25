import { NEAR } from "near-units";

export const CONTRACT_PATH = `${__dirname}/../target/wasm32-unknown-unknown/release/tenk.wasm`;

export const DEFAULT_BASE_COST = NEAR.parse("10 N");
export const DEFAULT_MIN_COST= NEAR.parse("1 N");


export function DEFAULT_INIT_ARGS(owner_id: string, linkdrop_contract: string, base_cost = DEFAULT_BASE_COST, min_cost = DEFAULT_MIN_COST) {
  return {
    owner_id,
    name: "minimo",
    symbol: "MIMO",
    uri: "https://ipfs.io/ipfs/bafybeifxzm547rdsckq2crw4dipjvsw4togrnhwzb7gy7ae4anqqgjt264",
    linkdrop_contract,
    size: 100,
    base_cost,
    min_cost,
  };
}
