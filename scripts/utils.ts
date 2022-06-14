import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { join } from "path";

export function binPath(name) {
  const RUST_BIN_FOLDER = ["target", "res"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

export const valid_account_id = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/;

const linkmatcher =
  /https:\/\/wallet.near.org\/linkdrop\/[^/]+\/(?<key>.+)\?redirectUrl=/;

export function getPublicKey(link) {
  const m = link.match(linkmatcher).groups.key;
  return KeyPairEd25519.fromString(m).getPublicKey();
}