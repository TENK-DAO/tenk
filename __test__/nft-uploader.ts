import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";
import * as path from "path";
import { API_TOKEN } from "./api_token";
import { getInfo } from "./metadata";

declare interface File {
  _parts: any[];
}

function here(s = ""): string {
  return path.join(__dirname, "test_files", s);
}

async function parseFiles(): Promise<typeof File[][]> {
  const directory = await fs.readdir(here());
  const files = await Promise.all(
    directory.map(async (file) => {
      const {info, id} = getInfo(file);
      return [
        new File([await fs.readFile(here(file))], `${id}.png`),
        new File([info], `${id}.json`),
      ];
    })
  );

  return files;
}

async function main() {
  const client = new NFTStorage({ token: API_TOKEN });
  const initialFiles = await parseFiles();
  const numOfFiles = initialFiles.length;
  for (let i = numOfFiles; i < 100; i++) {
    const idx = i % 10;
    const [media, info] = initialFiles[idx];
    const newFile = [
      // @ts-ignore
      new File(media._parts, `${i}.png`),
      // @ts-ignore
      new File(info._parts, `${i}.json`),
    ];
    initialFiles.push(
      newFile
    )
  }

  const CID = await client.storeDirectory(initialFiles.flat());
  console.log(CID);
}

main();
