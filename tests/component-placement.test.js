import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { ledModel } from "./helpers/led-model.js";
import { createBreadboard } from "../src/parametric-board.js";
import { breadboardLayout } from "../src/breadboard-layout.js";
import { placeComponent } from "../src/component-placement.js";
import { createVisualWires, terminalPosition } from "../src/visual-wires.js";

function makeBoard(columns = 63) {
  const group = new T.Group();
  group.add(createBreadboard(columns));
  return { id: 2, type: "board", columns, group };
}

test("dragging a wired LED across the rails keeps its body above the board and its jumpers attached", async () => {
  const led = await ledModel(),
    board = makeBoard();
  const scene = new T.Scene();
  scene.add(led.group, board.group);
  const wires = createVisualWires(scene);
  const a = wires.connect(board, "a1", led, "Ânodo +", "red");
  const k = wires.connect(led, "Cátodo −", board, "a2", "blue");
  const references = wires.connections();
  for (const z of [-0.4, -0.65, -0.71, -0.95, -1.1, 0.71, 0.95, 1.1]) {
    led.group.position.z = z;
    placeComponent(led, [led, board]);
    wires.update(1 / 60, false);
    const body = new T.Box3().setFromObject(led.group.getObjectByName("Funda"));
    assert.ok(
      body.min.y >= 0.425 - 1e-6,
      `LED sinks at z=${z}: body bottom ${body.min.y}`,
    );
    assert.equal(led.mountedTo, board);
    assert.deepEqual(wires.connections(), references);
    assert.ok(
      a.handles[1].position.distanceTo(terminalPosition(led, "Ânodo +")) < 1e-6,
    );
    assert.ok(
      k.handles[0].position.distanceTo(terminalPosition(led, "Cátodo −")) <
        1e-6,
    );
  }
});

test("partially overhanging LEDs keep support at every edge, with snapping disabled too, and return to the bench only when clear", async () => {
  const led = await ledModel();
  for (const columns of [10, 63, 100]) {
    const board = makeBoard(columns);
    board.group.position.set(3, 0, -2);
    const { width, depth } = breadboardLayout(columns);
    for (const snap of [true, false]) {
      for (const [x, z] of [
        [width / 2 + 0.05, 0],
        [-width / 2 - 0.05, 0],
        [0, depth / 2 + 0.05],
        [0, -depth / 2 - 0.05],
        [width / 2 + 0.05, depth / 2 + 0.05],
      ]) {
        led.group.position.set(3 + x, 0, -2 + z);
        placeComponent(led, [led, board], snap);
        assert.ok(
          led.mountedTo === board,
          `${columns} columns: losing support at ${x},${z}`,
        );
        assert.ok(
          new T.Box3().setFromObject(led.group.getObjectByName("Funda")).min
            .y >= 0.425,
        );
        assert.ok(Math.abs(led.group.position.x - (3 + x)) < 1e-6);
        assert.ok(Math.abs(led.group.position.z - (-2 + z)) < 1e-6);
      }
      led.group.position.set(3, 0, -2 + depth / 2 + 0.3);
      placeComponent(led, [led, board], snap);
      assert.equal(led.mountedTo, null);
      assert.equal(
        led.group.position.y,
        0,
        "LED returns to bench when its body no longer overlaps the board",
      );
      led.group.position.set(3 + width / 2 + 0.2, 0, -2);
      placeComponent(led, [led, board], snap);
      assert.equal(
        led.mountedTo,
        null,
        "lateral connection guides do not count as physical support",
      );
      led.group.position.x = 3;
      led.group.position.z = -2 + 0.9;
      placeComponent(led, [led, board], snap);
      assert.equal(
        led.mountedTo,
        board,
        "moving back onto a rail restores support",
      );
      assert.ok(
        new T.Box3().setFromObject(led.group.getObjectByName("Funda")).min.y >=
          0.425,
      );
    }
  }
});
