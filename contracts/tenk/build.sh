#!/bin/bash
set -e
cargo install --git https://github.com/ahalabs/witgen --rev 1aca670c8c4589a214a7e9e1e79bd9a89001870e cargo-witgen
cargo install --git https://github.com/ahalabs/wit-bindgen --rev fe43a371d31d8875b0856de5a954f537fe71f7cd wit-bindgen-cli
# cargo install --path ~/c/wit-bindgen

cargo witgen generate --prefix-file ./sdk.wit
wit-bindgen js-near -i ./witgen.wit --out-dir res/
mv res/witgen.ts res/index.ts
tsc
