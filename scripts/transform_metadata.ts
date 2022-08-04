import * as fs from "fs/promises";

export async function main(): Promise<void> {
    
    let [input_dir, output_dir] = process.argv.slice(2);

    if (!input_dir) {
      console.error("<input_dir> <output_dir? = ./out>")
      process.exit(1);
    }

    const isJSONFile = (s) => s.endsWith(".json")
    console.log(input_dir, output_dir);
    let json_files = (await fs.readdir(input_dir)).filter(isJSONFile);
    console.log(json_files)

    
    
}
void main()