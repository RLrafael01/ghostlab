import test from "node:test";
import assert from "node:assert/strict";
import { simulateCircuit } from "../src/electrical-simulation.js";

const terminal = (componentId, pin, occurrence = 0) => ({
  componentId,
  pin,
  occurrence,
});
const wire = (id, a, b) => ({ id, ends: [a, b] });
function referenceCircuit() {
  return {
    components: [
      { id: 1, type: "uno" },
      { id: 2, type: "resistor" },
      { id: 3, type: "led" },
    ],
    wires: [
      wire(1, terminal(1, "5V"), terminal(2, "1")),
      wire(2, terminal(2, "2"), terminal(3, "Ânodo +")),
      wire(3, terminal(3, "Cátodo −"), terminal(1, "GND", 2)),
    ],
  };
}

test("5 V → resistor → LED → GND acende; retorno solto apaga e reconectar acende", () => {
  const project = referenceCircuit();
  assert.equal(simulateCircuit(project).leds[0].on, true);
  const ground = project.wires[2].ends[1];
  project.wires[2].ends[1] = terminal(null, null);
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: false, reason: "open" },
  ]);
  project.wires[2].ends[1] = ground;
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: true, reason: "closed" },
  ]);
});

test("ligações sem resistor, invertidas, em curto ou com LED desviado não simulam luz ou dano", () => {
  const project = referenceCircuit();
  project.wires[0].ends[1] = terminal(3, "Ânodo +");
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: false, reason: "unlimited" },
  ]);
  project.wires[0].ends[1] = terminal(2, "1");
  project.wires[1].ends[1] = terminal(3, "Cátodo −");
  project.wires[2].ends[0] = terminal(3, "Ânodo +");
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: false, reason: "reversed" },
  ]);
  project.wires[1].ends[1] = terminal(3, "Ânodo +");
  project.wires[2].ends[0] = terminal(3, "Cátodo −");
  project.wires.push(wire(4, terminal(3, "Ânodo +"), terminal(3, "Cátodo −")));
  assert.equal(
    simulateCircuit(project).leds[0].on,
    false,
    "LED desviado por jumper",
  );
  project.wires[3] = wire(4, terminal(1, "5V"), terminal(1, "GND"));
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: false, reason: "unsupported" },
  ]);
  project.wires.pop();
  assert.equal(
    simulateCircuit(project).leds[0].on,
    true,
    "corrigir ligações recupera sem dano retido",
  );
});

test("protoboard liga a–e por coluna e cada barramento; separa f–j, colunas, sinais e placas", () => {
  const project = referenceCircuit();
  project.components.push(
    { id: 4, type: "board", columns: 63 },
    { id: 5, type: "board", columns: 63 },
  );
  project.wires[0] = wire(1, terminal(1, "5V"), terminal(4, "Superior + 1"));
  project.wires.push(wire(4, terminal(4, "Superior + 50"), terminal(2, "1")));
  project.wires[1] = wire(2, terminal(2, "2"), terminal(4, "a12"));
  project.wires.push(wire(5, terminal(4, "e12"), terminal(3, "Ânodo +")));
  assert.equal(simulateCircuit(project).leds[0].on, true);
  for (const target of [
    terminal(4, "f12"),
    terminal(4, "e13"),
    terminal(5, "e12"),
  ]) {
    project.wires[4].ends[0] = target;
    assert.equal(
      simulateCircuit(project).leds[0].on,
      false,
      JSON.stringify(target),
    );
  }
  project.wires[4].ends[0] = terminal(4, "e12");
  for (const pin of [
    "Superior − 50",
    "Inferior + 50",
    "Inferior − 50",
    "Superior + 51",
    "a64",
  ]) {
    project.wires[3].ends[0] = terminal(4, pin);
    assert.equal(simulateCircuit(project).leds[0].on, false, pin);
  }
  project.wires[3].ends[0] = terminal(4, "Superior + 50");
  project.components[3].columns = 10;
  assert.equal(
    simulateCircuit(project).leds[0].on,
    false,
    "contatos removidos pelo redimensionamento",
  );
});

test("f–j e barramentos inferiores funcionam também em protoboard ampliada", () => {
  const project = referenceCircuit();
  project.components.push({ id: 4, type: "board", columns: 126 });
  project.wires[0] = wire(1, terminal(1, "5V"), terminal(4, "f126"));
  project.wires.push(wire(4, terminal(4, "j126"), terminal(2, "1")));
  project.wires[2] = wire(
    3,
    terminal(3, "Cátodo −"),
    terminal(4, "Inferior − 1"),
  );
  project.wires.push(
    wire(5, terminal(4, "Inferior − 100"), terminal(1, "GND", 1)),
  );
  assert.equal(simulateCircuit(project).leds[0].on, true);
  project.wires[4].ends[0].pin = "Inferior + 100";
  assert.equal(simulateCircuit(project).leds[0].on, false);
});

test("resistor no retorno limita o caminho; um resistor solto não limita uma ligação direta", () => {
  const project = referenceCircuit();
  project.wires = [
    wire(1, terminal(1, "5V"), terminal(3, "Ânodo +")),
    wire(2, terminal(3, "Cátodo −"), terminal(2, "1")),
    wire(3, terminal(2, "2"), terminal(1, "GND")),
  ];
  assert.equal(simulateCircuit(project).leds[0].on, true);
  project.wires = [
    project.wires[0],
    wire(4, terminal(3, "Cátodo −"), terminal(1, "GND")),
  ];
  assert.equal(simulateCircuit(project).leds[0].reason, "unlimited");
});

test("fontes separadas não interferem; compartilhar fontes não simula uma alimentação válida", () => {
  const project = referenceCircuit();
  project.components.push({ id: 4, type: "uno" }, { id: 5, type: "led" });
  assert.deepEqual(simulateCircuit(project).leds, [
    { id: 3, on: true, reason: "closed" },
    { id: 5, on: false, reason: "open" },
  ]);
  project.wires[2].ends[1] = terminal(4, "GND");
  assert.equal(
    simulateCircuit(project).leds[0].on,
    false,
    "retorno não pertence à mesma fonte",
  );
  project.wires[2].ends[1] = terminal(1, "GND");
  project.wires.push(wire(4, terminal(1, "5V"), terminal(4, "GND")));
  assert.equal(simulateCircuit(project).leds[0].reason, "unsupported");
  project.wires.pop();
  project.wires[0].ends[0].pin = "D9";
  assert.equal(
    simulateCircuit(project).leds[0].on,
    false,
    "GPIO não executa firmware",
  );
  project.wires[0].ends[0].pin = "5V";
  project.components = project.components.filter((item) => item.id !== 1);
  assert.equal(
    simulateCircuit(project).leds[0].on,
    false,
    "fonte removida não continua alimentando",
  );
});
