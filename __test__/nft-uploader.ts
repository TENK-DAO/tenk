import { File, NFTStorage } from "nft.storage";
import * as fs from "fs/promises";

const BACKGROUNDS = [
  "Sun",
  "Earth",
  "Europa",
  "Uranus",
  "Mercury",
  "Mars",
  "Pluto",
];

const LEGS = [
  "Red Green",
  "Black Yellow",
  "Blue Yellow",
  "Pink Red",
  "Yellow Orange",
];

const HEADS = [
  "Pink Doge",
  "Blue Poo",
  "Blue Puff",
  "Yellow Hatter",
  "Orange Hatter",
  "Blue Hatter",
  "Blue Fruit",
  "Orange Fruit",
  "Pink Fruit",
  "Purple Fruit",
  "Green Poo",
  "Yellow Poo",
  "MISSING",
  "Pink Poo",
  "Orange Appa",
  "Green Appa",
  "Blue Appa",
  "Red Appa",
  "Purple Puff",
  "Yellow Puff",
  "Pink Puff",
];

const FACES = [
  "😳",
  "😈",
  "👹",
  "👺",
  "🙂",
  "🤪",
  "😏",
  "🤩",
  "😙",
  "🙄",
  "😑",
  "😥",
  "MISSING",
  "🤨",
  "😒",
  "😕",
  "😖",
  "👁‍🗨",
];

const SYMBOLS = [
  "NEAR",
  "OMEGA",
  "PSI",
  "CHI",
  "PHI",
  "UPSILON",
  "TAU",
  "SIGMA",
  "RHO",
  "PI",
  "OMICRON",
  "XI",
  "MISSING",
  "NU",
  "LAMBDA",
  "KAPPA",
  "IOTA",
  "THETA",
];

const regex =
  /(?<id>\d+)_bg(?<bg>\d)-legs(?<legs>\d)-head(?<head>\d+)-face(?<face>\d+)-symbol(?<symbol>\d+).png/;

async function parseFiles(): Promise<typeof File[]> {
  const files = await fs.readdir(__dirname + "/test_files");
  const res = [];
  files.forEach(file => {
    const groups = file.match(regex).groups;
    console.log(file, groups)
    const { id, bg, legs, head, face, symbol } = groups;
    const info = {
      extra: [
        { trait_type: "Planet", value: BACKGROUNDS[parseInt(bg)] },
        { trait_type: "Bod", value: HEADS[parseInt(head)] },
        { trait_type: "Mood", value: FACES[parseInt(face)] },
        { trait_type: "Fit", value: LEGS[parseInt(legs)] },
        { trait_type: "Team", value: SYMBOLS[parseInt(symbol)] },
      ],
    };
    console.log(info);
  })

  return [];
}

// async function main() {
//   const client = new NFTStorage({ token: API_TOKEN });
//   // const cid = client.storeDirectory({})
// }

parseFiles();
