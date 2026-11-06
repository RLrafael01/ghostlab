import { BOARD_COLUMN_LIMITS, breadboardLayout } from "../breadboard-layout.js";
import { UNO_HEADERS } from "../cad-models.js";

const pins = {
  uno: UNO_HEADERS.flatMap(({ names }) => names),
  led: ["Ânodo +", "Cátodo −"],
  resistor: ["1", "2"],
  button: ["1", "2", "3", "4"],
  servo: ["GND", "5V", "Sinal"],
  sensor: ["VCC", "Trig", "Echo", "GND"],
  pot: ["VCC", "Sinal", "GND"],
};
export function componentPins(component) {
  return component.type === "board"
    ? breadboardLayout(component.columns).terminals.map(({ name }) => name)
    : pins[component.type];
}

export const MAX_FILE = 1_000_000;
const record = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const between = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;
const position = (value) =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((n) => between(n, -100, 100));
const id = (value) =>
  Number.isSafeInteger(value) && value > 0 && value <= 1_000_000;

function requireValid(condition, field) {
  if (!condition) throw new Error(`Projeto inválido: ${field}.`);
}

function parametersFor(component) {
  const parameters = component.parameters;
  if (parameters === undefined) return undefined;
  requireValid(record(parameters), "parâmetros");
  const limits = {
    pot: { value: [0, 1] },
    resistor: { resistance: [1, 10_000_000] },
    sensor: { distanceCm: [0, 450] },
    servo: { minPulseUs: [400, 1499], maxPulseUs: [1500, 2600] },
  };
  for (const [key, value] of Object.entries(parameters)) {
    if (
      component.type === "servo" &&
      key === "gate" &&
      typeof value === "boolean"
    )
      continue;
    const range = limits[component.type]?.[key];
    requireValid(
      Array.isArray(range) && between(value, ...range),
      "parâmetro fora da faixa",
    );
  }
  return { ...parameters };
}

export function emptyProject(name = "Nova bancada") {
  return {
    version: 1,
    name,
    code: "void setup() {}\nvoid loop() {}\n",
    components: [],
    wires: [],
    environment: { distanceCm: 50 },
  };
}

export function validateProject(value) {
  requireValid(record(value) && value.version === 1, "versão do arquivo");
  requireValid(
    typeof value.name === "string" &&
      value.name.trim() &&
      value.name.length <= 100,
    "nome",
  );
  requireValid(
    typeof value.code === "string" && value.code.length <= 32_000,
    "código",
  );
  requireValid(
    Array.isArray(value.components) && value.components.length <= 100,
    "componentes",
  );
  requireValid(Array.isArray(value.wires) && value.wires.length <= 300, "fios");
  requireValid(
    between(value.environment?.distanceCm, 0, 500),
    "distância do objeto",
  );
  const terminals = new Map();
  const components = value.components.map((component) => {
    requireValid(
      record(component) && id(component.id) && !terminals.has(component.id),
      "ID de componente",
    );
    const { id: componentId, type, columns, rotationY } = component;
    requireValid(
      type === "board" || Object.hasOwn(pins, type),
      "tipo de componente",
    );
    requireValid(
      position(component.position) && between(rotationY, -100, 100),
      "posição ou rotação",
    );
    if (type === "board")
      requireValid(
        Number.isInteger(columns) &&
          between(columns, BOARD_COLUMN_LIMITS.min, BOARD_COLUMN_LIMITS.max),
        "colunas da protoboard",
      );
    terminals.set(componentId, componentPins(component));
    const parameters = parametersFor(component);
    return {
      id: componentId,
      type,
      position: [...component.position],
      rotationY,
      ...(type === "board" && { columns }),
      ...(parameters && { parameters }),
    };
  });
  const wireIds = new Set();
  const wires = value.wires.map((wire) => {
    requireValid(
      record(wire) && id(wire.id) && !wireIds.has(wire.id),
      "ID de fio",
    );
    wireIds.add(wire.id);
    requireValid(
      typeof wire.color === "string" && /^#[0-9a-f]{6}$/i.test(wire.color),
      "cor de fio",
    );
    requireValid(
      Array.isArray(wire.ends) && wire.ends.length === 2,
      "pontas de fio",
    );
    const ends = wire.ends.map((end) => {
      requireValid(record(end) && position(end.position), "posição da ponta");
      const { componentId, pin, occurrence } = end;
      if (componentId === null) {
        requireValid(pin === null && occurrence === null, "ponta livre");
      } else {
        const count =
          terminals.get(componentId)?.filter((name) => name === pin).length ??
          0;
        requireValid(
          Number.isInteger(occurrence) && occurrence >= 0 && occurrence < count,
          "terminal inexistente",
        );
      }
      return { componentId, pin, occurrence, position: [...end.position] };
    });
    return { id: wire.id, color: wire.color, ends };
  });
  return {
    version: 1,
    name: value.name,
    code: value.code,
    components,
    wires,
    environment: { distanceCm: value.environment.distanceCm },
  };
}

export function parseProject(text) {
  requireValid(
    typeof text === "string" && text.length <= MAX_FILE,
    "tamanho do arquivo",
  );
  return validateProject(JSON.parse(text));
}

export function serializeProject(project) {
  return JSON.stringify(validateProject(project), null, 2);
}
