import * as T from "three";
import { BREADBOARD, breadboardLayout } from "./breadboard-layout.js";
import { leadTip, terminalPosition } from "./visual-wires.js";

export function mountPoint(item) {
  return item.type === "led"
    ? leadTip(item, "Ânodo +")
    : item.type === "button"
      ? leadTip(item, "1")
      : terminalPosition(item, "1");
}
export function placeComponent(item, items, snap = true) {
  if (!["led", "resistor", "button"].includes(item.type)) return;
  item.mountedTo = null;
  item.group.position.y = 0;
  item.group.updateWorldMatrix(true, true);
  const physicalBody =
    item.type === "led"
      ? (item.group.getObjectByName("Funda") ?? item.group)
      : item.group;
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
  item.group.updateWorldMatrix(true, true);
  item.mountedTo = board;
}
