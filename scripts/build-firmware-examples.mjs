import { writeFile } from "node:fs/promises";
import { compileSketch } from "../server/compiler.js";
import { examples } from "../src/firmware/examples.js";
for (const [name, example] of Object.entries(examples)) {
  const compiled = await compileSketch(example.source);
  await writeFile(
    new URL(`../public/firmware/${name}.json`, import.meta.url),
    JSON.stringify(compiled) + "\n",
  );
  console.log(name + " " + compiled.sourceHash);
}
