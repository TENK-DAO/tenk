import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "./api_token";
// import { getInfo } from "./metadata";

declare interface File {
  _parts: any[];
}

function here(s = ""): string {
  return path.join(__dirname, "tenK_initial_100", s);
}

const id_regex = /^(?<id>[0-9]+)/;

function getInfo(file: string): { id: string; info: any } {
  return {
    ...file.match(id_regex).groups as {id: string},
    info: JSON.stringify({
      repo: "https://github.com/willemneal/tenk",
    }),
  };
}

async function parseFiles(): Promise<typeof File[][]> {
  const directory = await fs.readdir(here());
  const files = await Promise.all(
    directory.map(async (file) => {
      const { id, info } = getInfo(file);
      console.log(id, info);
      return [
        new File([await fs.readFile(here(file))], `${id}.png`),
        new File([info], `${id}.json`),
      ];
    })
  );

  return files;
}

async function main() {
  const initialFiles = await parseFiles();
  // return;
  const client = new NFTStorage({ token: API_TOKEN });
  // const numOfFiles = initialFiles.length;
  // for (let i = numOfFiles; i < 10_000; i++) {
  //   const idx = i % 10;
  //   const [media, info] = initialFiles[idx];
  //   const newFile = [
  //     // @ts-ignore
  //     new File(media._parts, `${i}.png`),
  //     // @ts-ignore
  //     new File(info._parts, `${i}.json`),
  //   ];
  //   initialFiles.push(newFile);
  // }

  const CID = await client.storeDirectory(initialFiles.flat());
  console.log(CID);
}

main();
