import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { jumperPlacementPoint } from "../src/jumper-placement.js";
import { createVisualWires } from "../src/visual-wires.js";

test("dropping a jumper above the breadboard slot supports both ends above the board", () => {
  const group = new T.Group();
  for (const z of [-0.6, 0.6]) {
    const side = new T.Mesh(
      new T.BoxGeometry(6, 0.6, 0.7),
      new T.MeshBasicMaterial(),
    );
    side.position.set(0, 0.3, z);
    group.add(side);
  }
  group.position.set(2, 0.2, 1);
  const origin = new T.Vector3(2, 8, 5);
  const target = new T.Vector3(2, 0.8, 1);
  const ray = new T.Raycaster(origin, target.clone().sub(origin).normalize());
  const drop = jumperPlacementPoint(ray, [{ type: "board", group }]);
  assert.ok(drop.distanceTo(target) < 1e-6);
  const wires = createVisualWires(new T.Scene());
  wires.addLoose(drop);
  assert.ok(wires.snapshot()[0].ends.every((end) => end.position[1] > 0.8));
  ray.set(new T.Vector3(10, 8, 1), new T.Vector3(0, -1, 0));
  assert.equal(jumperPlacementPoint(ray, [{ type: "board", group }]).y, 0);
});
