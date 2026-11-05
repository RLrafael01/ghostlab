import test from "node:test";
import assert from "node:assert/strict";
import { compileSketch } from "../../server/compiler.js";
import { UnoSimulation } from "../../src/firmware/uno-simulation.js";

test("digitalRead follows external input, releases to INPUT_PULLUP and resets with a new CPU", async () => {
  const { hex } = await compileSketch(`
    void setup() { pinMode(2, INPUT_PULLUP); pinMode(3, INPUT); pinMode(9, OUTPUT); pinMode(8, OUTPUT); }
    void loop() { digitalWrite(9, !digitalRead(2)); digitalWrite(8, digitalRead(3)); }
  `);
  const sim = new UnoSimulation(hex);
  sim.setInputs({ digital: { D2: null, D3: null } });
  let output = sim.advance(5);
  assert.equal(output.pins.D2.pullup, true);
  assert.equal(output.pins.D2.input, 1);
  assert.equal(output.pins.D9.level, 0);
  assert.equal(output.pins.D8.level, 0, "floating INPUT is LOW in this model");
  sim.setInputs({ digital: { D2: 0, D3: 1 } });
  output = sim.advance(5);
  assert.equal(output.pins.D2.input, 0);
  assert.equal(output.pins.D9.level, 1);
  assert.equal(output.pins.D8.level, 1);
  sim.setInputs({ digital: {} });
  output = sim.advance(5);
  assert.equal(output.pins.D9.level, 0, "disconnect restores pullup");
  assert.equal(output.pins.D8.level, 0, "disconnected INPUT returns to LOW");
  assert.equal(new UnoSimulation(hex).advance(5).pins.D9.level, 0);
});

test("UART carries compiled Serial text and actual digital/ADC readings without replaying a previous chunk", async () => {
  const { hex } = await compileSketch(`
    void setup() { Serial.begin(9600); pinMode(2, INPUT_PULLUP); Serial.println("inicio"); }
    void loop() { Serial.print(digitalRead(2)); Serial.print(":"); Serial.println(analogRead(A0)); delay(20); }
  `);
  const sim = new UnoSimulation(hex);
  sim.setInputs({ digital: { D2: 0 }, analog: { A0: 2.5 } });
  let output = sim.advance(80);
  assert.match(output.serial.text, /^inicio\r\n0:512\r\n/);
  assert.ok(Math.abs(output.serial.baud - 9600) < 100);
  assert.equal(output.serial.dropped, 0);
  assert.equal(
    sim.snapshot().serial.text,
    "",
    "snapshot never replays UART bytes",
  );
  assert.equal(
    sim.advance(0).serial.text,
    "",
    "a drained chunk is not delivered twice",
  );
  sim.setInputs({ digital: { D2: null }, analog: { A0: 5 } });
  output = sim.advance(80);
  assert.match(output.serial.text, /1:1023\r\n/);
  assert.doesNotMatch(output.serial.text, /inicio/);
});

test("analogRead uses the connected ADC voltage for PWM, including endpoints, intermediate and disconnected input", async () => {
  const { hex } = await compileSketch(`
    void setup() { pinMode(9, OUTPUT); pinMode(10, OUTPUT); }
    void loop() { analogWrite(9, analogRead(A0) / 4); analogWrite(10, analogRead(A1) / 4); }
  `);
  const sim = new UnoSimulation(hex);
  for (const [voltage, expected] of [
    [0, 0],
    [2.5, 128 / 255],
    [5, 1],
    [null, 0],
  ]) {
    sim.setInputs({ analog: { A0: voltage, A1: 5 } });
    const output = sim.advance(100);
    assert.ok(
      Math.abs(output.pins.D9.duty - expected) < 0.035,
      `A0=${voltage}: PWM ${output.pins.D9.duty}`,
    );
    assert.equal(output.pins.D10.duty, 1, "A1 is read independently from A0");
  }
});

