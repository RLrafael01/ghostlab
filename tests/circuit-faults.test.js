import test from "node:test";
import assert from "node:assert/strict";
import { createCircuitSimulation } from "../src/electrical-simulation.js";

const wire = (id, a, pinA, b, pinB) => ({
  id,
  ends: [
    { componentId: a, pin: pinA },
    { componentId: b, pin: pinB },
  ],
});
const circuit = () => ({
  components: [
    { id: 1, type: "uno" },
    { id: 2, type: "led" },
    { id: 3, type: "resistor" },
  ],
  wires: [
    wire(1, 1, "5V", 3, "1"),
    wire(2, 3, "2", 2, "Ânodo +"),
    wire(3, 2, "Cátodo −", 1, "GND"),
  ],
});

test("curto direto identifica o fio e exige reinício após correção", () => {
  const simulation = createCircuitSimulation();
  const project = circuit();
  assert.equal(simulation.evaluate(project).leds[0].on, true);
  project.wires.push(wire(4, 1, "5V", 1, "GND"));
  assert.deepEqual(simulation.evaluate(project).faults[0].wireIds, [4]);
  simulation.restart();
  assert.equal(simulation.evaluate(project).leds[0].on, false);
  project.wires.pop();
  assert.equal(simulation.evaluate(project).leds[0].on, false);
  simulation.restart();
  assert.equal(simulation.evaluate(project).leds[0].on, true);
});

