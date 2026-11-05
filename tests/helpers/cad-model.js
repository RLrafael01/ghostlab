import { readFile } from "node:fs/promises";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Real CAD fixtures, using the same orientation, scale and bench normalization
// as loadCAD. Rendering-only decals/materials are not needed for geometry checks.
export async function cadModel(type) {
  let bytes;
  if (type === "uno") {
    const url = new URL("../../public/models/uno/source.gltf", import.meta.url);
    const json = JSON.parse(await readFile(url, "utf8"));
    const binary = await readFile(new URL(json.buffers[0].uri, url));
    delete json.buffers[0].uri;
    const jsonBytes = Buffer.from(JSON.stringify(json));
    const jsonSize = Math.ceil(jsonBytes.length / 4) * 4;
    const binarySize = Math.ceil(binary.length / 4) * 4;
    bytes = Buffer.alloc(12 + 8 + jsonSize + 8 + binarySize);
    bytes.writeUInt32LE(0x46546c67, 0);
    bytes.writeUInt32LE(2, 4);
    bytes.writeUInt32LE(bytes.length, 8);
    bytes.writeUInt32LE(jsonSize, 12);
    bytes.writeUInt32LE(0x4e4f534a, 16);
    bytes.fill(0x20, 20, 20 + jsonSize);
    jsonBytes.copy(bytes, 20);
    bytes.writeUInt32LE(binarySize, 20 + jsonSize);
    bytes.writeUInt32LE(0x004e4942, 24 + jsonSize);
    binary.copy(bytes, 28 + jsonSize);
  } else {
    bytes = await readFile(
      new URL(`../../public/models/${type}.glb`, import.meta.url),
    );
  }
  const { scene: model } = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  const group = new T.Group();
  group.add(model);
  if (type === "uno") {
    model.children[0].quaternion.identity();
    model.rotation.y = Math.PI / 2;
  } else if (type !== "button") model.rotation.x = -Math.PI / 2;
  let buttonPin = 0;
  model.traverse((object) => {
    if (type === "button" && object.isMesh && object.name.startsWith("Pin"))
      object.userData.pinName = String(++buttonPin);
  });
  if (type === "resistor") {
    const targets = new T.InstancedMesh(
      new T.SphereGeometry(0.7, 8, 6),
      new T.MeshBasicMaterial(),
      2,
    );
    targets.userData.pinNames = ["1", "2"];
    // Two physical wire endpoints, in source CAD coordinates.
    targets.setMatrixAt(0, new T.Matrix4().makeTranslation(-5, 0, -3.8));
    targets.setMatrixAt(1, new T.Matrix4().makeTranslation(5, 0, -3.8));
    model.add(targets);
  }
  const bounds = new T.Box3().setFromObject(group);
  const scale = 0.0445;
  const center = bounds.getCenter(new T.Vector3()).multiplyScalar(scale);
  model.scale.setScalar(scale);
  model.position.set(-center.x, -bounds.min.y * scale + 0.02, -center.z);
  group.updateWorldMatrix(true, true);
  return { id: 1, type, group };
}

// Exclude metal leads, which may enter holes; check the actual solid body.
export function cadBody(item) {
  const names = {
    button: "button-6",
    resistor: "Resistor-body",
    pot: "pot-0",
    servo: "servo-2",
    sensor: "HC-SR04",
    uno: "arduino-unostep",
  };
  const body = item.group.getObjectByName(names[item.type]);
  if (!body)
    throw new Error(`Missing physical body in ${item.type} CAD fixture`);
  return new T.Box3().setFromObject(body);
}