test("compiled Servo library produces three pulse widths at CPU timing and preserves PWM on timer 2", async () => {
  const { hex } = await compileSketch(`
    #include <Servo.h>
    Servo servo;
    void setup() { servo.attach(9); pinMode(3, OUTPUT); analogWrite(3, 128); }
    void loop() {
      servo.writeMicroseconds(600); delay(100);
      servo.writeMicroseconds(1500); delay(100);
      servo.writeMicroseconds(2400); delay(100);
      servo.detach(); delay(100); servo.attach(9);
    }
  `);
  const sim = new UnoSimulation(hex);
  for (const [elapsed, width] of [
    [80, 600],
    [100, 1500],
    [100, 2400],
  ]) {
    const output = sim.advance(elapsed);
    assert.ok(
      Math.abs(output.pins.D9.pulseWidthUs - width) < 10,
      `expected ${width} μs, got ${output.pins.D9.pulseWidthUs}`,
    );
    assert.ok(Math.abs(output.pins.D9.pulsePeriodUs - 20000) < 100);
    assert.ok(output.pins.D9.pulseAgeMs >= 0 && output.pins.D9.pulseAgeMs < 25);
    assert.ok(Math.abs(output.pins.D3.duty - 128 / 255) < 0.035);
  }
  const stopped = sim.advance(100);
  assert.ok(stopped.pins.D9.pulseAgeMs > 60, "detached signal becomes stale");
});

test("attaching Servo takes Timer1 away from PWM on D9/D10 while Timer2 PWM continues", async () => {
  const { hex } = await compileSketch(`
    #include <Servo.h>
    Servo servo;
    void setup() {
      pinMode(9, OUTPUT); pinMode(10, OUTPUT); pinMode(3, OUTPUT);
      analogWrite(9, 128); analogWrite(10, 128); analogWrite(3, 128);
      delay(100); servo.attach(6); servo.write(90);
    }
    void loop() {}
  `);
  const sim = new UnoSimulation(hex);
  const before = sim.advance(80);
  for (const name of ["D9", "D10", "D3"])
    assert.ok(Math.abs(before.pins[name].duty - 128 / 255) < 0.035);
  const after = sim.advance(100);
  for (const name of ["D9", "D10"])
    assert.equal(
      after.pins[name].pwm,
      false,
      `${name} no longer provides PWM after Servo takes Timer1`,
    );
  assert.ok(Math.abs(after.pins.D3.duty - 128 / 255) < 0.035);
  assert.ok(Math.abs(after.pins.D6.pulseWidthUs - 1472) < 10);
});

test("UART keeps a bounded tail while reports are deferred and reports discarded bytes", async () => {
  const { hex } = await compileSketch(`
    void setup() {
      pinMode(13, OUTPUT); Serial.begin(1000000);
      for (int i = 0; i < 5000; i++) Serial.write('x');
      Serial.println("fim"); Serial.flush(); digitalWrite(13, HIGH);
    }
    void loop() {}
  `);
  const sim = new UnoSimulation(hex);
  const pending = sim.advance(120, { drainSerial: false });
  assert.equal(
    pending.pins.D13.level,
    1,
    "high volume does not stall the firmware",
  );
  assert.equal(pending.serial.text, "");
  const reported = sim.advance(0).serial;
  assert.equal(reported.text.length, 4096);
  assert.equal(reported.dropped, 909);
  assert.ok(reported.text.endsWith("fim\r\n"));
  assert.equal(sim.advance(0).serial.dropped, 0);
});

test("invalid external inputs are rejected atomically and releasing defaults remains explicit", async () => {
  const { hex } = await compileSketch(`
    void setup() { pinMode(2, INPUT_PULLUP); pinMode(9, OUTPUT); }
    void loop() { digitalWrite(9, !digitalRead(2)); }
  `);
  const sim = new UnoSimulation(hex);
  sim.setInputs({ digital: { D2: 0 } });
  assert.equal(sim.advance(5).pins.D9.level, 1);
  for (const inputs of [
    { digital: { D20: 1 } },
    { digital: { D2: 2 } },
    { digital: { D2: null }, analog: { A0: 6 } },
    { analog: { D2: 2.5 } },
    { analog: { A0: NaN } },
  ])
    assert.throws(() => sim.setInputs(inputs), /Entrada/);
  assert.equal(
    sim.advance(5).pins.D9.level,
    1,
    "invalid requests did not release D2",
  );
});
