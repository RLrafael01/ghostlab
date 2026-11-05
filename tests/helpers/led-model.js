import { readFile } from "node:fs/promises";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { addLedConnectors } from "../../src/led-connectors.js";
import { leadTip } from "../../src/visual-wires.js";

export async function ledModel() {
  const bytes = await readFile(
    new URL("../../public/models/led.glb", import.meta.url),
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
  const bounds = new T.Box3().setFromObject(group);
  model.position.y = -bounds.min.y + 0.02;
  const mountingTip = leadTip({ group }, "Ânodo +");
  addLedConnectors(group);
  return { id: 1, type: "led", group, mountingTip };
}
