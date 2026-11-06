import { writeFile } from "node:fs/promises";
import { compileSketch } from "../server/compiler.js";
import { examples } from "../src/firmware/examples.js";
const selected = process.argv.slice(2);
for (const name of selected.length ? selected : Object.keys(examples)) {
  if (!Object.hasOwn(examples, name))
    throw new Error(`Exemplo desconhecido: ${name}`);
  const example = examples[name];
  const compiled = await compileSketch(example.source);
  await writeFile(
    new URL(`../public/firmware/${name}.json`, import.meta.url),
    JSON.stringify(compiled) + "\n",
  );
  console.log(name + " " + compiled.sourceHash);
}
