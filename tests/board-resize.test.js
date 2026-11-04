import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createBoardResize } from "../src/board-resize-model.js";
import { createBreadboard } from "../src/parametric-board.js";
import { breadboardLayout } from "../src/breadboard-layout.js";
import { createVisualWires, terminalPosition } from "../src/visual-wires.js";

function makeBoard(columns = 63) {
  const group = new T.Group();
  group.add(createBreadboard(columns));
  group.position.set(3, 0, -1);
  return { id: 1, type: "board", columns, group };
}
function close(actual, expected) {
  assert.ok(
    actual.distanceTo(expected) < 1e-6,
    `${actual.toArray()} != ${expected.toArray()}`,
  );
}
function atColumns(transaction, original, columns, direction = 1) {
  return transaction.corner
    .clone()
    .add(
      new T.Vector3(
        (columns - original) * breadboardLayout(original).pitch * direction,
        0,
        0,
      ),
    );
}
function mountedPart(board, pin, id) {
  const group = new T.Group();
  const lead = new T.Mesh(
    new T.SphereGeometry(0.02),
    new T.MeshBasicMaterial(),
  );
  lead.userData.pinName = "lead";
  lead.position.set(0.1, -0.3, 0.1);
  group.add(lead);
  group.position.copy(terminalPosition(board, pin)).sub(lead.position);
  return { id, type: "led", group, mountedTo: board };
}

test("board grows and shrinks by columns with fixed hole pitch, base, width and opposite end", () => {
  const board = makeBoard();
  const before = new T.Box3().setFromObject(board.group);
  const originalPitch = terminalPosition(board, "a2").sub(
    terminalPosition(board, "a1"),
  );
  const first = terminalPosition(board, "a1");
  const resize = createBoardResize(board, { x: 1, z: 0 }, [], () => null);
  assert.equal(resize.move(atColumns(resize, 63, 80)), 80);
  assert.equal(board.columns, 80);
  close(board.group.scale, new T.Vector3(1, 1, 1));
  assert.ok(terminalPosition(board, "j80"));
  assert.equal(terminalPosition(board, "j81"), null);
  close(
    terminalPosition(board, "a2").sub(terminalPosition(board, "a1")),
    originalPitch,
  );
  close(terminalPosition(board, "a1"), first);
  const enlarged = new T.Box3().setFromObject(board.group);
  close(enlarged.min, before.min);
  assert.ok(Math.abs(enlarged.max.z - before.max.z) < 1e-6);
  assert.ok(Math.abs(enlarged.max.y - before.max.y) < 1e-6);
  resize.move(atColumns(resize, 63, 30));
  assert.equal(board.columns, 30);
  assert.equal(terminalPosition(board, "a31"), null);
  assert.ok(terminalPosition(board, "a30"));
  resize.move(atColumns(resize, 63, 1000));
  assert.equal(board.columns, 126);
  resize.move(atColumns(resize, 63, -10));
  assert.equal(board.columns, 10);
  resize.cancel();
  assert.equal(board.columns, 63);
  close(board.group.position, new T.Vector3(3, 0, -1));
});

test("left-end resizing keeps right edge and fixed-size contacts, with mounted pieces following their named columns", () => {
  const scene = new T.Scene();
  const board = makeBoard(30);
  const child = mountedPart(board, "a10", 2);
  scene.add(board.group, child.group);
  const before = new T.Box3().setFromObject(board.group);
  const resize = createBoardResize(
    board,
    { x: -1, z: 0 },
    [board, child],
    (item) => terminalPosition(item, "lead"),
  );
  resize.move(atColumns(resize, 30, 50, -1));
  const after = new T.Box3().setFromObject(board.group);
  assert.ok(Math.abs(after.max.x - before.max.x) < 1e-6);
  close(terminalPosition(child, "lead"), terminalPosition(board, "a10"));
  close(child.group.scale, new T.Vector3(1, 1, 1));
  assert.equal(child.mountedTo, board);
});

test("removing occupied columns frees pieces and wire tips, while regrowing or Escape restores the gesture's original contacts", () => {
  const scene = new T.Scene();
  const board = makeBoard();
  const retained = mountedPart(board, "a10", 2);
  const removed = mountedPart(board, "a60", 3);
  scene.add(board.group, retained.group, removed.group);
  const originalPosition = removed.group.position.clone();
  const wires = createVisualWires(scene);
  const wire = wires.connect(board, "a60", retained, "lead", "red");
  const resize = createBoardResize(
    board,
    { x: 1, z: 0 },
    [board, retained, removed],
    (item) => terminalPosition(item, "lead"),
    wires,
  );
  resize.move(atColumns(resize, 63, 30));
  assert.equal(retained.mountedTo, board);
  close(terminalPosition(retained, "lead"), terminalPosition(board, "a10"));
  assert.equal(removed.mountedTo, null);
  assert.equal(removed.group.position.y, 0);
  assert.ok(
    removed.group.position.x > new T.Box3().setFromObject(board.group).max.x,
  );
  const ends = wires.snapshot()[0].ends;
  assert.equal(ends[0].componentId, null);
  assert.equal(ends[1].componentId, retained.id);
  wires.update();
  assert.equal(wire.mesh.visible, true);
  resize.move(atColumns(resize, 63, 63));
  assert.equal(removed.mountedTo, board);
  assert.equal(wires.snapshot()[0].ends[0].pin, "a60");
  close(removed.group.position, originalPosition);
  resize.move(atColumns(resize, 63, 20));
  resize.cancel();
  assert.equal(board.columns, 63);
  assert.equal(removed.mountedTo, board);
  close(removed.group.position, originalPosition);
  assert.equal(wires.snapshot()[0].ends[0].componentId, board.id);
  assert.equal(wires.snapshot()[0].ends[0].pin, "a60");
});

test("growing after a completed shrink leaves previously removed wires and components disconnected", () => {
  const scene = new T.Scene();
  const board = makeBoard();
  const removed = mountedPart(board, "a60", 2);
  scene.add(board.group, removed.group);
  const wires = createVisualWires(scene);
  wires.connect(board, "a60", removed, "lead", "red");
  const shrink = createBoardResize(
    board,
    { x: -1, z: 0 },
    [board, removed],
    (item) => terminalPosition(item, "lead"),
    wires,
  );
  shrink.move(atColumns(shrink, 63, 30, -1));
  assert.equal(wires.snapshot()[0].ends[0].componentId, null);
  assert.equal(removed.mountedTo, null);
  const loosePosition = wires.snapshot()[0].ends[0].position;
  const componentPosition = removed.group.position.clone();
  const grow = createBoardResize(
    board,
    { x: -1, z: 0 },
    [board, removed],
    (item) => terminalPosition(item, "lead"),
    wires,
  );
  grow.move(atColumns(grow, 30, 63, -1));
  assert.ok(terminalPosition(board, "a60"));
  assert.equal(wires.snapshot()[0].ends[0].componentId, null);
  assert.deepEqual(wires.snapshot()[0].ends[0].position, loosePosition);
  assert.equal(removed.mountedTo, null);
  close(removed.group.position, componentPosition);
});
