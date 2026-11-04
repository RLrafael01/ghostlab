import * as T from "three";
import { BREADBOARD, breadboardLayout } from "./breadboard-layout.js";

function punchedTile(width, depth, holes, holeSize, thickness) {
  const shape = new T.Shape();
  shape.moveTo(-width / 2, -depth / 2);
  shape.lineTo(width / 2, -depth / 2);
  shape.lineTo(width / 2, depth / 2);
  shape.lineTo(-width / 2, depth / 2);
  shape.closePath();
  for (const z of holes) {
    const hole = new T.Path();
    hole.moveTo(-holeSize / 2, z - holeSize / 2);
    hole.lineTo(-holeSize / 2, z + holeSize / 2);
    hole.lineTo(holeSize / 2, z + holeSize / 2);
    hole.lineTo(holeSize / 2, z - holeSize / 2);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new T.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function addMarkings(group, layout) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  const pixelsPerUnit = Math.min(300, 4096 / layout.width);
  canvas.width = Math.ceil(layout.width * pixelsPerUnit);
  canvas.height = Math.ceil(layout.depth * pixelsPerUnit);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(pixelsPerUnit, pixelsPerUnit);
  context.translate(layout.width / 2, layout.depth / 2);
  context.fillStyle = "#52616a";
  context.textAlign = "center";
  context.font = "0.06px monospace";
  for (let column = 0; column < layout.columns; column++) {
    if (column !== 0 && column !== layout.columns - 1 && (column + 1) % 5 !== 0)
      continue;
    const x = layout.firstColumnX + column * layout.pitch;
    for (const z of [-0.75, 0.8]) context.fillText(String(column + 1), x, z);
  }
  for (let side = 0; side < 2; side++) {
    const sign = side ? 1 : -1;
    for (let row = 0; row < 5; row++) {
      const z =
        sign *
        (BREADBOARD.outerRowZ - row * BREADBOARD.pitch) *
        BREADBOARD.sceneScale;
      for (const x of [-layout.width / 2 + 0.055, layout.width / 2 - 0.055])
        context.fillText("abcdefghij"[side * 5 + row], x, z + 0.02);
    }
    for (let rail = 0; rail < 2; rail++) {
      context.strokeStyle = rail ? "#2d80b1" : "#d75252";
      context.fillStyle = context.strokeStyle;
      context.lineWidth = 0.014;
      const z = sign * (rail ? 1.15 : 0.845);
      context.beginPath();
      context.moveTo(-layout.width / 2 + 0.11, z);
      context.lineTo(layout.width / 2 - 0.11, z);
      context.stroke();
      context.fillText(rail ? "−" : "+", -layout.width / 2 + 0.055, z + 0.022);
    }
    context.fillStyle = "#52616a";
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  const decal = new T.Mesh(
    new T.PlaneGeometry(layout.width, layout.depth),
    new T.MeshStandardMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      roughness: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.y = layout.topY + 0.001;
  decal.userData.surfaceDecal = true;
  decal.raycast = () => {};
  group.add(decal);
}

export function createBreadboard(columns = BREADBOARD.columns) {
  const layout = breadboardLayout(columns);
  const group = new T.Group();
  group.name = "parametric-breadboard";
  group.userData.columns = layout.columns;
  group.userData.contactCount = layout.contactCount;
  const plastic = new T.MeshStandardMaterial({
    color: "#eeeede",
    roughness: 0.68,
  });
  const underside = new T.MeshStandardMaterial({
    color: "#c1c4bb",
    roughness: 0.85,
  });
  const metal = new T.MeshStandardMaterial({
    color: "#2b3336",
    roughness: 0.6,
    metalness: 0.3,
  });
  const surfaceFloor = layout.topY - 0.08;
  function box(width, height, depth, x, y, z, material = plastic) {
    const mesh = new T.Mesh(new T.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  box(
    layout.width,
    surfaceFloor - layout.bottomY,
    layout.depth,
    0,
    (surfaceFloor + layout.bottomY) / 2,
    0,
    underside,
  );
  const outerRowZ = BREADBOARD.outerRowZ * BREADBOARD.sceneScale;
  const mainDepth = 5 * layout.pitch;
  const mainCenter = outerRowZ - 2 * layout.pitch;
  const mainEdge = mainCenter + mainDepth / 2;
  const railStartZ = 0.020995 * BREADBOARD.sceneScale;
  const railEdge = railStartZ + 1.5 * layout.pitch;
  const rowOffsets = [-2, -1, 0, 1, 2].map((offset) => offset * layout.pitch);
  const panelGeometry = punchedTile(
    layout.pitch,
    mainDepth,
    rowOffsets,
    layout.holeSize,
    0.08,
  );
  const panels = new T.InstancedMesh(
    panelGeometry,
    plastic,
    layout.columns * 2,
  );
  const matrix = new T.Matrix4();
  for (let side = 0; side < 2; side++)
    for (let column = 0; column < layout.columns; column++)
      panels.setMatrixAt(
        side * layout.columns + column,
        matrix.makeTranslation(
          layout.firstColumnX + column * layout.pitch,
          surfaceFloor,
          (side ? 1 : -1) * mainCenter,
        ),
      );
  panels.receiveShadow = true;
  panels.castShadow = true;
  group.add(panels);

  // Edge caps and strips leave the central DIP channel recessed.
  for (const sign of [-1, 1]) {
    box(
      0.115,
      0.08,
      layout.depth,
      sign * (layout.width / 2 - 0.0575),
      surfaceFloor + 0.04,
      0,
    );
    box(
      layout.columns * layout.pitch,
      0.08,
      railStartZ - layout.pitch / 2 - mainEdge,
      0,
      surfaceFloor + 0.04,
      (sign * (mainEdge + railStartZ - layout.pitch / 2)) / 2,
    );
    box(
      layout.columns * layout.pitch,
      0.08,
      layout.depth / 2 - railEdge,
      0,
      surfaceFloor + 0.04,
      (sign * (railEdge + layout.depth / 2)) / 2,
    );
  }
  const railGeometry = punchedTile(
    layout.pitch,
    layout.pitch,
    [0],
    layout.holeSize,
    0.08,
  );
  const railTiles = new T.InstancedMesh(
    railGeometry,
    plastic,
    layout.railCount * 4,
  );
  const railPins = layout.terminals.filter((pin) => pin.name.includes(" "));
  railPins.forEach((pin, index) =>
    railTiles.setMatrixAt(
      index,
      matrix.makeTranslation(pin.position[0], surfaceFloor, pin.position[2]),
    ),
  );
  railTiles.receiveShadow = true;
  railTiles.castShadow = true;
  group.add(railTiles);
  const firstRailX = layout.firstColumnX + 1.5 * layout.pitch;
  const lastRailX =
    firstRailX +
    (layout.railCount - 1 + Math.floor((layout.railCount - 1) / 5)) *
      layout.pitch;
  for (const sign of [-1, 1])
    for (let rail = 0; rail < 2; rail++) {
      const z = sign * (railStartZ + rail * layout.pitch);
      const start = (-layout.columns * layout.pitch) / 2;
      const end = (layout.columns * layout.pitch) / 2;
      const firstEdge = firstRailX - layout.pitch / 2;
      const lastEdge = lastRailX + layout.pitch / 2;
      box(
        firstEdge - start,
        0.08,
        layout.pitch,
        (firstEdge + start) / 2,
        surfaceFloor + 0.04,
        z,
      );
      box(
        end - lastEdge,
        0.08,
        layout.pitch,
        (end + lastEdge) / 2,
        surfaceFloor + 0.04,
        z,
      );
      for (let gap = 5; gap < layout.railCount; gap += 5)
        box(
          layout.pitch,
          0.08,
          layout.pitch,
          firstRailX + (gap + gap / 5 - 1) * layout.pitch,
          surfaceFloor + 0.04,
          z,
        );
    }
  const contacts = new T.InstancedMesh(
    new T.BoxGeometry(layout.holeSize * 0.95, 0.008, layout.holeSize * 0.95),
    metal,
    layout.contactCount,
  );
  layout.terminals.forEach((pin, index) =>
    contacts.setMatrixAt(
      index,
      matrix.makeTranslation(
        pin.position[0],
        surfaceFloor + 0.005,
        pin.position[2],
      ),
    ),
  );
  group.add(contacts);
  const sleeves = new T.InstancedMesh(
    punchedTile(
      layout.holeSize,
      layout.holeSize,
      [0],
      layout.holeSize - 0.004,
      0.066,
    ),
    new T.MeshStandardMaterial({ color: "#646c6a", roughness: 0.95 }),
    layout.contactCount,
  );
  layout.terminals.forEach((pin, index) =>
    sleeves.setMatrixAt(
      index,
      matrix.makeTranslation(
        pin.position[0],
        surfaceFloor + 0.002,
        pin.position[2],
      ),
    ),
  );
  group.add(sleeves);
  const targets = new T.InstancedMesh(
    new T.SphereGeometry(0.025, 8, 6),
    new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    layout.contactCount,
  );
  targets.userData.pinNames = layout.terminals.map((pin) => pin.name);
  layout.terminals.forEach((pin, index) =>
    targets.setMatrixAt(index, matrix.makeTranslation(...pin.position)),
  );
  group.add(targets);
  addMarkings(group, layout);
  return group;
}

function disposeModel(model) {
  const geometries = new Set();
  const materials = new Set();
  model.traverse((object) => {
    if (object.isInstancedMesh) object.dispose();
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) materials.add(object.material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    material.map?.dispose();
    material.dispose();
  }
}

export function replaceBreadboard(board, columns) {
  const model = createBreadboard(columns);
  for (const child of [...board.group.children]) {
    board.group.remove(child);
    disposeModel(child);
  }
  board.group.add(model);
  board.columns = model.userData.columns;
  board.group.scale.setScalar(1);
  board.group.updateWorldMatrix(true, true);
  return model;
}
