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
