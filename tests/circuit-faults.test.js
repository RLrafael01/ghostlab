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

test("perda de GND e perda de sinal têm motivos distintos e reconexão recupera", () => {
  const simulation = createCircuitSimulation();
  const project = circuit();
  project.wires[0].ends[0].pin = "D9";
  const firmware = {
    unoId: 1,
    pins: { D9: { output: true, level: 1, duty: 1 } },
  };
  const led = () => simulation.evaluate(project, firmware).leds[0];
  assert.equal(led().on, true);
  const ground = project.wires.pop();
  assert.equal(led().reason, "unpowered");
  project.wires.push(ground);
  assert.equal(led().on, true);
  const [signal] = project.wires.splice(0, 1);
  assert.equal(led().reason, "signal-open");
  project.wires.unshift(signal);
  assert.equal(led().on, true);
  project.wires.push(wire(4, 1, "5V", 3, "1"), wire(5, 3, "2", 1, "GND"));
  assert.deepEqual(simulation.evaluate(project, firmware).faults, []);
});

test("dano virtual persiste ao reiniciar e só reaparece na restauração se a ligação continuar incorreta", () => {
  const simulation = createCircuitSimulation();
  const project = circuit();
  const bypass = wire(4, 1, "5V", 2, "Ânodo +");
  project.wires.push(bypass);
  assert.equal(simulation.evaluate(project).leds[0].reason, "damaged");
  simulation.restore();
  assert.equal(simulation.evaluate(project).leds[0].reason, "damaged");
  project.wires.pop();
  simulation.restart();
  assert.equal(simulation.evaluate(project).leds[0].reason, "damaged");
  simulation.restore();
  assert.equal(simulation.evaluate(project).leds[0].on, true);
  project.wires.push(bypass);
  simulation.evaluate(project);
  project.wires.pop();
  project.components[1].id = 7;
  for (const wire of project.wires)
    for (const end of wire.ends) if (end.componentId === 2) end.componentId = 7;
  assert.equal(simulation.evaluate(project).leds[0].on, true);
});

test("GPIO sem resistor só causa dano quando fornece energia", () => {
  const simulation = createCircuitSimulation();
  const project = circuit();
  project.wires = [wire(4, 1, "D9", 2, "Ânodo +"), project.wires[2]];
  const firmware = { unoId: 1, pins: { D9: { output: true, duty: 0 } } };
  assert.equal(
    simulation.evaluate(project, firmware).leds[0].reason,
    "unlimited",
  );
  firmware.pins.D9.duty = 0.25;
  assert.equal(
    simulation.evaluate(project, firmware).leds[0].reason,
    "damaged",
  );
});
