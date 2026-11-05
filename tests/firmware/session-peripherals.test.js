import test from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { compileSketch } from "../../server/compiler.js";
import { createFirmwareSession } from "../../src/firmware/session.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(condition) {
  for (let n = 0; n < 200; n++) {
    if (condition()) return;
    await wait(20);
  }
  assert.ok(condition(), "firmware output did not arrive");
}
function createRunner(hex, output, error, inputs) {
  const worker = new Worker(
    new URL("../helpers/firmware-worker.js", import.meta.url),
  );
  worker.on("message", output);
  worker.on("error", error);
  worker.postMessage({ hex, inputs });
  return {
    terminate: () => worker.terminate(),
    setInputs: (next) => worker.postMessage({ type: "inputs", inputs: next }),
  };
}

test("live inputs and clearing UART preserve the running firmware; restart creates a fresh serial session", async () => {
  const session = createFirmwareSession({
    compile: compileSketch,
    createRunner,
  });
  session.edit(`void setup() { pinMode(2, INPUT_PULLUP); Serial.begin(9600); Serial.println("inicio"); }
void loop() { Serial.println(digitalRead(2)); delay(20); }`);
  try {
    session.setInputs({ digital: { D2: null } });
    await session.execute();
    await until(() => session.snapshot().serial.text.includes("1\r\n"));
    const first = session.snapshot().serial.session;
    const elapsed = session.snapshot().output.milliseconds;
    session.clearSerial();
    assert.equal(session.snapshot().serial.text, "");
    session.setInputs({ digital: { D2: 0 } });
    await until(() => session.snapshot().serial.text.includes("0\r\n"));
    assert.equal(session.snapshot().serial.session, first);
    assert.ok(session.snapshot().output.milliseconds >= elapsed);
    session.stop();
    const stopped = session.snapshot().serial.text;
    await wait(50);
    assert.equal(session.snapshot().serial.text, stopped);
    session.restart();
    assert.equal(session.snapshot().serial.session, first + 1);
    assert.equal(session.snapshot().serial.text, "");
    await until(() =>
      session.snapshot().serial.text.includes("inicio\r\n0\r\n"),
    );
  } finally {
    session.stop();
  }
});

test("continuous firmware UART output discards the oldest history at the documented limit", async () => {
  const session = createFirmwareSession({
    compile: compileSketch,
    createRunner,
  });
  session.edit(`void setup() { Serial.begin(115200); }
void loop() { Serial.println("0123456789abcdefghijklmnopqrstuvwxyz"); }`);
  try {
    await session.execute();
    await until(() => session.snapshot().serial.dropped > 0);
    assert.equal(session.snapshot().serial.text.length, 8192);
    assert.ok(
      session.snapshot().serial.text.endsWith("\n") ||
        session.snapshot().serial.text.includes("abcdefghijklmnopqrstuvwxyz"),
    );
    assert.equal(session.snapshot().phase, "running");
    session.clearSerial();
    assert.equal(session.snapshot().serial.dropped, 0);
    assert.equal(session.snapshot().serial.droppedBytes, 0);
  } finally {
    session.stop();
  }
});
