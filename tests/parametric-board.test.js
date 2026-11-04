import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { breadboardLayout } from "../src/breadboard-layout.js";
import {
  createBreadboard,
  replaceBreadboard,
} from "../src/parametric-board.js";
import { terminalPosition } from "../src/visual-wires.js";

function board(columns) {
  const group = new T.Group();
  group.add(createBreadboard(columns));
  return { id: 1, type: "board", columns, group };
}

test("breadboard rebuild changes contact count while maintaining physical pitch and opening size", () => {
  for (const columns of [10, 63, 126]) {
    const item = board(columns);
    const layout = breadboardLayout(columns);
    const a1 = terminalPosition(item, "a1");
    const a2 = terminalPosition(item, "a2");
    assert.ok(Math.abs(a1.distanceTo(a2) - 0.11303) < 1e-6);
    assert.equal(layout.holeSize, 0.048);
    assert.ok(terminalPosition(item, `j${columns}`));
    assert.equal(terminalPosition(item, `j${columns + 1}`), null);
    assert.equal(
      item.group.children[0].userData.contactCount,
      layout.contactCount,
    );
    assert.deepEqual(item.group.scale.toArray(), [1, 1, 1]);
  }
  assert.equal(breadboardLayout(63).contactCount, 830);
  assert.ok(breadboardLayout(126).contactCount > 830);
  assert.ok(breadboardLayout(10).contactCount < 830);
});

test("breadboard openings remain recessed after rebuilding and expose the contact below the plastic top", () => {
  const item = board(63);
  item.group.updateMatrixWorld(true);
  const meshes = [];
  item.group.traverse((object) => {
    if (
      object.isMesh &&
      !object.userData.pinNames &&
      !object.userData.surfaceDecal
    )
      meshes.push(object);
  });
  const pin = terminalPosition(item, "a1");
  const ray = new T.Raycaster(
    new T.Vector3(pin.x, 2, pin.z),
    new T.Vector3(0, -1, 0),
  );
  const inside = ray.intersectObjects(meshes, false)[0].point.y;
  assert.ok(inside < breadboardLayout(63).topY - 0.06);
  ray.set(new T.Vector3(pin.x + 0.04, 2, pin.z), new T.Vector3(0, -1, 0));
  const rim = ray.intersectObjects(meshes, false)[0].point.y;
  assert.ok(Math.abs(rim - breadboardLayout(63).topY) < 1e-6);
});

test("rebuilding preserves board identity and disposes the previous model", () => {
  const item = board(63);
  item.group.position.set(2, 0, 3);
  const identity = item.group;
  const previous = item.group.children[0];
  let disposed = 0;
  previous.children[0].geometry.addEventListener("dispose", () => disposed++);
  replaceBreadboard(item, 40);
  assert.equal(item.group, identity);
  assert.equal(item.columns, 40);
  assert.deepEqual(item.group.position.toArray(), [2, 0, 3]);
  assert.equal(disposed, 1);
  assert.equal(terminalPosition(item, "a63"), null);
  assert.ok(terminalPosition(item, "a40"));
});
