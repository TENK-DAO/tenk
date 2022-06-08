import { join } from "path";

const RUST_BIN_FOLDER = ["target", "res"];

export function binPath(name: string): string {
  return join(__dirname, "..", "..", ...RUST_BIN_FOLDER, `${name}.wasm`);
}

export const CONTRACT_PATH = binPath("tenk");
