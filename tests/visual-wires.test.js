import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createVisualWires } from "../src/visual-wires.js";

function part(x, name) {
  const group = new T.Group();
  const terminals = new T.InstancedMesh(
    new T.SphereGeometry(0.01),
    new T.MeshBasicMaterial(),
    1,
  );
  terminals.userData.pinNames = [name];
  terminals.setMatrixAt(0, new T.Matrix4().makeTranslation(0.1, 0.2, 0.3));
  group.add(terminals);
  group.position.x = x;
  return { group };
}
function endCenter(mesh, end) {
  const positions = mesh.geometry.attributes.position;
  const start = end ? positions.count - 9 : 0;
  const point = new T.Vector3();
  for (let i = 0; i < 8; i++)
    point.add(new T.Vector3().fromBufferAttribute(positions, start + i));
  return point.divideScalar(8);
}
test("jumpers stay attached to both terminals when a part is translated and rotated", () => {
  const scene = new T.Scene();
  const a = part(-2, "5V"),
    b = part(2, "rail");
  scene.add(a.group, b.group);
  const wires = createVisualWires(scene);
  wires.connect(a, "5V", b, "rail", "#ff0000");
  wires.update();
  const cable = scene.children.find((o) => o.isMesh);
  assert.ok(
    endCenter(cable, false).distanceTo(new T.Vector3(-1.9, 0.2, 0.3)) < 1e-5,
  );
  b.group.position.set(3, 0.5, 1);
  b.group.rotation.y = Math.PI / 2;
  wires.update();
  assert.ok(
    endCenter(cable, true).distanceTo(new T.Vector3(3.3, 0.7, 0.9)) < 1e-5,
  );
  wires.removeFor(a);
  assert.equal(scene.children.includes(cable), false);
  assert.equal(scene.children.includes(b.group), true);
});
test("an unresolved terminal hides a wire instead of drawing a fictitious connection", () => {
  const scene = new T.Scene();
  const a = part(0, "5V"),
    b = part(2, "rail");
  const wires = createVisualWires(scene);
  wires.connect(a, "absent", b, "rail", "#ff0000");
  wires.update();
  assert.equal(scene.children[0].visible, false);
});

test("a jumper end can reconnect without moving its opposite end; Escape restores a loose end", () => {
  const scene = new T.Scene();
  const uno = part(-2, "5V"),
    board = part(2, "a1"),
    other = part(4, "GND");
  uno.id = 1;
  board.id = 2;
  other.id = 3;
  const wires = createVisualWires(scene);
  const wire = wires.connect(uno, "5V", board, "a1", "red");
  wires.begin(wire, 0);
  wires.move(new T.Vector3(0, 1, 0));
  wires.finish({ item: other, pin: "GND" });
  assert.deepEqual(
    wires.snapshot()[0].ends.map(({ componentId, pin }) => [componentId, pin]),
    [
      [3, "GND"],
      [2, "a1"],
    ],
  );
  wires.begin(wire, 0);
  wires.move(new T.Vector3(1, 0.2, 3));
  wires.finish();
  assert.equal(wires.snapshot()[0].ends[0].componentId, null);
  wires.begin(wire, 0);
  wires.move(new T.Vector3(9, 1, 9));
  wires.cancel();
  assert.deepEqual(wires.snapshot()[0].ends[0].position, [1, 0.2, 3]);
  assert.equal(wires.snapshot()[0].ends[1].componentId, 2);
});

test("cancel restores the original terminal and removing a part cleans up a half-connected cable", () => {
  const scene = new T.Scene();
  const a = part(-2, "5V"),
    b = part(2, "a1");
  a.id = 1;
  b.id = 2;
  const wires = createVisualWires(scene);
  const wire = wires.connect(a, "5V", b, "a1", "red");
  wires.begin(wire, 0);
  wires.move(new T.Vector3(0, 1, 2));
  wires.cancel();
  assert.equal(wires.snapshot()[0].ends[0].pin, "5V");
  assert.equal(wires.snapshot()[0].ends[0].componentId, 1);
  wires.begin(wire, 0);
  wires.move(new T.Vector3(0, 1, 2));
  wires.finish();
  wires.removeFor(b);
  assert.deepEqual(wires.snapshot(), []);
  assert.equal(wires.handles.children.length, 0);
});

test("reduced motion attaches immediately; normal motion settles at the new terminal", () => {
  const scene = new T.Scene();
  const a = part(-2, "5V"),
    b = part(2, "a1");
  const wires = createVisualWires(scene);
  const wire = wires.connect(a, "5V", b, "a1", "red");
  wires.update();
  wires.begin(wire, 0);
  wires.move(new T.Vector3(1, 1, 1));
  wires.update(0.01, false);
  assert.ok(
    wire.handles[0].position.y > 0.2 && wire.handles[0].position.y < 1.25,
  );
  wires.finish({ item: b, pin: "a1" });
  wires.update(0.01, true);
  assert.ok(
    wire.handles[0].position.distanceTo(new T.Vector3(2.1, 0.2, 0.3)) < 1e-6,
  );
});
