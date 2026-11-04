import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createBoardResize } from "../src/board-resize-model.js";
import { createVisualWires, terminalPosition } from "../src/visual-wires.js";

function makeBoard() {
  const group = new T.Group();
  const body = new T.Mesh(
    new T.BoxGeometry(6, 0.6, 2),
    new T.MeshBasicMaterial(),
  );
  body.position.y = 0.3;
  const pin = new T.Mesh(new T.SphereGeometry(0.01), new T.MeshBasicMaterial());
  pin.position.set(1, 0.5, 0.4);
  pin.userData.pinName = "a1";
  group.add(body, pin);
  group.position.set(3, 0.2, -1);
  return { id: 1, type: "board", group };
}
function close(actual, expected) {
  assert.ok(
    actual.distanceTo(expected) < 1e-6,
    `${actual.toArray()} != ${expected.toArray()}`,
  );
}
function atScale(transaction, scale) {
  return transaction.corner
    .clone()
    .sub(transaction.anchor)
    .multiplyScalar(scale)
    .add(transaction.anchor);
}

test("board resize keeps opposite corner and bottom fixed, with bounded proportional scale", () => {
  const board = makeBoard();
  const originalBounds = new T.Box3().setFromObject(board.group);
  const resize = createBoardResize(board, { x: 1, z: 1 }, [], () => null);
  resize.move(atScale(resize, 1.5));
  close(board.group.scale, new T.Vector3(1.5, 1.5, 1.5));
  const enlargedBounds = new T.Box3().setFromObject(board.group);
  close(enlargedBounds.min, originalBounds.min);
  resize.move(atScale(resize, 5));
  assert.equal(board.group.scale.x, 2);
  resize.move(atScale(resize, -2));
  assert.equal(board.group.scale.x, 0.5);
  close(new T.Box3().setFromObject(board.group).min, originalBounds.min);
  resize.cancel();
  close(board.group.scale, new T.Vector3(1, 1, 1));
  close(board.group.position, new T.Vector3(3, 0.2, -1));
});

test("resizing from a smaller board uses absolute limits and preserves the opposite max corner", () => {
  const board = makeBoard();
  board.group.scale.setScalar(0.6);
  const before = new T.Box3().setFromObject(board.group);
  const resize = createBoardResize(board, { x: -1, z: -1 }, [], () => null);
  resize.move(atScale(resize, 2));
  assert.equal(board.group.scale.x, 1.2);
  const after = new T.Box3().setFromObject(board.group);
  assert.ok(Math.abs(after.max.x - before.max.x) < 1e-6);
  assert.ok(Math.abs(after.max.z - before.max.z) < 1e-6);
  assert.ok(Math.abs(after.min.y - before.min.y) < 1e-6);
});

test("mounted component lead and attached jumper follow their original board contacts without scaling the component", () => {
  const scene = new T.Scene();
  const board = makeBoard();
  const childGroup = new T.Group();
  const lead = new T.Mesh(
    new T.SphereGeometry(0.02),
    new T.MeshBasicMaterial(),
  );
  lead.userData.pinName = "lead";
  lead.position.set(0.1, -0.3, 0.1);
  childGroup.add(lead);
  const child = { id: 2, group: childGroup, mountedTo: board };
  scene.add(board.group, childGroup);
  const contact = terminalPosition(board, "a1");
  childGroup.position.copy(contact).sub(lead.position);
  const originalChildPosition = childGroup.position.clone();
  const wires = createVisualWires(scene);
  const wire = wires.connect(board, "a1", child, "lead", "red");
  const resize = createBoardResize(
    board,
    { x: 1, z: -1 },
    [board, child],
    (item) => terminalPosition(item, "lead"),
  );
  resize.move(atScale(resize, 1.7));
  wires.update(1 / 60, false);
  const movedContact = terminalPosition(board, "a1");
  close(terminalPosition(child, "lead"), movedContact);
  close(childGroup.scale, new T.Vector3(1, 1, 1));
  close(wire.handles[0].position, movedContact);
  close(wire.handles[1].position, movedContact);
  resize.cancel();
  close(childGroup.position, originalChildPosition);
  close(terminalPosition(board, "a1"), contact);
});
