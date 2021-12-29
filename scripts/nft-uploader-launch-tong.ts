import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";

declare interface File {
  _parts: any[];
}

function here(s = ""): string {
  return path.join(__dirname, "..", "assets","Aquarius1111", s);
}

const id_regex = /^a(?<id>[0-9]+)/;

async function getInfo(file: string): Promise<{ id: string; info: any }> {
  const id = file.match(id_regex).groups.id;
  const infoFile =  `a${id}.json`;
  const info = (await fs.readFile(here(infoFile))).toString();
  return {
    id,
    info
  };
}

async function parseFiles(): Promise<typeof File[]> {
  const directory = await fs.readdir(here());
  const pics = directory.filter(s => s.endsWith(".png"));
  const files = await Promise.all(
    pics.map(async (file) => {
      const { id, info } = await getInfo(file);
      let res = [
        new File([await fs.readFile(here(file))], `${id}.png`),
        new File([info], `${id}.json`),
      ];
      console.log(id, info);
      return res;
    })
  );

  return files.flat();
}

function makeLink(s: string): string  {
  return `https://${s}.ipfs.dweb.link`;
}

async function main() {
  const initialFiles = await parseFiles();
  const client = new NFTStorage({ token: API_TOKEN });
  const CID = await client.storeDirectory(initialFiles);
  console.log(makeLink(CID));
}

void main();
