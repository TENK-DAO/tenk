#!/usr/bin/env node -r ts-node/register --max-old-space-size=16000

import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";
import { glob as g } from "glob";
import { promisify } from "util";

const glob = promisify(g);

declare interface File {
  _parts: any[];
}

const id_regex = /^(?<id>[0-9]+)/;

async function getInfo(
  fullPath: string,
  rootDir: string
): Promise<{ id: string; info: any }> {
  const [dir, file] = [path.dirname(fullPath), path.basename(fullPath)];
  let first_bit = file.split(".")[0];
  const { id } = file.match(id_regex).groups;
  if (!id) {
    console.error(`Failed to find the id in ${fullPath}`);
  }
  const infoFiles = await glob(`${rootDir}/**/${first_bit}.json`);
  if (infoFiles.length == 0) {
    throw new Error(`Can't find metadata for ${fullPath}`);
  }

  if (infoFiles.length != 1) {
    throw new Error(
      `Found multiple metadata files for ${fullPath}: ${JSON.stringify(
        infoFiles
      )}`
    );
  }
  const info = await fs.readFile(infoFiles[0], { encoding: "utf8" });
  return {
    id: parseInt(id).toString(),
    info,
  };
}

async function parseFiles(
  directory: string,
  asset_extension: string,
  num: number
): Promise<typeof File[]> {
  const directoryFiles = await (await glob(`${directory}/**/*${asset_extension}`)).slice(num);
  const total = directoryFiles.length;
  console.log(`about to load ${total} files with extension: ${asset_extension}`);
  const twentieth = Math.floor(total / 20);
  let length = directory.length;
  let id_set = new Set(Array.from({ length }).map((_, i) => `${i}`));
  let finished = 0;
  const files = [];

  for (let file of directoryFiles) {
    finished++;
    if (finished % twentieth == 0) {
      console.log(`Read ${Math.floor((finished / total) * 100)}%`);
    }
    const { id, info } = await getInfo(file, directory);
    id_set.delete(id);
    let res = [
      new File([await fs.readFile(file)], `${id}${asset_extension}`),
      new File([info], `${id}.json`),
    ];
    files.push(...res);
  }
  if (id_set.size > 0) {
    throw new Error(
      `The following ids are missing: ${Array.from(id_set).join(", ")}`
    );
  }

  return files.flat();
}

function makeLink(s: string): string {
  return `https://${s}.ipfs.dweb.link`;
}

async function main() {
  const [directory, asset_extension, count] = process.argv.slice(2);
  if (!directory) {
    console.error("Upload NFT assets to nft.storage");
    console.error("Usage: <directory> <assetExtension>? <count?>");
    console.error(
      "directory where images and metadata that are numbered starting at zero.\n\t\t\t\t e.g. '0.png', '0.json'"
    );
    console.error("assetExtension is optional (default: '.png')");
    process.exit(1);
  }
  let num = parseInt(count ?? "0");
  const initialFiles = await parseFiles(directory, asset_extension ?? ".png", -num);
  if (num !=  0) {
    console.log(initialFiles)
    return;
  }
  if (!API_TOKEN) {
    console.error("Environment variable `NFT_STORAGE_API_TOKEN` is not set");
    return;
  }
  const client = new NFTStorage({ token: API_TOKEN });
  const CID = await client.storeDirectory(initialFiles);
  const link = makeLink(CID);
  console.log(CID);
  console.log(link);
  console.log(link + "/0.png");
  console.log(link + "/0.json");
}

void main();
