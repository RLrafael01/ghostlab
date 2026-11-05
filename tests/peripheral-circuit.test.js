import test from "node:test";
import assert from "node:assert/strict";
import { simulateCircuit } from "../src/electrical-simulation.js";

const end = (componentId, pin) => ({ componentId, pin });
const wire = (componentId, pin, targetId, targetPin) => ({
  ends: [end(componentId, pin), end(targetId, targetPin)],
});

test("servo follows the pulse on its wired signal and loses actuation when power or signal is removed", () => {
  const project = {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "servo" },
    ],
    wires: [
      wire(1, "5V", 2, "5V"),
      wire(1, "GND", 2, "GND"),
      wire(1, "D9", 2, "Sinal"),
    ],
  };
  const pulse = {
    output: true,
    level: 0,
    duty: 0.05,
    pulseWidthUs: 544,
    pulsePeriodUs: 20_000,
    pulseAgeMs: 2,
  };
  const firmware = { unoId: 1, pins: { D9: pulse } };
  for (const [width, angle] of [
    [544, 0],
    [1472, 90],
    [2400, 180],
    [542, 0],
  ]) {
    pulse.pulseWidthUs = width;
    const servo = simulateCircuit(project, firmware).servos[0];
    assert.equal(servo.active, true);
    assert.equal(servo.angle, angle);
  }
  for (const index of [0, 1, 2]) {
    const target = project.wires[index].ends[1];
    project.wires[index].ends[1] = end(null, null);
    const servo = simulateCircuit(project, firmware).servos[0];
    assert.equal(servo.active, false);
    assert.equal(servo.angle, null, "inactive servo has no new target angle");
    project.wires[index].ends[1] = target;
    assert.equal(simulateCircuit(project, firmware).servos[0].active, true);
  }
  project.wires[2].ends[0].pin = "D10";
  assert.equal(
    simulateCircuit(project, firmware).servos[0].active,
    false,
    "a different, undriven pin cannot repeat stale servo pulses",
  );
});

test("servo rejects stale pulses, ordinary PWM, conflicting signals and power from another Uno", () => {
  const project = {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "servo" },
      { id: 3, type: "uno" },
    ],
    wires: [
      wire(1, "5V", 2, "5V"),
      wire(1, "GND", 2, "GND"),
      wire(1, "D9", 2, "Sinal"),
    ],
  };
  const valid = {
    output: true,
    level: 0,
    duty: 0.07,
    pulseWidthUs: 1472,
    pulsePeriodUs: 20_000,
    pulseAgeMs: 2,
  };
  const firmware = { unoId: 1, pins: { D9: valid } };
  for (const changes of [
    { pulseWidthUs: null },
    { pulseWidthUs: 300 },
    { pulseWidthUs: 2500 },
    { pulsePeriodUs: 2040 },
    { pulsePeriodUs: null },
    { pulseAgeMs: 61 },
    { pulseAgeMs: null },
    { output: false },
  ]) {
    firmware.pins.D9 = { ...valid, ...changes };
    assert.equal(
      simulateCircuit(project, firmware).servos[0].active,
      false,
      JSON.stringify(changes),
    );
  }
  firmware.pins.D9 = valid;
  project.wires.push(wire(1, "5V", 2, "Sinal"));
  assert.equal(
    simulateCircuit(project, firmware).servos[0].reason,
    "unsupported",
  );
  project.wires.pop();
  project.wires[0].ends[0].componentId = 3;
  assert.equal(
    simulateCircuit(project, firmware).servos[0].reason,
    "unsupported",
  );
  project.wires[0].ends[0].componentId = 1;
  firmware.unoId = 99;
  assert.deepEqual(simulateCircuit(project, firmware).inputs, {
    digital: {},
    analog: {},
  });
  assert.equal(
    simulateCircuit(project, firmware).servos[0].active,
    false,
    "a removed active Uno does not silently select another board",
  );
});

