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
