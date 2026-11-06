import { examples } from "./examples.js";

// Assembly is independent from CAD loading, placement and user confirmation.
export async function createDemoCircuit(id, { add, connect }) {
  if (!Object.hasOwn(examples, id)) throw new Error("Exemplo desconhecido.");
  const [uno, board, led, resistor] = await Promise.all([
    add("uno", -3.8, 0),
    add("board", 1.7, 0),
    add("led", 1.3, -0.4),
    add("resistor", 0.4, -0.4),
  ]);
  if (![uno, board, led, resistor].every(Boolean))
    throw new Error("Não foi possível carregar os componentes do exemplo.");
  let peripheral = null;
  if (id === "button") {
    peripheral = await add("button", 3.0, -0.4);
    if (!peripheral) throw new Error("Não foi possível carregar o botão.");
    peripheral.pressed = false;
  }
  if (id === "pot") {
    peripheral = await add("pot", 3.2, 1.3);
    if (!peripheral)
      throw new Error("Não foi possível carregar o potenciômetro.");
    peripheral.value = 0.5;
  }
  if (id === "distance" || id === "gate") {
    peripheral = await add("sensor", 3.2, 1.5);
    if (!peripheral) throw new Error("Não foi possível carregar o sensor.");
    connect(uno, "5V", peripheral, "VCC", "#c43c34");
    connect(uno, "GND", peripheral, "GND", "#4c5360");
    connect(uno, "D7", peripheral, "Trig", "#e9b640");
    connect(peripheral, "Echo", uno, "D6", "#20a79a");
  }
  if (id === "servo") {
    peripheral = await add("servo", 3.2, 1.5);
    if (!peripheral) throw new Error("Não foi possível carregar o servo.");
  }
  connect(uno, "D9", board, "Superior + 2", "#c43c34", 0.55);
  connect(board, "Superior + 8", resistor, "1", "#c43c34", 0.4);
  connect(resistor, "2", led, "Ânodo +", "#e9b640", 0.35);
  connect(led, "Cátodo −", board, "Superior − 8", "#20a79a", 0.4);
  connect(board, "Superior − 3", uno, "GND", "#4c5360", 0.8);
  if (id === "button") {
    connect(uno, "D2", peripheral, "1", "#e9b640", 0.65);
    connect(peripheral, "2", uno, "GND", "#4c5360", 0.8);
  }
  if (id === "pot") {
    connect(uno, "5V", peripheral, "VCC", "#c43c34", 0.65);
    connect(uno, "GND", peripheral, "GND", "#4c5360", 0.8);
    connect(peripheral, "Sinal", uno, "A0", "#e9b640", 0.9);
  }
  if (id === "servo") {
    connect(uno, "5V", peripheral, "5V", "#c43c34", 0.65);
    connect(uno, "GND", peripheral, "GND", "#4c5360", 0.8);
    connect(uno, "D6", peripheral, "Sinal", "#e9b640", 0.9);
  }
  if (id === "gate") {
    const [servo, button] = await Promise.all([
      add("servo", 1.2, 2.3),
      add("button", -0.5, 2.2),
    ]);
    if (!servo || !button)
      throw new Error("Não foi possível carregar a cancela.");
    servo.gate = true;
    connect(uno, "5V", servo, "5V", "#c43c34");
    connect(uno, "GND", servo, "GND", "#4c5360");
    connect(uno, "D5", servo, "Sinal", "#e9b640");
    connect(uno, "D2", button, "1", "#e9b640");
    connect(button, "2", uno, "GND", "#4c5360");
  }
  return { uno, board, led, resistor, peripheral };
}
