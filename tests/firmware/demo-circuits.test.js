import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { UnoSimulation } from "../../src/firmware/uno-simulation.js";
import { simulateCircuit } from "../../src/electrical-simulation.js";
import { examples } from "../../src/firmware/examples.js";
import { createDemoCircuit } from "../../src/firmware/demo-circuits.js";

async function demo(id) {
  const project = { components: [], wires: [] };
  const parts = await createDemoCircuit(id, {
    async add(type, x, z) {
      const item = { id: project.components.length + 1, type, x, z };
      project.components.push(item);
      return item;
    },
    connect(from, fromPin, to, toPin) {
      project.wires.push({
        ends: [
          { componentId: from.id, pin: fromPin },
          { componentId: to.id, pin: toPin },
        ],
      });
    },
  });
  const { hex, sourceHash } = JSON.parse(
    await readFile(
      new URL(`../../public/firmware/${id}.json`, import.meta.url),
      "utf8",
    ),
  );
  assert.equal(
    sourceHash,
    createHash("sha256").update(examples[id].source).digest("hex"),
  );
  const sim = new UnoSimulation(hex);
  const advance = (milliseconds) => {
    const current = { ...sim.snapshot(), unoId: parts.uno.id };
    sim.setInputs(simulateCircuit(project, current).inputs);
    const output = { ...sim.advance(milliseconds), unoId: parts.uno.id };
    return { ...simulateCircuit(project, output), serial: output.serial };
  };
  return { project, parts, advance };
}

test("the button example's assembled circuit controls the LED and reports actual input through UART", async () => {
  const { project, parts, advance } = await demo("button");
  let state = advance(80);
  assert.equal(state.leds[0].on, false);
  assert.match(state.serial.text, /Botao: solto/);
  parts.peripheral.pressed = true;
  state = advance(80);
  assert.equal(state.leds[0].on, true);
  assert.match(state.serial.text, /Botao: pressionado/);
  const signal = project.wires.find((wire) =>
    wire.ends.some((end) => end.pin === "D2"),
  );
  signal.ends[0] = { componentId: null, pin: null };
  state = advance(80);
  assert.equal(state.leds[0].on, false);
  assert.match(state.serial.text, /Botao: solto/);
});

test("the potentiometer example's wired divider changes compiled ADC, PWM and LED brightness", async () => {
  const { parts, advance } = await demo("pot");
  let state = advance(150);
  assert.ok(Math.abs(state.leds[0].brightness - 0.5) < 0.035);
  assert.match(state.serial.text, /ADC: 512 \| PWM: 128/);
  parts.peripheral.value = 0;
  state = advance(150);
  assert.equal(state.leds[0].on, false);
  assert.match(state.serial.text, /ADC: 0 \| PWM: 0/);
  parts.peripheral.value = 1;
  state = advance(150);
  assert.equal(state.leds[0].brightness, 1);
  assert.match(state.serial.text, /ADC: 1023 \| PWM: 255/);
});

test("the serial example's counter and reported LED state follow the compiled loop", async () => {
  const { advance } = await demo("serial");
  let state = advance(80);
  assert.equal(state.leds[0].on, true);
  assert.match(state.serial.text, /Contador: 0 \| LED: ligado/);
  state = advance(1000);
  assert.equal(state.leds[0].on, false);
  assert.match(state.serial.text, /Contador: 1 \| LED: desligado/);
});

test("the servo example's compiled library moves the wired servo to three angles and disconnecting stops actuation", async () => {
  const { project, advance } = await demo("servo");
  for (const [elapsed, angle] of [
    [100, 0],
    [1000, 90],
    [1000, 180],
  ]) {
    const state = advance(elapsed);
    assert.equal(state.servos[0].active, true);
    assert.ok(Math.abs(state.servos[0].angle - angle) < 1);
    assert.match(state.serial.text, new RegExp(`Angulo: ${angle}\\r\\n`));
  }
  const signal = project.wires.find((wire) =>
    wire.ends.some((end) => end.pin === "D6"),
  );
  signal.ends[0] = { componentId: null, pin: null };
  assert.equal(advance(50).servos[0].active, false);
});
