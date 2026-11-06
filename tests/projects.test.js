import test from "node:test";
import assert from "node:assert/strict";
import { parseProject, serializeProject } from "../src/projects/schema.js";

function project() {
  return {
    version: 1,
    name: "Minha cancela",
    code: "// projeto editável\nvoid setup() {}\nvoid loop() {}",
    components: [
      { id: 4, type: "uno", position: [-3, 0, 0], rotationY: 0 },
      {
        id: 9,
        type: "board",
        columns: 83,
        position: [2, 0, 0],
        rotationY: 0.25,
      },
      {
        id: 12,
        type: "pot",
        position: [3, 0.5, 1],
        rotationY: 1,
        parameters: { value: 0.7 },
      },
    ],
    wires: [
      {
        id: 3,
        color: "#aabbcc",
        ends: [
          { componentId: 4, pin: "GND", occurrence: 2, position: [-2, 0.2, 0] },
          { componentId: 9, pin: "a80", occurrence: 0, position: [6, 0.5, 0] },
        ],
      },
      {
        id: 7,
        color: "#ff0000",
        ends: [
          {
            componentId: 12,
            pin: "Sinal",
            occurrence: 0,
            position: [3, 0.5, 1],
          },
          {
            componentId: null,
            pin: null,
            occurrence: null,
            position: [4, 0.12, 2],
          },
        ],
      },
    ],
    environment: { distanceCm: 43 },
  };
}

test("projeto compartilhado preserva IDs, código, tamanho, parâmetros, cores e pontas soltas", () => {
  const original = project();
  const exported = serializeProject(original);
  const otherSession = parseProject(exported);
  assert.deepEqual(otherSession, original);
  otherSession.components[0].position[0] = 1;
  assert.equal(original.components[0].position[0], -3);
});

test("recusa versões desconhecidas, terminais inexistentes e IDs duplicados", () => {
  const original = project();
  assert.throws(() => serializeProject({ ...original, version: 2 }), /versão/);
  original.wires[0].ends[1].pin = "a84";
  assert.throws(() => serializeProject(original), /terminal inexistente/);
  const duplicate = project();
  duplicate.components[1].id = duplicate.components[0].id;
  assert.throws(() => serializeProject(duplicate), /ID de componente/);
});

test("armazenamento reabre projeto sem estado transitório e preserva o último salvo após falha", async () => {
  const { saveLocalProject, readLocalProject } =
    await import("../src/projects/local-storage.js");
  let stored = null;
  const storage = {
    getItem: () => stored,
    setItem: (_, value) => {
      stored = value;
    },
  };
  const original = project();
  saveLocalProject(storage, { ...original, damaged: [12], serial: "saída" });
  assert.deepEqual(readLocalProject(storage), original);
  storage.setItem = () => {
    throw new Error("quota");
  };
  assert.throws(
    () => saveLocalProject(storage, { ...original, name: "Nova versão" }),
    /quota/,
  );
  assert.deepEqual(readLocalProject(storage), original);
  stored = "{";
  assert.throws(() => readLocalProject(storage), SyntaxError);
});

test("arquivo exportado abre em outra sessão preservando montagem e sketch", async () => {
  const { importProjectFile, projectDownload } =
    await import("../src/projects/files.js");
  const original = project();
  original.name = "<img src=x onerror=alert(1)>";
  const file = projectDownload("export", original);
  const other = { current: null };
  assert.equal(
    await importProjectFile(new Blob([file.text]), {
      confirm: () => true,
      apply: (data) => {
        other.current = data;
      },
    }),
    true,
  );
  assert.deepEqual(other.current, original);
  assert.equal(projectDownload("sketch", original).text, original.code);
  assert.match(file.name, /^[a-zA-Z0-9_-]+\.ghostlab\.json$/);
});

test("arquivo inválido, grande ou cancelado preserva projeto em edição", async () => {
  const { importProjectFile } = await import("../src/projects/files.js");
  const original = project();
  let current = original;
  let confirmations = 0;
  const callbacks = {
    confirm: () => {
      confirmations++;
      return false;
    },
    apply: (next) => {
      current = next;
    },
  };
  for (const text of ["{", JSON.stringify({ ...original, version: 2 })])
    await assert.rejects(importProjectFile(new Blob([text]), callbacks));
  await assert.rejects(
    importProjectFile({ size: 1_000_001 }, callbacks),
    /limite/,
  );
  assert.equal(confirmations, 0);
  assert.equal(
    await importProjectFile(new Blob([serializeProject(original)]), callbacks),
    false,
  );
  assert.equal(confirmations, 1);
  assert.equal(current, original);
});

test("guia identifica GND físico, contato da placa, jumper solto e limites", async () => {
  const { assemblyGuide } = await import("../src/projects/files.js");
  const original = project();
  original.components.push({
    id: 13,
    type: "resistor",
    position: [0, 0, 0],
    rotationY: 0,
  });
  const before = structuredClone(original);
  const guide = assemblyGuide(original);
  assert.match(guide, /83 colunas/);
  assert.match(
    guide,
    /Fio #3 .*Arduino Uno #4 \/ segundo GND após 5V, junto a VIN ↔ Protoboard #9 \/ a80/,
  );
  assert.match(guide, /Fio #7 .*Potenciômetro #12 \/ Sinal ↔ ponta livre/);
  assert.match(guide, /70%/);
  assert.match(guide, /não valida um valor em ohms/);
  assert.deepEqual(original, before);
  assert.match(
    assemblyGuide({ ...original, components: [], wires: [] }),
    /Nenhum componente.*Nenhum fio/s,
  );
});

test("salvamento preserva o braço da cancela sem guardar ângulo transitório", () => {
  const original = project();
  original.components.push({
    id: 17,
    type: "servo",
    position: [1, 0, 2],
    rotationY: 0,
    parameters: { gate: true },
    angle: 90,
  });
  const restored = parseProject(serializeProject(original));
  assert.deepEqual(restored.components.at(-1).parameters, { gate: true });
  assert.equal(restored.components.at(-1).angle, undefined);
});

test("round-trip reúne parâmetros de sensor, servo e potenciômetro e protoboard redimensionada", () => {
  const original = project();
  original.components.push(
    {
      id: 14,
      type: "sensor",
      position: [1, 0, 1],
      rotationY: 0,
      parameters: { distanceCm: 20 },
    },
    {
      id: 15,
      type: "servo",
      position: [2, 0, 2],
      rotationY: 0,
      parameters: { gate: true },
    },
  );
  assert.deepEqual(parseProject(serializeProject(original)), original);
});
