#!/bin/bash
set -e
cargo install witme

witme wit -t ts/ --prefix-file ./sdk.wit && tsc

