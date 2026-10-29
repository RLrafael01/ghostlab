import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function lightWorkbench(renderer, scene) {
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const room = new RoomEnvironment();
  const generator = new T.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.35;
  room.dispose();
  generator.dispose();
  scene.background = new T.Color("#20292e");
  scene.fog = new T.Fog("#20292e", 30, 65);
  scene.add(new T.HemisphereLight(0xe9f3ff, 0x454b50, 0.55));
  const key = new T.DirectionalLight(0xfff5e6, 2);
  key.position.set(-4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
    near: 0.5,
    far: 35,
  });
  key.shadow.normalBias = 0.002;
  key.shadow.bias = -0.00015;
  scene.add(key);
  const fill = new T.DirectionalLight(0xc2deff, 0.65);
  fill.position.set(5, 6, -8);
  scene.add(fill);
  const table = new T.Mesh(
    new T.PlaneGeometry(160, 160),
    new T.MeshStandardMaterial({ color: "#182226", roughness: 0.85 }),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.015;
  table.receiveShadow = true;
  scene.add(table);
  const grid = new T.GridHelper(40, 80, 0x506168, 0x3c484e);
  grid.material.transparent = true;
  grid.material.opacity = 0.32;
  scene.add(grid);
}