test("powered potentiometer delivers its divider voltage only to the connected analog input", () => {
  const project = {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "pot", value: 0 },
    ],
    wires: [
      wire(1, "5V", 2, "VCC"),
      wire(1, "GND", 2, "GND"),
      wire(2, "Sinal", 1, "A0"),
    ],
  };
  const firmware = { unoId: 1, pins: { A0: { output: false } } };
  assert.equal(simulateCircuit(project, firmware).inputs.analog.A0, 0);
  project.components[1].value = 0.5;
  let state = simulateCircuit(project, firmware);
  assert.equal(state.inputs.analog.A0, 2.5);
  assert.equal(state.pots[0].voltage, 2.5);
  assert.equal(state.pots[0].powered, true);
  project.components[1].value = 1;
  assert.equal(simulateCircuit(project, firmware).inputs.analog.A0, 5);
  project.wires[2].ends[1].pin = "A1";
  state = simulateCircuit(project, firmware);
  assert.equal(state.inputs.analog.A0, null);
  assert.equal(state.inputs.analog.A1, 5);
  project.wires[2].ends[1] = end(null, null);
  assert.equal(simulateCircuit(project, firmware).inputs.analog.A1, null);
  project.wires[2].ends[1] = end(1, "A0");
  for (const supply of [0, 1]) {
    const target = project.wires[supply].ends[1];
    project.wires[supply].ends[1] = end(null, null);
    state = simulateCircuit(project, firmware);
    assert.equal(
      state.inputs.analog.A0,
      null,
      "unpowered wiper does not invent an analog reading",
    );
    assert.equal(state.pots[0].powered, false);
    project.wires[supply].ends[1] = target;
  }
  assert.equal(simulateCircuit(project, firmware).inputs.analog.A0, 5);
});

test("GPIO loopback uses the driven level; conflicting sources and incompatible pot wiring are reported instead of inventing an input", () => {
  const project = {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "button", pressed: false },
    ],
    wires: [wire(1, "D2", 2, "1"), wire(1, "D3", 2, "3")],
  };
  const firmware = {
    unoId: 1,
    pins: {
      D2: { output: false, pullup: true },
      D3: { output: true, level: 1, duty: 1 },
    },
  };
  assert.equal(
    simulateCircuit(project, firmware).inputs.digital.D2,
    1,
    "pins 1 and 3 are permanently connected even when released",
  );
  firmware.pins.D3.level = 0;
  firmware.pins.D3.duty = 0;
  assert.equal(simulateCircuit(project, firmware).inputs.digital.D2, 0);
  project.wires.push(wire(1, "5V", 2, "3"));
  let state = simulateCircuit(project, firmware);
  assert.equal(state.inputs.digital.D2, null);
  assert.ok(state.unsupportedInputs.includes("D2"));
  assert.equal(state.buttons[0].reason, "unsupported");
  project.components.push({ id: 3, type: "pot", value: 0.5 });
  project.wires = [
    wire(1, "5V", 3, "VCC"),
    wire(1, "GND", 3, "GND"),
    wire(3, "Sinal", 1, "A0"),
    wire(1, "5V", 1, "A0"),
  ];
  state = simulateCircuit(project, firmware);
  assert.equal(state.inputs.analog.A0, null);
  assert.ok(state.unsupportedInputs.includes("A0"));
  assert.equal(state.pots[0].reason, "unsupported");
  assert.equal(state.pots[0].voltage, null);
});

test("button closes its two contact pairs through breadboard groups; releasing or disconnecting releases the actual Uno input", () => {
  const project = {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "button", pressed: false },
      { id: 3, type: "board", columns: 63 },
    ],
    wires: [
      wire(1, "D2", 3, "a12"),
      wire(3, "e12", 2, "1"),
      wire(2, "2", 1, "GND"),
    ],
  };
  const firmware = { unoId: 1, pins: { D2: { output: false, pullup: true } } };
  let state = simulateCircuit(project, firmware);
  assert.equal(
    state.inputs.digital.D2,
    null,
    "floating input is released for the firmware pull-up",
  );
  assert.equal(state.buttons[0].pressed, false);
  project.components[1].pressed = true;
  state = simulateCircuit(project, firmware);
  assert.equal(
    state.inputs.digital.D2,
    0,
    "pressing connects the wired GPIO to ground",
  );
  assert.equal(state.buttons[0].pressed, true);
  project.components[1].pressed = false;
  assert.equal(simulateCircuit(project, firmware).inputs.digital.D2, null);
  project.wires[1].ends[1].pin = "3";
  project.wires[2].ends[0].pin = "4";
  project.components[1].pressed = true;
  assert.equal(
    simulateCircuit(project, firmware).inputs.digital.D2,
    0,
    "the other physical pins belong to the same pairs",
  );
  project.wires[1].ends[0].pin = "f12";
  assert.equal(
    simulateCircuit(project, firmware).inputs.digital.D2,
    null,
    "the other half of a breadboard column is disconnected",
  );
  project.wires[1].ends[0].pin = "a12";
  project.wires[0].ends[0].pin = "D3";
  state = simulateCircuit(project, firmware);
  assert.equal(state.inputs.digital.D2, null);
  assert.equal(
    state.inputs.digital.D3,
    0,
    "rewiring changes the driven input, not a hard-coded D2",
  );
});
