# Tenk NFT

This contract publishes collections of NFT for example 10,000, hence TenK.  Each time a token is minted it is randomly chosen from the remaining tokens. The core mechanism for this is a `Raffle` collection type, which allows randomly picking from a range without replacement. This contract also introduces the idea of using a linkdrop proxy to allow the owner or a normal user to "pre-mint" an item.

## Details

Each `token_id` is numbered in a range, e.g. `0-10,000`.  This each asset and its metadata then named correspondingly, e.g. `0.png`, `0.json`. These files are placed into a flat directory and added to IPFS.  This hash is used as the `base_uri` for the contract and all minted `token_id` can be used to find its corresponding file.

For example,

- [https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link](https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link)
- [https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/42.png](https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/42.png)
- [https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/42.json](https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/42.json)

## Linkdrop proxy

Currently this project wraps its own linkdrop-proxy, but in the future it this will be its own contract that any contract use for the same ability to add a callback to be used when the linkdrop is claimed. When a linkdrop is created it reserves a raffle draw to be made when claiming. This allows the token to be a surprise (unless it's the last one).


## API

TypeScript docs are found at [https://tenk-dao.github.io/tenk/docs](https://tenk-dao.github.io/tenk/docs).

Currently there is no standard format to describe the types of a contract. One proposal is to use the [`wit` format](https://github.com/bytecodealliance/wit-bindgen/blob/main/WIT.md),
which while intended as a tool to generate bindings that act as polyfill for [`WebAssembly Interface Types`](https://github.com/WebAssembly/interface-types), it provides a language agnostic
way to describe types for the API of a Wasm Binary.

This work has led to the creation of [`witme`](https://github.com/ahalabs/witme), a tool for both generating a `.wit` document describing a Rust smart contract and generating a TypeScript file
from a `.wit` document.  The generated TS file also includes a `Contract` class which handles calling the corresponding methods.

For example, `nft_transfer` generates the following three functions:

```typescript

// Will throw if there is an error and parse result if it exist.
nft_transfer(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
}, options?: ChangeMethodOptions): Promise<void>;

// Will return the response from the server regardless of it succeeded
nft_transferRaw(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;

// Creates a function call action that can be added to a transaction
// See the `./scripts/deploy.ts` for how this can be used
nft_transferTx(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
}, options?: ChangeMethodOptions): transactions.Action;
```

Having the types mean that your contract calls will be type checked and prevent failed transactions from missing or malformed arguments.

View calls also generate a function.

```typescript
/// makes a view call and parses the result
nft_payout(args: {
    token_id: string;
    balance: U128;
    max_len_payout?: number;
}, options?: ViewFunctionOptions): Promise<Payout>;

nft_token(args: { token_id: TokenId;}, options?: ViewFunctionOptions): Promise<Token | null>;
```


### Using the contract's types

The main file and types of this package are found `./contracts/tenk/dist/*`
and specified in the `package.json`. These


From another TS project:

```ts
import { Contract } from "tenk-nft"

...


async function main({account}) {
  const contract = new Contract(account, "tenkv0.testnet.tenk");

  await contract.nft_transfer({receiver_id: "eve.testnet", token_id: "0"});
  const token = await contract.nft_token({token_id: "0"})
  console.log(`token ${token}`);
}
```

## Using scripts with `near-cli`

A recent update to `near-cli` allows passing a script the current context of the current `near` environment. This includes the account that is signing the transactions, access to the same `near-api-js` that the cli is using, and an array of arguments passed to the script.

For example, from the script [`update_royalties.ts`](./scripts/update_royalties.ts):

```typescript
import {Context} from "near-cli/context";
import {Contract} from "..";

export async function main({ account, argv }: Context) {
  let [contractId] = argv;
  if (contractId === null) {
    console.error("need to supply contract's accountId")
    console.error("... -- <contractId>")
  }
  let contract = new Contract(account, contractId);
  const royalties = {
    percent: 690,
    accounts: {
      "tenk.sputnik-dao.near": 2500,
      "bob.near": 7500,
    }
  };
  let res = await contract.update_royalties({ royalties });
}
```

Run the script with `near-cil`'s `repl` command using the option `-s` to pass a script.  Other arguments of near-cli can be passed 
and any arguments after the `--` are collected in the passed `argv`.

```bash
near repl -s ./scripts/update_royalties.ts --accountId owner.testnet -- contract.testnet
```

This makes it easy to create your own near scripts, while still getting the benefit of type checking parameters.

## Uploading Assets with [`nft-cli`](https://github.com/TENK-DAO/nft-cli)

1. Have `NFT_STORAGE_API_TOKEN` env var set to api key from https://nft.storage
1. Have assets numbered `0-x` with matching names `0.png` `0.json` in all in the same directory. E.g. `dir/0.png` `dir/0.json`.
1. Install `nft-cli`: `npm install -g nft-cli`
1. Pack assets with `nft pack dir --output nfts.car`
1. Upload to nft.storage with `nft upload nfts.car`.  Optionaly can pass api token with `--api-key`

## Aspects of Near that prevents hacks on this method of minting

Here is [one example](https://cointelegraph.com/news/85-million-meebits-nft-project-exploited-attacker-nabs-700-000-collectible) of a "hack" that stole $85 million worth of nfts minted in a similar fasion. The "attacker" was able to map the NFT's id (our index) to its worth (its rarity). Then made a contract that made a cross contract call to mint an NFT, then canceling the transaction if it's not rare enough.  Though this cost the "attacker" $20K fees per hour, they were able to see the rare items and reap the reward.

The key aspect that this hack and others like it on Ethereum rely on is that a series of cross contract calls either succeed or fail. This way you can opt out of it before the end and goods never change hands.  On Near this is not the case.  Each cross contract call is asynchronous and can change the state.  This means when you use a cross contract call to mint a token and it succeeds, any money spent is gone and the token minted. Thus unlike the Ethereum example if you aren't satisfied with the token you received you can't choose to not receive it and not pay the owner.


## NFT Standards

For more information about the API provided by the NFT standard see [nomicon.io](https://nomicon.io/Standards/NonFungibleToken).

## FT Standards
For more information about the API provided by the NFT standard see [nomicon.io](https://nomicon.io/Standards/FungibleToken).

## Development

This project also aims to highlight the newest way to test smart contracts on near using [`near-workspaces`](https://github.com/near/workspaces-js).  See example tests in [`__test__`](./__test__).

Node must be installed. And Rust must be install see [Getting Started in near-sdk.io](https://www.near-sdk.io/).

To build docs `witme` must be installed.

```bash
cargo install witme
```
