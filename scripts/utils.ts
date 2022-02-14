import { join } from "path";

export function binPath(name) {
  const RUST_BIN_FOLDER = ["target", "wasm32-unknown-unknown", "release"];
  return join(__dirname, "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

export const valid_account_id = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/;