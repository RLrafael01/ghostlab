import test from "node:test";
import assert from "node:assert/strict";
import { compileSketch } from "../../server/compiler.js";
import { UnoSimulation } from "../../src/firmware/uno-simulation.js";

test("C++ realmente compilado muda a temporização de Blink no Uno virtual", async () => {
  for (const interval of [1000, 250]) {
    const { hex, sourceHash } = await compileSketch(
      `void setup(){pinMode(9,OUTPUT);} void loop(){digitalWrite(9,HIGH);delay(${interval});digitalWrite(9,LOW);delay(${interval});}`,
    );
    assert.match(sourceHash, /^[a-f0-9]{64}$/);
    const sim = new UnoSimulation(hex);
    sim.advance(20);
    assert.equal(sim.snapshot().pins.D9.level, 1);
    sim.advance(interval);
    assert.equal(sim.snapshot().pins.D9.level, 0);
    sim.advance(interval);
    assert.equal(sim.snapshot().pins.D9.level, 1);
  }
});

test("C++ inválido, timeout, cancelamento e limite de entrada produzem falhas recuperáveis", async () => {
  await assert.rejects(
    compileSketch("void setup(){ erro intencional } void loop(){}"),
    (e) =>
      e.code === "compile-error" &&
      e.diagnostics.some((d) => d.includes("error:")),
  );
  await assert.rejects(
    compileSketch("x".repeat(32769)),
    (e) => e.code === "invalid-source",
  );
  await assert.rejects(
    compileSketch("void setup(){} void loop(){}", { timeoutMs: 1 }),
    (e) => e.code === "timeout",
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    compileSketch("void setup(){} void loop(){}", {
      signal: controller.signal,
    }),
    (e) => e.code === "cancelled",
  );
  const first = compileSketch("void setup(){} void loop(){}");
  await assert.rejects(
    compileSketch("void setup(){} void loop(){}"),
    (e) => e.code === "busy",
  );
  const { hex } = await first;
  assert(new UnoSimulation(hex).advance(10).milliseconds >= 10);
});

test("analogWrite gera níveis PWM nos seis pinos do Uno e saída digital no pino sem PWM", async () => {
  const { hex } =
    await compileSketch(`const int pins[]={3,5,6,9,10,11,7}; const int values[]={0,64,128,192,255};
 void setup(){for(int i=0;i<7;i++)pinMode(pins[i],OUTPUT);}
 void loop(){for(int v=0;v<5;v++){for(int i=0;i<7;i++)analogWrite(pins[i],values[v]);delay(100);}}`);
  const sim = new UnoSimulation(hex);
  sim.advance(60);
  for (const value of [0, 64, 128, 192, 255]) {
    if (value) sim.advance(100);
    for (const pin of [3, 5, 6, 9, 10, 11])
      assert(
        Math.abs(sim.snapshot().pins[`D${pin}`].duty - value / 255) < 0.035,
        `D${pin}, nível ${value}: ${sim.snapshot().pins[`D${pin}`].duty}`,
      );
    assert.equal(sim.snapshot().pins.D7.duty, value < 128 ? 0 : 1);
  }
});

test("HC-SR04 entrega duas distâncias por pulseIn e permite timeout sem eco", async () => {
  const { examples } = await import("../../src/firmware/examples.js");
  const { hex } = await compileSketch(examples.distance.source);
  for (const [distanceCm, expected, led] of [
    [20, 20, 1],
    [75, 75, 0],
    [450, null, 0],
  ]) {
    const simulation = new UnoSimulation(hex);
    simulation.setInputs({
      sensors: [{ id: 1, triggerPin: "D7", echoPin: "D6", distanceCm }],
    });
    const result = simulation.advance(65);
    if (expected === null) assert.match(result.serial.text, /Sem eco/);
    else {
      const reading = result.serial.text.match(/([0-9.]+) cm/);
      assert.ok(reading, result.serial.text);
      assert.ok(
        Math.abs(Number(reading[1]) - expected) < 0.5,
        result.serial.text,
      );
    }
    assert.equal(result.pins.D9.level, led);
  }
});

test("cancela compilada responde a distância, limiar editado, botão e fio de sinal", async () => {
  const { examples } = await import("../../src/firmware/examples.js");
  const { createDemoCircuit } =
    await import("../../src/firmware/demo-circuits.js");
  const { simulateCircuit } =
    await import("../../src/electrical-simulation.js");
  const project = { components: [], wires: [] };
  const parts = await createDemoCircuit("gate", {
    async add(type) {
      const part = { id: project.components.length + 1, type };
      project.components.push(part);
      return part;
    },
    connect(a, pinA, b, pinB) {
      project.wires.push({
        ends: [
          { componentId: a.id, pin: pinA },
          { componentId: b.id, pin: pinB },
        ],
      });
    },
  });
  const { hex } = await compileSketch(examples.gate.source);
  const edited = await compileSketch(
    examples.gate.source
      .replace("LIMIAR_CM = 30", "LIMIAR_CM = 60")
      .replace("ABERTA = 90", "ABERTA = 120"),
  );
  let sim = new UnoSimulation(hex);
  function step(distance) {
    parts.peripheral.distanceCm = distance;
    sim.setInputs(
      simulateCircuit(project, { ...sim.snapshot(), unoId: parts.uno.id })
        .inputs,
    );
    const output = sim.advance(210);
    return {
      ...simulateCircuit(project, { ...output, unoId: parts.uno.id }),
      serial: output.serial.text,
    };
  }
  function expectAngle(state, angle) {
    assert.equal(state.servos[0].active, true);
    assert.ok(
      Math.abs(state.servos[0].angle - angle) < 1,
      JSON.stringify(state.servos),
    );
    assert.match(state.serial, new RegExp("Angulo: " + angle));
    assert.equal(state.leds[0].on, angle > 0);
  }
  expectAngle(step(50), 0);
  expectAngle(step(20), 90);
  project.components.find(({ type }) => type === "button").pressed = true;
  const forced = step(75);
  expectAngle(forced, 90);
  assert.match(forced.serial, /Botao: pressionado/);
  project.components.find(({ type }) => type === "button").pressed = false;
  sim = new UnoSimulation(edited.hex);
  expectAngle(step(50), 120);
  const signal = project.wires.find(({ ends }) =>
    ends.some(({ pin }) => pin === "D5"),
  );
  signal.ends[0] = { componentId: null, pin: null };
  assert.equal(step(50).servos[0].active, false);
});
