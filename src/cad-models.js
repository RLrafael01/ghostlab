import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const loader = new GLTFLoader();
const templates = new Map();
const rotations = {
  uno: [0, Math.PI / 2, 0],
  board: [0, 0, 0],
  servo: [-Math.PI / 2, 0, 0],
  button: [0, 0, 0],
  pot: [-Math.PI / 2, 0, 0],
  led: [-Math.PI / 2, 0, 0],
  resistor: [-Math.PI / 2, 0, 0],
  sensor: [-Math.PI / 2, 0, 0],
};
export async function loadCAD(type) {
  if (!templates.has(type)) {
    const pending = loader
      .loadAsync(
        type === "uno" ? "/models/uno/source.gltf" : `/models/${type}.glb`,
      )
      .then(({ scene }) => {
        // The Uno viewer file includes a Z-up transform; its vertex data is already Y-up.
        if (type === "uno") {
          scene.children[0].quaternion.identity();
          scene.traverse((object) => {
            if (!object.isMesh) return;
            const geometry = object.geometry.toNonIndexed();
            const positions = geometry.attributes.position;
            const colors = [];
            for (let i = 0; i < positions.count; i += 3) {
              const x =
                (positions.getX(i) +
                  positions.getX(i + 1) +
                  positions.getX(i + 2)) /
                3;
              const y =
                (positions.getY(i) +
                  positions.getY(i + 1) +
                  positions.getY(i + 2)) /
                3;
              const z =
                (positions.getZ(i) +
                  positions.getZ(i + 1) +
                  positions.getZ(i + 2)) /
                3;
              const color = new T.Color(
                y <= 2.05
                  ? "#087f8c"
                  : z < -18 && x > -13
                    ? "#b9c2c7"
                    : y < 2.2
                      ? "#b8b5a0"
                      : "#252b30",
              );
              for (let v = 0; v < 3; v++)
                colors.push(color.r, color.g, color.b);
            }
            geometry.setAttribute(
              "color",
              new T.Float32BufferAttribute(colors, 3),
            );
            object.geometry = geometry;
            object.material = new T.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.4,
              metalness: 0.2,
            });
          });
        }
        attachTerminals(scene, type);
        const oriented = new T.Group();
        oriented.add(scene);
        scene.rotation.set(...rotations[type]);
        scene.updateMatrixWorld(true);
        const bounds = new T.Box3().setFromObject(oriented);
        const scale = type === "board" ? 44.5 : 0.0445;
        scene.scale.setScalar(scale);
        const center = bounds.getCenter(new T.Vector3()).multiplyScalar(scale);
        scene.position.set(-center.x, -bounds.min.y * scale + 0.02, -center.z);
        oriented.updateMatrixWorld(true);
        return oriented;
      })
      .catch((error) => {
        templates.delete(type);
        throw error;
      });
    templates.set(type, pending);
  }
  const template = await templates.get(type);
  const model = template.clone(true);
  // Each instance owns disposable render resources, including embedded textures.
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry = object.geometry.clone();
    object.material = object.material.clone();
    if (object.material.map) object.material.map = object.material.map.clone();
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return model;
}

function attachTerminals(scene, type) {
  const pins = [];
  const pin = (name, x, y, z) => pins.push({ name, position: [x, y, z] });
  if (type === "uno") {
    const digital = [
      "AREF",
      "GND",
      "D13",
      "D12",
      "D11",
      "D10",
      "D9",
      "D8",
      "D7",
      "D6",
      "D5",
      "D4",
      "D3",
      "D2",
      "D1",
      "D0",
    ];
    digital.forEach((name, i) =>
      pin(name, 8.2, 10.1, i < 8 ? -7.89 + i * 2.5 : 15.11 + (i - 8) * 2.5),
    );
    ["RESET", "3.3V", "5V", "GND", "GND", "VIN"].forEach((name, i) =>
      pin(name, -40.4, 10.1, -0.89 + i * 2.5),
    );
    ["A0", "A1", "A2", "A3", "A4", "A5"].forEach((name, i) =>
      pin(name, -40.4, 10.1, 20.11 + i * 2.5),
    );
  } else if (type === "board") {
    for (let side = 0; side < 2; side++) {
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 63; col++) {
          pin(
            `${"abcdefghij"[side * 5 + row]}${col + 1}`,
            -0.078735 + col * 0.00254,
            0.0091,
            (side ? 1 : -1) * (0.01397 - row * 0.00254),
          );
        }
      for (let rail = 0; rail < 2; rail++)
        for (let col = 0; col < 50; col++) {
          pin(
            `${side ? "Inferior" : "Superior"} ${rail ? "−" : "+"} ${col + 1}`,
            -0.074935 + (col + Math.floor(col / 5)) * 0.00254,
            0.0091,
            (side ? 1 : -1) * (0.020995 + rail * 0.00254),
          );
        }
    }
  } else if (type === "sensor") {
    ["VCC", "Trig", "Echo", "GND"].forEach((name, i) =>
      pin(name, -3.81 + i * 2.54, -15.5, -2.5),
    );
  } else if (type === "resistor") {
    pin("1", -5, 0, -3.8);
    pin("2", 5, 0, -3.8);
  }
  const names = {
    led: { Anodo: "Ânodo +", Catodo: "Cátodo −" },
    servo: { "servo-3": "GND", "servo-4": "5V", "servo-5": "Sinal" },
    pot: { "pot-4": "VCC", "pot-5": "Sinal", "pot-6": "GND" },
  };
  let buttonPin = 0;
  scene.traverse((object) => {
    if (!object.isMesh) return;
    object.userData.pinName = names[type]?.[object.name];
    if (type === "button" && object.name.startsWith("Pin"))
      object.userData.pinName = String(++buttonPin);
  });
  if (!pins.length) return;
  const targets = new T.InstancedMesh(
    new T.SphereGeometry(type === "board" ? 0.00055 : 0.7, 8, 6),
    new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    pins.length,
  );
  targets.userData.pinNames = pins.map((p) => p.name);
  pins.forEach((p, i) =>
    targets.setMatrixAt(i, new T.Matrix4().makeTranslation(...p.position)),
  );
  scene.add(targets);
}

export function pinNameForHit(hit) {
  return (
    hit?.object.userData.pinNames?.[hit.instanceId] ??
    hit?.object.userData.pinName
  );
}
