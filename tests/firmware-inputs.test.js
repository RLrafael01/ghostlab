import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { UnoSimulation } from "../src/firmware/uno-simulation.js";

const artifact = JSON.parse(
  await readFile(
    new URL("../public/firmware/on.json", import.meta.url),
    "utf8",
  ),
);

test("entrada externa chega ao GPIO e uma entrada flutuante volta a LOW", () => {
  const simulation = new UnoSimulation(artifact.hex);
  simulation.setInputs({ digital: { D2: 1 } });
  assert.equal(simulation.snapshot().pins.D2.input, 1);
  simulation.setInputs({ digital: { D2: 0 } });
  assert.equal(simulation.snapshot().pins.D2.input, 0);
  simulation.setInputs({ digital: { D2: null } });
  assert.equal(simulation.snapshot().pins.D2.input, 0);
  assert.equal(simulation.snapshot().pins.D2.pullup, false);
});
