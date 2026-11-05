import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { cadModel, cadBody } from "./helpers/cad-model.js";
import { createBreadboard } from "../src/parametric-board.js";
import { breadboardLayout } from "../src/breadboard-layout.js";
import { placeComponent, mountPoint } from "../src/component-placement.js";
import { createBoardResize } from "../src/board-resize-model.js";
import { terminalPosition } from "../src/visual-wires.js";

for (const type of ["button", "resistor", "pot", "servo", "sensor", "uno"]) {
  test(`${type} stays above the breadboard at its center, rails and edges, then returns to the bench`, async () => {
    const item = await cadModel(type);
    const board = { id: 2, type: "board", columns: 63, group: new T.Group() };
    board.group.add(createBreadboard(board.columns));
    board.group.position.set(1.7, 0, 0);
    const { width, depth } = breadboardLayout(board.columns);
    const benchBottom = cadBody(item).min.y;
    for (const snap of [true, false]) {
      for (const [x, z] of [
        [0, 0],
        [0, -0.95],
        [0, 0.95],
        [-width / 2, 0],
        [width / 2, 0],
        [0, -depth / 2],
        [0, depth / 2],
      ]) {
        item.group.position.set(board.group.position.x + x, 0, z);
        placeComponent(item, [item, board], snap);
        assert.ok(
          cadBody(item).min.y >= 0.425 - 1e-6,
          `${type} body sinks at ${x},${z} (snap=${snap}): bottom=${cadBody(item).min.y}, board top=0.425`,
        );
        assert.equal(item.mountedTo, board);
        // Repeated drag frames must not accumulate height.
        const previousHeight = item.group.position.y;
        placeComponent(item, [item, board], snap);
        assert.ok(Math.abs(item.group.position.y - previousHeight) < 1e-6);
      }
      item.group.position.x = 1.7 + width + 4;
      placeComponent(item, [item, board], snap);
      assert.equal(item.mountedTo, null);
      assert.ok(
        Math.abs(cadBody(item).min.y - benchBottom) < 1e-6,
        `${type} should return to its bench height after leaving the board`,
      );
    }
  });
}

test("moving the breadboard under a stationary component raises its casing and moving it away restores bench height", async () => {
  const servo = await cadModel("servo");
  const board = { id: 2, type: "board", columns: 63, group: new T.Group() };
  board.group.add(createBreadboard(board.columns));
  board.group.position.set(-10, 0, 0);
  const items = [board, servo];
  const benchBottom = cadBody(servo).min.y;
  placeComponent(board, items);
  assert.equal(servo.mountedTo, null);
  board.group.position.x = 0;
  placeComponent(board, items);
  assert.equal(servo.mountedTo, board);
  assert.ok(cadBody(servo).min.y >= 0.425);
  assert.equal(
    servo.group.position.x,
    0,
    "height correction must not move the stationary casing sideways",
  );
  board.group.position.x = -10;
  placeComponent(board, items);
  assert.equal(servo.mountedTo, null);
  assert.ok(Math.abs(cadBody(servo).min.y - benchBottom) < 1e-6);
});

test("growing beneath a loose casing supports it and cancel restores its original bench position", async () => {
  const servo = await cadModel("servo");
  const board = { id: 2, type: "board", columns: 30, group: new T.Group() };
  board.group.add(createBreadboard(board.columns));
  const items = [board, servo];
  servo.group.position.x = breadboardLayout(30).width / 2 + 1;
  placeComponent(servo, items, false);
  assert.equal(servo.mountedTo, null);
  const original = servo.group.position.clone();
  const resize = createBoardResize(board, { x: 1, z: 0 }, items, mountPoint);
  resize.move(
    resize.corner
      .clone()
      .add(new T.Vector3(20 * breadboardLayout(30).pitch, 0, 0)),
  );
  assert.equal(servo.mountedTo, board);
  assert.ok(cadBody(servo).min.y >= 0.425);
  assert.equal(servo.group.position.x, original.x);
  resize.cancel();
  assert.equal(servo.mountedTo, null);
  assert.ok(servo.group.position.distanceTo(original) < 1e-6);
});

