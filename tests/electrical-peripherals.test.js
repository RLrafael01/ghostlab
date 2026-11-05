import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { JSDOM } from "jsdom";
import { createVisualWires } from "../src/visual-wires.js";
import { createElectricalView } from "../src/electrical-view.js";

function fixture() {
  const document = new JSDOM('<section id="status"></section>').window.document;
  const status = document.querySelector("#status");
  const scene = new T.Scene();
  const wires = createVisualWires(scene);
  const items = [];
  function add(type, pins) {
    const group = new T.Group();
    for (const [index, pin] of pins.entries()) {
      const target = new T.Mesh(
        new T.SphereGeometry(0.02),
        new T.MeshBasicMaterial(),
      );
      target.userData.pinName = pin;
      target.position.x = index * 0.1;
      group.add(target);
    }
    const item = { id: items.length + 1, type, group };
    items.push(item);
    scene.add(group);
    return item;
  }
  return { status, wires, items, add };
}

test("button changes feed circuit inputs and visible state while unchanged frames preserve the panel", () => {
  const { status, wires, items, add } = fixture();
  const uno = add("uno", ["GND", "D2"]);
  const button = add("button", ["1", "2", "3", "4"]);
  wires.connect(uno, "D2", button, "1", "yellow");
  wires.connect(uno, "GND", button, "2", "black");
  const firmware = {
    unoId: uno.id,
    pins: { D2: { output: false, input: 1, pullup: true } },
  };
  let observedInputs, observedState;
  const view = createElectricalView({
    items,
    wires,
    status,
    getFirmware: () => firmware,
    onInputs: (inputs) => {
      observedInputs = inputs;
    },
    onState: (state) => {
      observedState = state;
    },
  });
  const first = view.update();
  assert.equal(observedInputs?.digital.D2, null);
  assert.equal(observedState, first);
  assert.match(status.textContent, /Botão #2 · solto/);
  assert.match(status.textContent, /1\/3.*2\/4/);
  assert.match(status.textContent, /D2: HIGH/);
  button.pressed = true;
  firmware.pins.D2.input = 0;
  view.update();
  assert.equal(observedInputs.digital.D2, 0);
  assert.match(status.textContent, /Botão #2 · pressionado/);
  assert.match(status.textContent, /D2: LOW/);
  const row = status.firstElementChild;
  const cached = observedState;
  firmware.milliseconds = 400;
  assert.equal(view.update(), cached);
  assert.equal(
    status.firstElementChild,
    row,
    "time alone does not rebuild the status card",
  );
  button.pressed = false;
  view.update();
  assert.equal(observedInputs.digital.D2, null);
  assert.match(status.textContent, /Botão #2 · solto/);
});

test("potentiometer position updates modeled voltage and disconnecting power releases the analog input", () => {
  const { status, wires, items, add } = fixture();
  const uno = add("uno", ["5V", "GND", "A0"]);
  const pot = add("pot", ["VCC", "GND", "Sinal"]);
  pot.value = 0;
  wires.connect(uno, "5V", pot, "VCC", "red");
  const ground = wires.connect(uno, "GND", pot, "GND", "black");
  wires.connect(pot, "Sinal", uno, "A0", "yellow");
  const firmware = { unoId: uno.id, pins: { A0: { output: false, input: 0 } } };
  let observed;
  const view = createElectricalView({
    items,
    wires,
    status,
    getFirmware: () => firmware,
    onInputs: (inputs) => {
      observed = inputs;
    },
  });
  view.update();
  assert.match(status.textContent, /Potenciômetro #2 · 0%/);
  pot.value = 0.5;
  view.update();
  assert.equal(observed.analog.A0, 2.5);
  assert.match(status.textContent, /Potenciômetro #2 · 50%/);
  assert.match(status.textContent, /Tensão modelada: 2,50 V/);
  assert.doesNotMatch(
    status.textContent,
    /ADC|512|1023/,
    "the circuit model cannot claim the program's ADC reading",
  );
  firmware.analogReadings = { A0: { value: 321, milliseconds: 150 } };
  view.update();
  assert.match(status.textContent, /Última conversão ADC/);
  assert.match(status.textContent, /A0: 321\/1023.*0,150 s/);
  assert.doesNotMatch(status.textContent, /512\/1023/);
  wires.begin(ground, 1);
  wires.finish();
  view.update();
  assert.equal(observed.analog.A0, null);
  assert.match(status.textContent, /sem alimentação suportada/);
  assert.doesNotMatch(status.textContent, /2,50 V|A0: LOW/);
  assert.match(status.textContent, /sem tensão válida/);
});

test("servo status explains inactive pulses and conflicting GPIO inputs never appear as valid readings", () => {
  const { status, wires, items, add } = fixture();
  const uno = add("uno", ["5V", "GND", "D6", "D2"]);
  const servo = add("servo", ["5V", "GND", "Sinal"]);
  wires.connect(uno, "5V", servo, "5V", "red");
  wires.connect(uno, "GND", servo, "GND", "black");
  wires.connect(uno, "D6", servo, "Sinal", "yellow");
  const firmware = {
    unoId: uno.id,
    pins: {
      D6: {
        output: true,
        level: 0,
        duty: 0.07,
        pulseWidthUs: 1472,
        pulsePeriodUs: 20_000,
        pulseAgeMs: 1,
      },
      D2: { output: false, input: 1, pullup: true },
    },
  };
  const view = createElectricalView({
    items,
    wires,
    status,
    getFirmware: () => firmware,
  });
  view.update();
  assert.match(status.textContent, /Servo #2 · ativo/);
  assert.match(status.textContent, /Alvo: 90°/);
  assert.doesNotMatch(
    status.textContent,
    /D6: LOW/,
    "output pins are not advertised as firmware inputs",
  );
  firmware.pins.D6.pulseAgeMs = 61;
  view.update();
  assert.match(status.textContent, /Servo #2 · inativo/);
  assert.match(status.textContent, /pulsos ausentes ou fora da faixa/);
  assert.doesNotMatch(status.textContent, /Alvo: 90°/);
  wires.connect(uno, "D2", uno, "5V", "red");
  wires.connect(uno, "D2", uno, "GND", "black");
  view.update();
  assert.match(status.textContent, /Entradas em conflito.*D2/);
  assert.match(status.textContent, /fora do modelo/);
  assert.doesNotMatch(status.textContent, /D2: HIGH|D2: LOW/);
});
