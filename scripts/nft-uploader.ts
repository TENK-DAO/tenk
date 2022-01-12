import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";

declare interface File {
  _parts: any[];
}

const id_regex = /^(?<id>[0-9]+)/;

async function getInfo(fullPath: string): Promise<{ id: string; info: any }> {
  const [dir, file] = [path.dirname(fullPath), path.basename(fullPath)];
  const { id } = file.match(id_regex).groups;
  if (!id) {
    console.error(`Failed to find the id in ${fullPath}`);
  }
  const infoFile = path.join(dir, `${id}.json`);
  const info = await fs.readFile(infoFile, { encoding: "utf8" });
  return {
    id,
    info,
  };
}

async function parseFiles(directory: string, asset_extension = ".png"): Promise<typeof File[]> {
  const directoryFiles = await fs.readdir(directory);
  const pics = directoryFiles.filter((s) => s.endsWith(asset_extension));
  const total = pics.length;
  const twentieth = Math.floor(total / 20);
  let finished = 0;
  
  const files = await Promise.all(
    pics.map(async (f) => {
      const file = path.join(directory, f);
      const { id, info } = await getInfo(file);
      let res = [
        new File([await fs.readFile(file)], `${id}${asset_extension}`),
        new File([info], `${id}.json`),
      ];
      finished++;
      if (finished % twentieth == 0) {
        console.log(`${Math.floor(finished/total*100)}%`)
      }
      return res;
    })
  );

  return files.flat();
}

function makeLink(s: string): string {
  return `https://${s}.ipfs.dweb.link`;
}

async function main() {
  const [directory, asset_extension] = process.argv.slice(2);
  if (!directory) {
    console.error("Upload NFT assets to nft.storage");
    console.error("Usage: <directory> <assetExtension>?");
    console.error("directory where images and metadata that are numbered starting at zero.\n\t\t\t\t e.g. '0.png', '0.json'");
    console.error("assetExtension is optional (default: '.png')");
    process.exit(1);
  }
  const initialFiles = await parseFiles(directory, asset_extension);
  const client = new NFTStorage({ token: API_TOKEN });
  const CID = await client.storeDirectory(initialFiles);
  const link = makeLink(CID)
  console.log(CID);
  console.log(link);
  console.log(link +"/0.png")
  console.log(link +"/0.json")
}

void main();
