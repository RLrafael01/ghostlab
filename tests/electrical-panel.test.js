import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { setupElectricalPanel } from "../src/electrical-panel.js";

test("electrical card collapses from its status and reopens without losing updates; help remains independent", () => {
  const document = new JSDOM(`<section class="electrical-panel">
    <button class="electrical-toggle" aria-expanded="true" aria-controls="electrical-body">Estado elétrico</button>
    <div id="electrical-body"><div id="electrical-status">LED apagado</div>
    <details><summary>Como testar e limites</summary><p>Use resistor.</p></details></div>
  </section>`).window.document;
  const panel = document.querySelector("section");
  const toggle = panel.querySelector("button");
  const content = document.querySelector("#electrical-body");
  const status = document.querySelector("#electrical-status");
  setupElectricalPanel(panel);
  status.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(content.hidden, true);
  assert.equal(toggle.getAttribute("aria-label"), "Mostrar estado elétrico");
  status.textContent = "LED aceso · brilho 50%";
  toggle.click();
  assert.equal(content.hidden, false);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(status.textContent, "LED aceso · brilho 50%");
  panel.querySelector("summary").click();
  assert.equal(panel.querySelector("details").open, true);
  assert.equal(
    content.hidden,
    false,
    "opening help must not collapse its parent card",
  );
});
