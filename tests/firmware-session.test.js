import test from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { readFile } from "node:fs/promises";
import { createFirmwareSession } from "../src/firmware/session.js";
const artifact = JSON.parse(
  await readFile(
    new URL("../public/firmware/on.json", import.meta.url),
    "utf8",
  ),
);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function createRunner(hex, onOutput, onError) {
  const worker = new Worker(
    new URL("./helpers/firmware-worker.js", import.meta.url),
  );
  worker.on("message", onOutput);
  worker.on("error", onError);
  worker.postMessage(hex);
  return { terminate: () => worker.terminate() };
}

test("firmware roda fora da interface; parar limpa sinais e reiniciar volta ao início", async () => {
  const session = createFirmwareSession({
    compile: async () => artifact,
    createRunner,
  });
  session.edit("programa válido");
  try {
    await session.execute();
    for (
      let i = 0;
      i < 50 && (session.snapshot().output?.milliseconds ?? 0) < 20;
      i++
    )
      await wait(20);
    assert.equal(session.snapshot().phase, "running");
    assert.equal(session.snapshot().output.pins.D9.level, 1);
    session.stop();
    assert.equal(session.snapshot().output, null);
    assert.equal(session.snapshot().phase, "stopped");
    await wait(50);
    assert.equal(session.snapshot().output, null);
    session.restart();
    assert.equal(session.snapshot().phase, "running");
    assert.equal(session.snapshot().output, null);
    for (
      let i = 0;
      i < 50 && (session.snapshot().output?.milliseconds ?? 0) < 20;
      i++
    )
      await wait(20);
    assert.equal(session.snapshot().output.pins.D9.level, 1);
  } finally {
    session.stop();
  }
});

test("editar, parar e respostas fora de ordem não iniciam firmware obsoleto", async () => {
  const pending = [];
  const session = createFirmwareSession({
    compile: () =>
      new Promise((resolve, reject) => pending.push({ resolve, reject })),
    createRunner,
  });
  session.edit("v1");
  const first = session.execute();
  session.edit("v2");
  const second = session.execute();
  pending[0].resolve(artifact);
  await first;
  assert.equal(session.snapshot().phase, "compiling");
  assert.equal(session.snapshot().output, null);
  pending[1].reject(new Error("erro C++"));
  await second;
  assert.equal(session.snapshot().source, "v2");
  assert.equal(session.snapshot().phase, "error");
  assert.equal(session.snapshot().output, null);
  const third = session.execute();
  session.stop();
  pending[2].resolve(artifact);
  await third;
  assert.equal(session.snapshot().phase, "stopped");
  assert.equal(session.snapshot().output, null);
});

test("bloqueio do Worker informa erro recuperável ao executar e reiniciar", async () => {
  const seen = [];
  const session = createFirmwareSession({
    compile: async () => artifact,
    createRunner() {
      throw new Error("Worker indisponível");
    },
    onChange: (state) => seen.push(state.phase),
  });
  session.edit("programa");
  await session.execute();
  assert.equal(session.snapshot().phase, "error");
  assert.equal(session.snapshot().output, null);
  assert.equal(seen.at(-1), "error");
  assert.doesNotThrow(() => session.restart());
  assert.equal(session.snapshot().phase, "error");
  assert.match(session.snapshot().message, /Worker indisponível/);
});
