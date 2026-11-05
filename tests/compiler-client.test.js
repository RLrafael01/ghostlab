import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCompilerClient } from "../src/firmware/compiler-client.js";
import { examples } from "../src/firmware/examples.js";
const artifact = JSON.parse(
  await readFile(
    new URL("../public/firmware/blink.json", import.meta.url),
    "utf8",
  ),
);
test("prévia sem serviço executa só firmware correspondente ao exemplo original e informa sua origem", async () => {
  const compile = createCompilerClient({
    request: async (url) =>
      url === "/api/compile"
        ? new Response("not found", { status: 404 })
        : Response.json(artifact),
  });
  assert.equal((await compile(examples.blink.source)).origin, "example");
  await assert.rejects(
    compile(examples.blink.source.replaceAll("1000", "250")),
    /Compilador indisponível/,
  );
});
test("diagnósticos reais e hash divergente nunca são substituídos por exemplo nem firmware antigo", async () => {
  const diagnostics = ["sketch.ino:3: error: expected semicolon"];
  const compile = createCompilerClient({
    request: async () =>
      Response.json({ message: "Erro de C++", diagnostics }, { status: 422 }),
  });
  await assert.rejects(
    compile(examples.blink.source),
    (e) =>
      e.diagnostics === diagnostics ||
      JSON.stringify(e.diagnostics) === JSON.stringify(diagnostics),
  );
  const mismatch = createCompilerClient({
    request: async () => Response.json({ ...artifact, sourceHash: "errado" }),
  });
  await assert.rejects(mismatch(examples.blink.source), /não corresponde/);
});
