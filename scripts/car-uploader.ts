#!/usr/bin/env node -r ts-node/register --max-old-space-size=16000
import { createReadStream } from 'fs'
import { CarReader } from '@ipld/car'
import { NFTStorage } from "nft.storage";
import * as fs from "fs/promises";

const API_TOKEN = process.env["NFT_STORAGE_API_TOKEN"];

async function storeCarFile(filename) {
  var stats = await fs.stat(filename);
  const car = await CarReader.fromIterable(createReadStream(filename));
  let total = 0;
  function onStoredChunk(i) {
    total += i;
    console.log(`${(total/stats.size * 100).toFixed(1)}%`);
  }
  
  const client = new NFTStorage({ token: API_TOKEN });
  return client.storeCar(car, {onStoredChunk});
}


function makeLink(s: string): string {
  return `https://${s}.ipfs.dweb.link`;
}


async function main() {
  const [carFile] = process.argv.slice(2); 
  const CID = await storeCarFile(carFile);
  const link = makeLink(CID);
  console.log(CID);
  console.log(link);
  console.log(link + "/0.png");
  console.log(link + "/0.json");
}

void main();