test("button retains support on a partially removed column and gains support when the board grows beneath it", async () => {
  const button = await cadModel("button");
  const board = { id: 2, type: "board", columns: 63, group: new T.Group() };
  board.group.add(createBreadboard(board.columns));
  const items = [board, button];
  button.group.position.x = terminalPosition(board, "a60").x;
  placeComponent(button, items, false);
  const shrink = createBoardResize(board, { x: 1, z: 0 }, items, mountPoint);
  shrink.move(
    shrink.corner
      .clone()
      .add(new T.Vector3(-5 * breadboardLayout(63).pitch, 0, 0)),
  );
  assert.ok(
    cadBody(button).min.y >= 0.425,
    "partially supported button sank after shrinking",
  );
  assert.equal(button.mountedTo, board);
  shrink.move(
    shrink.corner
      .clone()
      .add(new T.Vector3(-33 * breadboardLayout(63).pitch, 0, 0)),
  );
  assert.equal(button.mountedTo, null);
  const grow = createBoardResize(board, { x: 1, z: 0 }, items, mountPoint);
  grow.move(
    grow.corner
      .clone()
      .add(new T.Vector3(33 * breadboardLayout(30).pitch, 0, 0)),
  );
  assert.ok(
    cadBody(button).min.y >= 0.425,
    "growing underneath the button buried it",
  );
  assert.equal(button.mountedTo, board);
  grow.cancel();
  assert.equal(button.mountedTo, null);
});

test("servo mounting ears also preserve support until the entire casing clears the board", async () => {
  const servo = await cadModel("servo");
  const board = { id: 2, type: "board", columns: 63, group: new T.Group() };
  board.group.add(createBreadboard(board.columns));
  servo.group.position.x = breadboardLayout(63).width / 2 + 0.55;
  placeComponent(servo, [board, servo], false);
  const ears = new T.Box3().setFromObject(
    servo.group.getObjectByName("servo-1"),
  );
  assert.ok(ears.min.y >= 0.425, "servo mounting ears intersect the rim");
  assert.equal(servo.mountedTo, board);
});

for (const direction of [-1, 1]) {
  test(`resizing from ${direction < 0 ? "left" : "right"} preserves a partially supported servo casing, clears it only when outside, and cancels atomically`, async () => {
    const servo = await cadModel("servo");
    const board = { id: 2, type: "board", columns: 63, group: new T.Group() };
    board.group.add(createBreadboard(board.columns));
    board.group.position.set(1.7, 0, 0);
    const items = [board, servo];
    const benchBottom = cadBody(servo).min.y;
    servo.group.position.x = terminalPosition(board, "a60").x;
    placeComponent(servo, items, false);
    assert.equal(servo.mountedTo, board);
    const original = servo.group.position.clone();
    const resize = createBoardResize(
      board,
      { x: direction, z: 0 },
      items,
      mountPoint,
    );
    const atColumns = (columns) =>
      resize.corner
        .clone()
        .add(
          new T.Vector3(
            (columns - 63) * breadboardLayout(63).pitch * direction,
            0,
            0,
          ),
        );
    // Column 60 disappears, but the servo's solid base still overlaps the rim.
    resize.move(atColumns(57));
    assert.ok(
      cadBody(servo).min.y >= 0.425,
      `servo casing sank during partial shrink: bottom=${cadBody(servo).min.y}`,
    );
    assert.equal(servo.mountedTo, board);
    assert.ok(
      cadBody(servo).min.x < new T.Box3().setFromObject(board.group).max.x,
    );
    resize.move(atColumns(50));
    assert.equal(servo.mountedTo, null);
    assert.ok(Math.abs(cadBody(servo).min.y - benchBottom) < 1e-6);
    assert.ok(
      cadBody(servo).min.x > new T.Box3().setFromObject(board.group).max.x,
    );
    resize.cancel();
    assert.equal(board.columns, 63);
    assert.equal(servo.mountedTo, board);
    assert.ok(servo.group.position.distanceTo(original) < 1e-6);
    assert.ok(cadBody(servo).min.y >= 0.425);
  });
}
