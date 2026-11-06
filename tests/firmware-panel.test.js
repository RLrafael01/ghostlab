import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { setupFirmwarePanel } from "../src/firmware/panel.js";
import { examples } from "../src/firmware/examples.js";

function panel(t, options = {}) {
  const dom = new JSDOM(
    '<textarea aria-label="Código Arduino"></textarea><div id="controls"></div><span id="status"></span>',
  );
  const { document } = dom.window;
  globalThis.window = dom.window;
  t.after(() => {
    dom.window.close();
    delete globalThis.window;
  });
  const editor = document.querySelector("textarea");
  const container = document.querySelector("#controls");
  const session = setupFirmwarePanel({
    editor,
    container,
    status: document.querySelector("#status"),
    ...options,
  });
  const select = container.querySelector('[aria-label="Exemplo de código"]');
  return {
    editor,
    select,
    container,
    session,
    input(source) {
      editor.value = source;
      editor.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    },
    choose(value) {
      select.value = value;
      select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    },
  };
}

test("editing Blink marks the code as Personalizado and restoring exact source recognizes the example again", (t) => {
  const ui = panel(t);
  assert.equal(ui.select.selectedOptions[0].textContent, "Blink · 1 segundo");
  const modified = ui.editor.value.replaceAll("delay(1000)", "delay(250)");
  ui.input(modified);
  assert.equal(ui.select.selectedOptions[0].textContent, "Personalizado");
  assert.equal(ui.editor.value, modified);
  ui.input(examples.blink.source);
  assert.equal(ui.select.selectedOptions[0].textContent, "Blink · 1 segundo");
});

test("restarting after replacing the example circuit targets the new Uno", async (t) => {
  const artifact = JSON.parse(
    await readFile(new URL("../public/firmware/blink.json", import.meta.url)),
  );
  t.mock.method(globalThis, "fetch", async (url) =>
    Response.json(
      String(url).endsWith("compiler-config.json")
        ? { endpoint: "https://compiler.example/api/compile" }
        : artifact,
    ),
  );
  const originalWorker = globalThis.Worker;
  const workers = [];
  globalThis.Worker = class {
    constructor() {
      workers.push(this);
    }
    postMessage() {}
    terminate() {}
  };
  t.after(() => {
    if (originalWorker === undefined) delete globalThis.Worker;
    else globalThis.Worker = originalWorker;
  });
  let target = 1;
  const outputs = [];
  const ui = panel(t, {
    getTarget: () => target,
    onOutput: (output) => outputs.push(output),
    onAssemble: async () => {
      ui.session.stop();
      target = 2;
    },
  });
  t.after(() => ui.session.stop());
  ui.container.querySelector('[data-action="run"]').click();
  for (let attempt = 0; attempt < 50 && !workers.length; attempt++)
    await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(ui.session.snapshot().phase, "running");
  // The worker boundary supplies a report; this test checks target attribution,
  // while real compiled GPIO behavior is covered by the firmware tests.
  workers.at(-1).onmessage({ data: { output: { pins: {} } } });
  assert.equal(outputs.at(-1).unoId, 1);
  const assemble = [...ui.container.querySelectorAll("button")].find(
    (button) => button.textContent === "Montar circuito do exemplo",
  );
  assemble.click();
  assemble.click();
  await Promise.resolve();
  await Promise.resolve();
  const restart = ui.container.querySelector('[data-action="restart"]');
  assert.equal(restart.disabled, false);
  restart.click();
  workers.at(-1).onmessage({ data: { output: { pins: {} } } });
  assert.equal(outputs.at(-1).unoId, 2);
});

test("choosing another preset restores its source while Personalizado never replaces the edited program", (t) => {
  const ui = panel(t);
  ui.input("void setup() {}\nvoid loop() {}\n");
  ui.choose("fade");
  assert.equal(ui.select.selectedOptions[0].textContent, "Fade · brilho suave");
  assert.equal(ui.editor.value, examples.fade.source);
  const modified = examples.fade.source + "// Minha alteração\n";
  ui.input(modified);
  assert.equal(ui.select.selectedOptions[0].textContent, "Personalizado");
  assert.equal(ui.select.selectedOptions[0].disabled, true);
  ui.choose("custom");
  assert.equal(ui.editor.value, modified);
  assert.equal(ui.select.selectedOptions[0].textContent, "Personalizado");
  // Pasting an exact different preset recognizes the source actually displayed.
  ui.input(examples.on.source);
  assert.equal(ui.select.selectedOptions[0].textContent, "LED ligado");
});

test("escolher cancela e cancelar a montagem preserva o sketch em edição", async (t) => {
  const ui = panel(t, { onAssemble: async () => false });
  const original = "// alterações do aluno";
  ui.input(original);
  ui.choose("gate");
  assert.equal(ui.editor.value, original);
  const assemble = [...ui.container.querySelectorAll("button")].find(
    (button) => button.textContent === "Montar circuito do exemplo",
  );
  assemble.click();
  assemble.click();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(ui.editor.value, original);
  assert.equal(ui.session.snapshot().source, original);
});
