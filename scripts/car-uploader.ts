#!/usr/bin/env node -r ts-node/register --max-old-space-size=16000
import { createReadStream } from 'fs'
import { CarReader } from '@ipld/car'

import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";
import { glob as g } from "glob";
import { promisify } from "util";

async function storeCarFile(filename) {
  const inStream = createReadStream(filename)
  const car = await CarReader.fromIterable(inStream)
  
  const client = new NFTStorage({ token: API_TOKEN });
  return client.storeCar(car);
  // const cid = await client.putCar(car)
  // console.log('Stored CAR file! CID:', cid)
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