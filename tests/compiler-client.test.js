import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createCompilerClient,
  createConfiguredCompiler,
} from "../src/firmware/compiler-client.js";
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

test("serviço HTTPS configurado compila o código atual e não disfarça indisponibilidade como exemplo", async () => {
  const endpoint = "https://compiler.example/api/compile";
  let received;
  const compile = createCompilerClient({
    endpoint,
    request: async (url, options) => {
      received = { url, source: JSON.parse(options.body).source };
      return Response.json(artifact);
    },
  });
  assert.equal(
    (await compile(examples.blink.source)).origin,
    "remote-compiler",
  );
  assert.deepEqual(received, { url: endpoint, source: examples.blink.source });
  const offline = createCompilerClient({
    endpoint,
    request: async () => {
      throw new TypeError("offline");
    },
  });
  await assert.rejects(offline(examples.blink.source), /indisponível/);
  assert.throws(
    () =>
      createCompilerClient({
        endpoint: "http://untrusted.example/api/compile",
      }),
    /HTTPS/,
  );
});

test("configuração da prévia respeita o caminho do PR e encaminha edições ao compilador remoto", async () => {
  const source = examples.blink.source.replaceAll("1000", "125");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );
  const sourceHash = Buffer.from(digest).toString("hex");
  const urls = [];
  const compile = createConfiguredCompiler({
    base: "/ghostlab/pr-35/",
    request: async (url, options) => {
      urls.push(url);
      if (url.endsWith("compiler-config.json")) {
        assert.equal(options.cache, "no-store");
        return Response.json({
          endpoint: "https://compiler.example/api/compile",
        });
      }
      assert.equal(JSON.parse(options.body).source, source);
      return Response.json({ ...artifact, sourceHash });
    },
  });
  assert.deepEqual(urls, []);
  assert.equal((await compile(source)).origin, "remote-compiler");
  assert.equal((await compile(source)).origin, "remote-compiler");
  assert.deepEqual(urls, [
    "/ghostlab/pr-35/compiler-config.json",
    "https://compiler.example/api/compile",
    "https://compiler.example/api/compile",
  ]);
});

test("configuração indisponível ou inválida falha sem trocar o firmware e permite tentar novamente", async () => {
  const urls = [];
  let attempt = 0;
  const compile = createConfiguredCompiler({
    request: async (url) => {
      urls.push(url);
      attempt++;
      if (attempt === 1) throw new TypeError("offline");
      return Response.json({ endpoint: "http://compiler.example/api/compile" });
    },
  });
  await assert.rejects(
    compile(examples.blink.source),
    /configuração.*indisponível/i,
  );
  await assert.rejects(compile(examples.blink.source), /HTTPS/);
  assert.deepEqual(urls, ["./compiler-config.json", "./compiler-config.json"]);
});

test("desenvolvimento local ignora configuração remota; somente 404 restaura o modo padrão", async () => {
  const localUrls = [];
  const local = createConfiguredCompiler({
    local: true,
    request: async (url) => {
      localUrls.push(url);
      return Response.json(artifact);
    },
  });
  assert.equal((await local(examples.blink.source)).origin, "compiler");
  assert.deepEqual(localUrls, ["/api/compile"]);
  const urls = [];
  const unconfigured = createConfiguredCompiler({
    request: async (url) => {
      urls.push(url);
      return url.endsWith("compiler-config.json")
        ? new Response("", { status: 404 })
        : Response.json(artifact);
    },
  });
  assert.equal((await unconfigured(examples.blink.source)).origin, "compiler");
  assert.deepEqual(urls, ["./compiler-config.json", "/api/compile"]);
  const unavailable = createConfiguredCompiler({
    request: async () => new Response("offline", { status: 503 }),
  });
  await assert.rejects(
    unavailable(examples.blink.source),
    /configuração.*indisponível/i,
  );
});
