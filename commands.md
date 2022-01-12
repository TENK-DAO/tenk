# Commands

```sh
near deploy --wasmFile target/wasm32-unknown-unknown/release/tenk.wasm --accountId flyingsaucertenk.testnet

near call flyingsaucertenk.testnet new_default_meta --accountId flyingsaucertenk.testnet '{"owner_id": "flyingsaucertenk.testnet", "name": "NDN", "symbol": "NDN", "uri": "https://pixabay.com/images/", "size": 10, "base_cost": "1", "min_cost": "1"}'

near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucertenk.testnet"}'
near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucer00.testnet"}'

near call flyingsaucertenk.testnet nft_mint_one --accountId flyingsaucertenk.testnet --deposit '0.01523'
```