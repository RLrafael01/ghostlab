import * as T from "three";
import { BREADBOARD, breadboardLayout } from "./breadboard-layout.js";
import { leadTip, terminalPosition } from "./visual-wires.js";

// Solid bodies from the imported CAD models. Leads may enter holes; connection
// guides and decorative targets must not extend the footprint that supports a part.
const bodies = {
  led: "Funda",
  button: "button-6",
  resistor: "Resistor-body",
  pot: "pot-0",
  servo: "servo-2",
  sensor: "HC-SR04",
  uno: "arduino-unostep",
};

export function mountPoint(item) {
  return item.type === "led"
    ? leadTip(item, "Ânodo +")
    : item.type === "button"
      ? leadTip(item, "1")
      : item.type === "resistor"
        ? terminalPosition(item, "1")
        : null;
}
export function placeComponent(item, items, snap = true) {
  if (item.type === "board") {
    // Moving the supporting surface under a loose part also changes its height.
    for (const other of items)
      if (bodies[other.type]) placeComponent(other, items, false);
    return;
  }
  if (!bodies[item.type]) return;
  item.mountedTo = null;
  item.group.position.y = 0;
  item.group.updateWorldMatrix(true, true);
  const physicalBody =
    item.group.getObjectByName(bodies[item.type]) ?? item.group;
  const footprint = new T.Box3().setFromObject(physicalBody);
  const board = items.find((candidate) => {
    if (candidate.type !== "board") return false;
    candidate.group.updateWorldMatrix(true, true);
    const local = footprint
      .clone()
      .applyMatrix4(candidate.group.matrixWorld.clone().invert());
    const layout = breadboardLayout(candidate.columns);
    return (
      local.max.x > -layout.width / 2 &&
      local.min.x < layout.width / 2 &&
      local.max.z > -layout.depth / 2 &&
      local.min.z < layout.depth / 2
    );
  });
  if (!board) return;
  const anchor = board.group.worldToLocal(terminalPosition(board, "a1"));
  const surfaceY = board.group.localToWorld(anchor.clone()).y;
  const holeMounted = ["led", "resistor", "button"].includes(item.type);
  if (!holeMounted) {
    // Rest the casing on the surface without pretending its pins fit the holes.
    item.group.position.y += surfaceY + 0.015 - footprint.min.y;
    item.group.updateWorldMatrix(true, true);
    item.mountedTo = board;
    return;
  }
  const reference = mountPoint(item) ?? item.group.position.clone();
  const local = board.group.worldToLocal(reference.clone());
  const pitch = BREADBOARD.pitch * BREADBOARD.sceneScale;
  const column = T.MathUtils.clamp(
    Math.round((local.x - anchor.x) / pitch),
    0,
    board.columns - 1,
  );
  const x = anchor.x + column * pitch;
  const side = local.z < 0 ? -1 : 1;
  const rows = Array.from(
    { length: BREADBOARD.rowsPerSide },
    (_, row) =>
      side *
      (BREADBOARD.outerRowZ - row * BREADBOARD.pitch) *
      BREADBOARD.sceneScale,
  );
  const z = rows.reduce((a, b) =>
    Math.abs(a - local.z) < Math.abs(b - local.z) ? a : b,
  );
  const center = board.group.worldToLocal(
    item.group.getWorldPosition(new T.Vector3()),
  );
  const layout = breadboardLayout(board.columns);
  const snapToHole =
    snap && Math.abs(center.x) < layout.width / 2 && Math.abs(center.z) < 0.7;
  const target = board.group.localToWorld(
    new T.Vector3(snapToHole ? x : local.x, anchor.y, snapToHole ? z : local.z),
  );
  target.y -= 0.055;
  item.group.position.add(target.sub(reference));
  // CAD lead lengths differ: inserting a lead must never bury the solid casing.
  item.group.position.y = Math.max(
    item.group.position.y,
    surfaceY + 0.015 - footprint.min.y,
  );
  item.group.updateWorldMatrix(true, true);
  item.mountedTo = board;
}
