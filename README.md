# Tenk NFT

The main idea of this contract is creating a set of items upfront, for example 10,000 hence tenk.  Then each time a token is minted it is randomly chosen from the remaning tokens. This contract also introduces the idea of using a linkdrop proxy to allow the owner or a customer to "pre-mint" an item.


## Details

Each item is placed in a folder named for its index in the list of items.  This folder contains a file named `media` of the item and a file `info.json` containing the information about the item. All folders are placed into one folder and added to IPFS.  This hash is used as the uri for the contract and all minted token's ids are indexes into this folder.

For example,
- [QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe](https://ipfs.io/ipfs/QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe)
- [QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe/0](https://ipfs.io/ipfs/QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe/0)
- [QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe/0/media](https://ipfs.io/ipfs/QmPphE8ZeR9E7yxFNFTXEfKVe1Up4P1cQrkcXQzmEM8RJe/0/media)


## Linkdrop proxy

Currently this project wraps its own linkdrop-proxy, but in the future it this will be its own contract that any contract use for the same ability to add a callback to be used when the linkdrop is claimed.  See this PR: https://github.com/near-apps/linkdrop-proxy/pull/3.

## Aspects of Near that prevents hacks on this method of minting 

Here is [one example](https://cointelegraph.com/news/85-million-meebits-nft-project-exploited-attacker-nabs-700-000-collectible) of a "hack" that stole $85 million worth of nfts minted in a similar fasion. The "attacker" was able to map the NFT's id (our index) to its worth (its rarity). Then made a contract that made a cross contract call to mint an NFT, then canceling the transaction if it's not rare enough.  Though this cost the "attacker" $20K fees per hour, they were able to see the rare items and reap the reward.

The key aspect that this hack and others like it on Ethereum rely on is that a series of cross contract calls either succeed or fail. This way you can opt out of it before the end and goods never change hands.  On Near this is not the case.  Each cross contract call is asynchronous and can change the state.  This means when you use a cross contract call to mint a token and it suceeds, any money spent is gone and the token minted. Thus unlike the Ethereum example if you aren't satisfied with the token you received you can't choose to not receive it and not pay the owner.

## Development

This project also aims to highlight the newest way to test smart contracts on near usinge [`near-runner`](https://github.com/near/runner-js).
