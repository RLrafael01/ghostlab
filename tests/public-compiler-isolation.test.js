import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";
import { once } from "node:events";
import { createHash } from "node:crypto";
import {
  compileSketch,
  toolRoot,
  toolEnvironment,
} from "../server/compiler.js";
import { compilerSandbox } from "../server/compiler-sandbox.js";
import { createPublicCompilerServer } from "../server/public-compiler-http.js";

const enabled = process.env.GHOSTLAB_TEST_SANDBOX === "1";
test(
  "compilador público não lê arquivos do host e ainda compila C++ e Servo reais",
  { skip: !enabled },
  async () => {
    const folders = await Promise.all(
      [tmpdir(), homedir(), resolve(".scratch")].map((root) =>
        mkdtemp(join(root, ".ghostlab-isolation-probe-")),
      ),
    );
    try {
      for (const folder of folders) {
        const path = join(folder, "private.h");
        await writeFile(path, "#error GHOSTLAB_PRIVATE_SENTINEL\n");
        await assert.rejects(
          compileSketch(`#include "${path}"\nvoid setup(){} void loop(){}`, {
            isolated: true,
          }),
          (error) =>
            error.code === "compile-error" &&
            !error.diagnostics
              .join("\n")
              .includes("GHOSTLAB_PRIVATE_SENTINEL") &&
            /permitted|denied/i.test(error.diagnostics.join("\n")),
        );
      }
      const result = await compileSketch(
        "#include <Servo.h>\nServo motor; void setup(){motor.attach(9);motor.write(90);} void loop(){}",
        { isolated: true },
      );
      assert.match(result.hex, /^:/);
      assert.equal(result.toolchain.libraries.Servo, "1.3.0");
    } finally {
      await Promise.all(
        folders.map((folder) => rm(folder, { recursive: true, force: true })),
      );
    }
  },
);

test(
  "HTTP público compila edições reais, rejeita C++ inválido e recupera após cancelamento",
  { skip: !enabled },
  async () => {
    const origin = "https://rlrafael01.github.io";
    const server = createPublicCompilerServer({ allowedOrigins: [origin] });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const url = `http://127.0.0.1:${server.address().port}/api/compile`;
    const post = (source) =>
      fetch(url, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
    try {
      await assert.rejects(
        compileSketch("void setup(){} void loop(){}", {
          isolated: true,
          timeoutMs: 1,
        }),
        (error) => error.code === "timeout",
      );
      const source =
        "void setup(){pinMode(13, OUTPUT);} void loop(){digitalWrite(13, HIGH);delay(125);digitalWrite(13, LOW);delay(125);}";
      const response = await post(source);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      const compiled = await response.json();
      assert.equal(
        compiled.sourceHash,
        createHash("sha256").update(source).digest("hex"),
      );
      assert.match(compiled.hex, /^:/);
      const invalid = await post(
        "void setup(){ missing_symbol(); } void loop(){}",
      );
      assert.equal(invalid.status, 422);
      const failure = await invalid.json();
      assert.equal(failure.code, "compile-error");
      assert.match(failure.diagnostics.join("\n"), /missing_symbol/);
      assert.ok(!failure.diagnostics.join("\n").includes(toolRoot));
    } finally {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  },
);

test(
  "sandbox permite somente escrita no job, preserva toolchain e bloqueia rede",
  { skip: !enabled },
  async () => {
    const work = await mkdtemp(join(toolRoot, "isolation-job-"));
    const outside = await mkdtemp(join(tmpdir(), "ghostlab-outside-"));
    const sandbox = await compilerSandbox({ toolRoot, work });
    const run = (command, args) =>
      new Promise((resolve, reject) => {
        const child = spawn(
          sandbox.command,
          [...sandbox.prefix, command, ...args],
          { cwd: "/", env: { ...toolEnvironment, TMPDIR: work } },
        );
        let output = "";
        child.stdout.on("data", (data) => (output += data));
        child.stderr.on("data", (data) => (output += data));
        child.on("error", reject);
        child.on("close", (code) => resolve({ code, output }));
      });
    let received = 0;
    const server = http.createServer((req, res) => {
      received++;
      res.end("probe");
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const url = `http://127.0.0.1:${server.address().port}/`;
    try {
      assert.equal(
        (await run("/usr/bin/touch", [join(work, "allowed")])).code,
        0,
      );
      assert.notEqual(
        (await run("/usr/bin/touch", [join(outside, "blocked")])).code,
        0,
      );
      assert.notEqual(
        (
          await run("/usr/bin/touch", [
            join(toolRoot, "arduino-user", "blocked-sandbox-probe"),
          ])
        ).code,
        0,
      );
      await fetch(url);
      assert.equal(received, 1);
      assert.notEqual(
        (
          await run("/usr/bin/curl", [
            "--max-time",
            "2",
            "--silent",
            "--show-error",
            url,
          ])
        ).code,
        0,
      );
      assert.equal(received, 1);
      const huge = join(work, "oversized-artifact");
      assert.notEqual(
        (await run("/usr/sbin/mkfile", ["-n", "40m", huge])).code,
        0,
      );
      assert.ok((await stat(huge)).size <= 32 * 1024 * 1024);
    } finally {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await rm(work, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
      await rm(join(toolRoot, "arduino-user", "blocked-sandbox-probe"), {
        force: true,
      });
    }
  },
);
