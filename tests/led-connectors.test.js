import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { addLedConnectors } from "../src/led-connectors.js";
import {
  terminalPosition,
  createVisualWires,
  leadTip,
} from "../src/visual-wires.js";

async function ledModel() {
  const bytes = await readFile(
    new URL("../public/models/led.glb", import.meta.url),
  );
  const { scene: model } = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  const group = new T.Group();
  group.add(model);
  model.rotation.x = -Math.PI / 2;
  model.scale.setScalar(0.0445);
  model.traverse((object) => {
    if (object.name === "Anodo") object.userData.pinName = "Ânodo +";
    if (object.name === "Catodo") object.userData.pinName = "Cátodo −";
  });
  const mountingTip = leadTip({ group }, "Ânodo +");
  addLedConnectors(group);
  return { id: 1, type: "led", group, mountingTip };
}

test("both jumper connectors stay outside the real LED lens while retaining their electrical terminals", async () => {
  const led = await ledModel();
  const scene = new T.Scene();
  scene.add(led.group);
  const wires = createVisualWires(scene);
  const body = new T.Box3().setFromObject(led.group.getObjectByName("Funda"));
  for (const pin of ["Ânodo +", "Cátodo −"]) {
    const wire = wires.connect(led, pin, null, null, "#00ffff");
    wires.update();
    assert.equal(
      body.intersectsBox(new T.Box3().setFromObject(wire.handles[0])),
      false,
      `${pin}: connector overlaps the plastic lens`,
    );
    assert.equal(wires.connections().at(-1).ends[0].pin, pin);
    assert.ok(
      wire.handles[0].position.distanceTo(terminalPosition(led, pin)) < 1e-6,
    );
  }
});

test("visible LED targets follow cloned, moved and rotated pieces without moving their mounting leads", async () => {
  const led = await ledModel();
  assert.ok(leadTip(led, "Ânodo +").distanceTo(led.mountingTip) < 1e-6);
  const clone = { id: 2, type: "led", group: led.group.clone(true) };
  const before = ["Ânodo +", "Cátodo −"].map((pin) =>
    terminalPosition(led, pin),
  );
  clone.group.position.set(4, 0.5, -2);
  clone.group.rotation.y = Math.PI / 2;
  clone.group.updateWorldMatrix(true, true);
  for (const [index, pin] of ["Ânodo +", "Cátodo −"].entries()) {
    const expected = before[index]
      .clone()
      .applyMatrix4(clone.group.matrixWorld);
    assert.ok(terminalPosition(clone, pin).distanceTo(expected) < 1e-6);
    assert.ok(terminalPosition(led, pin).distanceTo(before[index]) < 1e-6);
  }
});
