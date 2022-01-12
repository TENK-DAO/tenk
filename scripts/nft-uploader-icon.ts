import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "../api_token";

declare interface File {
  _parts: any[];
}

function here(s = ""): string {
  return path.join(__dirname, "..", "assets", "tong", s);
}

const id_regex = /^(?<letter>[a-l])(?<id>[0-9]+)/;

function letterToInt(s: string): number {
  return s.codePointAt(0) - "a".codePointAt(0);
}

async function getInfo(file: string): Promise<{ num: number; info: any }> {
  const { id, letter } = file.match(id_regex).groups;
  const num = 1_000 * letterToInt(letter) + parseInt(id) - 1;
  const infoFile = `${letter}${id}.json`;
  const info = await fs.readFile(here(infoFile), { encoding: "utf8" });
  return {
    num,
    info,
  };
}

async function parseFiles(): Promise<typeof File[]> {
  const directory = await fs.readdir(here());
  const pics = directory.filter((s) => s.endsWith(".png"));
  // const json = directory.filter(s => s.endsWith(".json"));
  console.log(pics.length);
  // process.exit(0);
  const files = await Promise.all(
    pics.map(async (file) => {
      const { num, info } = await getInfo(file);
      let res = [
        new File([await fs.readFile(here(file))], `${num}.png`),
        new File([info], `${num}.json`),
      ];
      console.log(num, info);
      return res;
    })
  );

  return files.flat();
}

function makeLink(s: string): string {
  return `https://${s}.ipfs.dweb.link`;
}

async function main() {
  // const initialFiles = await parseFiles();
  const image_data = await fs.readFile("/Users/willem/Downloads/tongdao.jpeg");
  let initialFiles = [new File([image_data], "tongdao.jpeg")];
  const client = new NFTStorage({ token: API_TOKEN });
  const CID = await client.storeDirectory(initialFiles);
  console.log(makeLink(CID));
}

void main();
