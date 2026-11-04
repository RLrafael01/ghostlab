import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { createVisualWires } from "../src/visual-wires.js";
import { terminalPosition } from "../src/visual-wires.js";

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

test("a catalog jumper starts with two loose ends and can attach to a terminal", () => {
  const scene = new T.Scene();
  const wires = createVisualWires(scene);
  const wire = wires.addLoose(new T.Vector3(2, 0, 3));
  assert.equal(wires.snapshot().length, 1);
  assert.deepEqual(
    wires.snapshot()[0].ends.map((end) => end.componentId),
    [null, null],
  );
  wires.update();
  assert.equal(wire.mesh.visible, true);
  const board = part(4, "a1");
  board.id = 10;
  wires.begin(wire, 0);
  wires.finish({ item: board, pin: "a1" });
  assert.equal(wires.snapshot()[0].ends[0].componentId, 10);
  assert.equal(wires.snapshot()[0].ends[1].componentId, null);
  wires.remove(wire.id);
  assert.equal(wires.snapshot().length, 0);
  assert.equal(wires.handles.children.length, 0);
});
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

test("drag follows the pointer immediately and a released loose end settles with animation", () => {
  const scene = new T.Scene();
  const a = part(-2, "5V"),
    b = part(2, "a1");
  const wires = createVisualWires(scene);
  const wire = wires.connect(a, "5V", b, "a1", "red");
  wires.update();
  wires.begin(wire, 0);
  wires.move(new T.Vector3(1, 1, 1));
  wires.update(0.01, false);
  assert.ok(Math.abs(wire.handles[0].position.y - 1.25) < 1e-6);
  wires.finish();
  wires.update(0.01, false);
  assert.ok(
    wire.handles[0].position.y > 1 && wire.handles[0].position.y < 1.25,
  );
  wires.begin(wire, 0);
  wires.finish({ item: b, pin: "a1" });
  wires.update(0.01, true);
  assert.ok(
    wire.handles[0].position.distanceTo(new T.Vector3(2.1, 0.2, 0.3)) < 1e-6,
  );
});

test("physically distinct GND contacts retain distinct endpoint references", () => {
  const scene = new T.Scene();
  const uno = part(-2, "unused"),
    board = part(2, "a1");
  uno.id = 1;
  board.id = 2;
  const pins = new T.InstancedMesh(
    new T.SphereGeometry(0.01),
    new T.MeshBasicMaterial(),
    3,
  );
  pins.userData.pinNames = ["GND", "GND", "GND"];
  for (let i = 0; i < 3; i++)
    pins.setMatrixAt(i, new T.Matrix4().makeTranslation(i, 0, 0));
  uno.group.add(pins);
  const wires = createVisualWires(scene);
  const wire = wires.connect(uno, "GND", board, "a1", "black");
  wires.begin(wire, 0);
  wires.finish({ item: uno, pin: "GND", occurrence: 2 });
  assert.equal(wires.snapshot()[0].ends[0].occurrence, 2);
  assert.deepEqual(wires.snapshot()[0].ends[0].position, [0, 0, 0]);
  assert.deepEqual(terminalPosition(uno, "GND", 1).toArray(), [-1, 0, 0]);
});

test("attached jumper follows a moving component in the same frame with animations enabled", () => {
  const wires = createVisualWires(new T.Scene());
  const a = part(0, "A"),
    b = part(3, "B");
  const wire = wires.connect(a, "A", b, "B", "red");
  wires.update(1 / 60, false);
  a.group.position.x = 2;
  wires.update(1 / 60, false);
  assert.ok(
    wire.handles[0].position.distanceTo(terminalPosition(a, "A")) < 1e-6,
  );
});

test("recoloring a jumper updates the cable and both connectors without changing endpoints", () => {
  const wires = createVisualWires(new T.Scene());
  const wire = wires.addLoose(new T.Vector3());
  const ends = wires.snapshot()[0].ends;
  wires.setColor(wire.id, "#0066ff");
  assert.equal(wires.snapshot()[0].color, "#0066ff");
  assert.deepEqual(wires.snapshot()[0].ends, ends);
  assert.equal(wire.mesh.material.color.getHexString(), "0066ff");
  for (const handle of wire.handles)
    assert.equal(handle.material.color.getHexString(), "0066ff");
});

test("jumper selection outlines only its connectors and preserves its material color", () => {
  const scene = new T.Scene();
  const wires = createVisualWires(scene);
  const wire = wires.addLoose(new T.Vector3(), "#dd2266");
  wires.update();
  wires.select(wire.id);
  assert.equal(wire.mesh.material.emissive.getHexString(), "000000");
  assert.equal(wires.snapshot()[0].color, "#dd2266");
  const outlines = scene.children.filter(
    (object) => object.name === "selection-outline",
  );
  assert.equal(outlines.filter((outline) => outline.visible).length, 2);
  wires.begin(wire, 0);
  wires.move(new T.Vector3(2, 1, 3));
  wires.update(1 / 60, false);
  assert.ok(
    wire.handles[0].position.distanceTo(new T.Vector3(2, 1.25, 3)) < 1e-6,
  );
  const center = new T.Box3()
    .setFromObject(outlines[0])
    .getCenter(new T.Vector3());
  assert.ok(center.distanceTo(wire.handles[0].position) < 1e-5);
  wires.cancel();
  wires.select(null);
  assert.equal(
    outlines.some((outline) => outline.visible),
    false,
  );
  wires.remove(wire.id);
  assert.equal(
    scene.children.some((object) => object.name === "selection-outline"),
    false,
  );
});
