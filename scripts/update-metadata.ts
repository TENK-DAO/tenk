import * as fs from "fs/promises";


async function main() {
    let dir = (await fs.readdir(".")).filter(s => s.endsWith(".json"));
    for (let f of dir.slice(0)) {
        await fs.writeFile(`../assets/${f}`, await fixJson(f))
    }

}

const IMAGES_IPFS_HASH = "bafybeigqylxvaeehbojyo2mbpy3bghnd5vi7qwpflrmvqbxuu2w3wb5nqi";

main();

type Trait = { trait_type: string, value: string, rarity: string};

function not<T>(f: (t: T) => boolean): (t: T) => boolean {
    return (t: T) => !f(t)
}

function isTrait(s: string): (t: Trait) => boolean {
    return (t: Trait) => t.trait_type === s;
}

const isNose = isTrait("Nose");
const isSpecialEquipment = isTrait("Special Equipment");
const isSaveTheOcean = isTrait("Save the ocean");
const isGadgets = isTrait("Gadgets");

async function fixJson(file: string): Promise<string> {
    let json = JSON.parse(await fs.readFile(file, "utf8"));
    json.name = json.name.replace("Friendly Sea Creatures", "Friendly Turtle");
    json.attributes = updateAttrs(json.attributes, json);
    json.image = json.image.replace("NewUriToReplace", IMAGES_IPFS_HASH);
    return JSON.stringify(json, null, 2)
}

function updateAttrs(attrs: Trait[], json: any): Trait[] {
    
  // Delete Nose
  attrs = attrs.filter(not(isNose))

  
  if (attrs.some(({ trait_type }) => trait_type === "Nose")) {
      throw new Error("Should not be a nose")
  }
  
  // Special Equipment --> Hat
  let specialEquipment = attrs.find(isSpecialEquipment);
  if (specialEquipment) {
      attrs = attrs.filter(not(isSpecialEquipment));
      specialEquipment.value = specialEquipment.value.replace("Ninja Head", "Ninja").replace("Helmet", "Astronaut Helmet");
      specialEquipment.trait_type = "Hat";
      attrs.push(specialEquipment);
      // console.log(json)
  }

  // Save The Ocean --> Gadgets if "Yes"
  let saveTheOcean = attrs.find(isSaveTheOcean);
  if (!saveTheOcean) {
    console.log(json);
    process.exit(0)
  }
  attrs = attrs.filter(not(isSaveTheOcean));
  if (saveTheOcean.value === "Yes") {
    // console.log(json)
    attrs[attrs.findIndex(isGadgets)].value = "Save the ocean";
    attrs[attrs.findIndex(isGadgets)].rarity = saveTheOcean.rarity;
    // console.log(json)
  }

  attrs.map(trait => {
    if (trait.trait_type === "Mouth") {
      trait.value = trait.value.replace(" fat", "");
    }
    if (trait.trait_type === "Eyes") {
      trait.value = trait.value.replace("Golden ", "");
      trait.value = trait.value[0].toUpperCase() + trait.value.slice(1);
    }

    if (trait.trait_type === "Shell") {
      trait.value = trait.value.replace(" shell", "");
    }
    if (trait.trait_type === "Skin") {
      trait.value = trait.value.replace(" skin", "");
    }
    if (trait.trait_type === "Clothes") {
      let value = trait.value;
      trait.value = trait.value.replace("King-robe", "Royal Robe");
      if (value !== trait.value) {
        console.log(trait)
      }
    }
    return trait;
  })
  return attrs;
}