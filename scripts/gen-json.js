#!/usr/bin/env node

let args = process.argv.slice(2);
if (args.length < 1) {
    console.error("Need <id>");
    process.exit(1);
}

let [id,] = args;

let json = {
    name: `Dark Prince Chest #${id}`,
    image: "ipfs://bafybeigh4mop4opt7weh6cpny6qwh2owyn42v3azp67z77xahzierz35am",
    description: "Very precious Dark Prince NFT Chest with one random unique NFT-weapon inside such as: Axe, Hammer, Bow, Staff or Dual Sword of different grades up to Legendary level.",
    edition: parseInt(id)
}

console.log(JSON.stringify(json, null, 1))