import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createSerialMonitor } from "../src/firmware/serial-monitor.js";

test("serial monitor opens, preserves text while collapsed and clears only its output", () => {
  const dom = new JSDOM(
    "<section></section><textarea>sketch preservado</textarea>",
  );
  const container = dom.window.document.querySelector("section");
  let cleared = false;
  const monitor = createSerialMonitor(container, () => {
    cleared = true;
  });
  monitor.update({
    text: "Contador: 1\r\nBotão: solto\r\n",
    baud: 9600,
    dropped: 0,
    session: 1,
  });
  const toggle = container.querySelector("summary");
  toggle.click();
  assert.equal(container.querySelector("details").open, true);
  assert.match(container.querySelector("pre").textContent, /Contador: 1/);
  toggle.click();
  monitor.update({
    text: "Contador: 2\r\n",
    baud: 9600,
    dropped: 30,
    droppedBytes: 7,
    session: 1,
  });
  toggle.click();
  assert.match(container.textContent, /30 caracteres descartados/);
  assert.match(container.textContent, /7 bytes descartados na UART/);
  assert.match(container.querySelector("pre").textContent, /Contador: 2/);
  container.querySelector("button").click();
  assert.equal(cleared, true);
  monitor.update({ text: "", baud: 9600, dropped: 0, session: 1 });
  assert.equal(container.querySelector("pre").textContent, "");
  assert.equal(
    dom.window.document.querySelector("textarea").value,
    "sketch preservado",
  );
  dom.window.close();
});
