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

function readValue(mapping: string[], index: string): string {
  return mapping[parseInt(index)];
}


export function getInfo(file: string): {info: string, id: string} {
  const groups = file.match(regex).groups;
  // console.log(file, groups)
  const { id, bg, legs, head, face, symbol } = groups;
  const info = {
    extra: [
      { trait_type: "Planet", value: readValue(BACKGROUNDS, bg) },
      { trait_type: "Bod", value: readValue(HEADS, head) },
      { trait_type: "Mood", value: readValue(FACES, face) },
      { trait_type: "Fit", value: readValue(LEGS, legs) },
      { trait_type: "Team", value: readValue(SYMBOLS, symbol) },
    ],
  };
  return {info: JSON.stringify(info), id};
}