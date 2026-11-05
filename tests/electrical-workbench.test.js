import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { JSDOM } from "jsdom";
import { createVisualWires } from "../src/visual-wires.js";
import { createElectricalView } from "../src/electrical-view.js";

function part(id, type, pins) {
  const group = new T.Group();
  pins.forEach((pin, index) => {
    const mesh = new T.Mesh(
      new T.SphereGeometry(0.05),
      new T.MeshStandardMaterial(),
    );
    mesh.position.x = index * 0.2;
    mesh.userData.pinName = pin;
    group.add(mesh);
  });
  return { id, type, group };
}

test("jumpers reais controlam luz e painel; mover peças preserva e Escape restaura o circuito", () => {
  const document = new JSDOM('<section id="status"></section>').window.document;
  const status = document.querySelector("#status");
  const scene = new T.Scene();
  const wires = createVisualWires(scene);
  const uno = part(1, "uno", ["5V", "GND"]),
    resistor = part(2, "resistor", ["1", "2"]),
    led = part(3, "led", ["Ânodo +", "Cátodo −"]);
  const lens = new T.Mesh(
    new T.SphereGeometry(0.2),
    new T.MeshPhysicalMaterial(),
  );
  lens.userData.ledLens = true;
  led.group.add(lens);
  const items = [uno, resistor, led];
  scene.add(...items.map((item) => item.group));
  wires.connect(uno, "5V", resistor, "1", "red");
  wires.connect(resistor, "2", led, "Ânodo +", "yellow");
  const ground = wires.connect(led, "Cátodo −", uno, "GND", "black");
  const view = createElectricalView({ items, wires, status });
  view.update();
  assert.match(status.textContent, /LED #3 · aceso/);
  assert.ok(lens.material.emissiveIntensity > 0);
  const references = wires.connections();
  led.group.position.set(8, 2, -5);
  uno.group.rotation.y = Math.PI / 2;
  view.update();
  assert.deepEqual(wires.connections(), references);
  assert.match(status.textContent, /LED #3 · aceso/);
  wires.begin(ground, 1);
  view.update();
  assert.match(status.textContent, /LED #3 · apagado/);
  assert.equal(lens.material.emissiveIntensity, 0);
  wires.cancel();
  view.update();
  assert.match(status.textContent, /LED #3 · aceso/);
  wires.begin(ground, 1);
  wires.finish();
  view.update();
  assert.match(status.textContent, /circuito aberto/i);
  wires.begin(ground, 1);
  wires.finish({ item: uno, pin: "GND" });
  view.update();
  assert.match(status.textContent, /LED #3 · aceso/);
  wires.removeFor(resistor);
  items.splice(items.indexOf(resistor), 1);
  view.update();
  assert.match(status.textContent, /LED #3 · apagado/);
});
