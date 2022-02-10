#!/bin/bash
set -e
cargo install cargo-witgen
cargo install --git https://github.com/ahalabs/wit-bindgen --rev 7cff7a3173d82ac14313d972737c476790fff217 aha-wit-bindgen-cli
# cargo install --path ~/c/wit-bindgen

cargo witgen generate --prefix-file ./sdk.wit
aha-wit-bindgen js-near -i ./witgen.wit --out-dir res/
mv res/witgen.ts res/index.ts
tsc
