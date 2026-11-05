import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { setupFirmwarePanel } from "../src/firmware/panel.js";
import { examples } from "../src/firmware/examples.js";

function panel(t) {
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
  setupFirmwarePanel({
    editor,
    container,
    status: document.querySelector("#status"),
  });
  const select = container.querySelector('[aria-label="Exemplo de código"]');
  return {
    editor,
    select,
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
