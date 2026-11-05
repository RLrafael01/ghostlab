import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { UnoSimulation } from "../src/firmware/uno-simulation.js";
import { simulateCircuit } from "../src/electrical-simulation.js";
const end = (componentId, pin) => ({ componentId, pin });
export function circuit(pin = "D9") {
  return {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "resistor" },
      { id: 3, type: "led" },
      { id: 4, type: "board", columns: 63 },
    ],
    wires: [
      { ends: [end(1, pin), end(4, "a12")] },
      { ends: [end(4, "e12"), end(2, "1")] },
      { ends: [end(2, "2"), end(3, "Ânodo +")] },
      { ends: [end(3, "Cátodo −"), end(1, "GND")] },
    ],
  };
}
const firmware = async (name) =>
  new UnoSimulation(
    JSON.parse(
      await readFile(
        new URL(`../public/firmware/${name}.json`, import.meta.url),
        "utf8",
      ),
    ).hex,
  );
test("firmware Blink controla LED através dos fios e contatos; 5 V continua fixo", async () => {
  const sim = await firmware("blink"),
    project = circuit();
  let signals = { unoId: 1, ...sim.advance(30) };
  assert.equal(simulateCircuit(project, signals).leds[0].on, true);
  assert.equal(simulateCircuit(project, signals).leds[0].brightness, 1);
  signals = { unoId: 1, ...sim.advance(1000) };
  assert.equal(simulateCircuit(project, signals).leds[0].on, false);
  assert.equal(simulateCircuit(circuit("5V"), signals).leds[0].brightness, 1);
  signals = { unoId: 1, ...sim.advance(1000) };
  project.wires[3].ends[1] = end(null, null);
  assert.equal(simulateCircuit(project, signals).leds[0].brightness, 0);
  project.wires[3].ends[1] = end(1, "GND");
  assert.equal(simulateCircuit(project, signals).leds[0].brightness, 1);
  assert.equal(simulateCircuit(circuit("D8"), signals).leds[0].brightness, 0);
  assert.equal(
    simulateCircuit(project, { unoId: 1, pins: {} }).leds[0].brightness,
    0,
  );
});

test("Fade altera brilho real; circuito aberto, LED invertido e sem resistor não recebem PWM", async () => {
  const sim = await firmware("fade"),
    project = circuit();
  const readings = [];
  for (let i = 0; i < 10; i++) {
    const signals = { unoId: 1, ...sim.advance(120) };
    readings.push(simulateCircuit(project, signals).leds[0].brightness);
  }
  assert(readings.at(-1) > readings[0] + 0.4);
  const signals = { unoId: 1, ...sim.advance(100) };
  project.wires[3].ends[1] = end(null, null);
  assert.equal(simulateCircuit(project, signals).leds[0].brightness, 0);
  project.wires[3].ends[1] = end(1, "GND");
  project.wires[2].ends[1] = end(3, "Cátodo −");
  project.wires[3].ends[0] = end(3, "Ânodo +");
  assert.equal(simulateCircuit(project, signals).leds[0].reason, "reversed");
  project.wires[2].ends[1] = end(3, "Ânodo +");
  project.wires[3].ends[0] = end(3, "Cátodo −");
  project.wires[0].ends[1] = end(3, "Ânodo +");
  assert.equal(simulateCircuit(project, signals).leds[0].reason, "unlimited");
});

test("amostrar em quadros de 1 ou 50 ms não muda o brilho PWM nem a relação com 5 V", async () => {
  const small = await firmware("fade"),
    large = await firmware("fade");
  for (let i = 0; i < 500; i++) small.advance(1);
  for (let i = 0; i < 10; i++) large.advance(50);
  assert(
    Math.abs(small.snapshot().pins.D9.duty - large.snapshot().pins.D9.duty) <
      0.03,
  );
  assert.equal(
    simulateCircuit(circuit("5V"), { unoId: 1, ...small.snapshot() }).leds[0]
      .brightness,
    1,
  );
});
