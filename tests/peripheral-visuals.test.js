import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { cadModel } from "./helpers/cad-model.js";
import { preparePeripheralVisual } from "../src/peripheral-visuals.js";

const bounds = (object) => new T.Box3().setFromObject(object);
const center = (object) => bounds(object).getCenter(new T.Vector3());

test("pressing the real button depresses its cap while contacts and supporting body stay fixed", async () => {
  const item = await cadModel("button");
  item.group.position.set(2, 0.7, -1);
  item.group.rotation.y = 0.6;
  item.group.updateWorldMatrix(true, true);
  const cap = item.group.getObjectByName("button-4");
  const resting = center(cap);
  const body = bounds(item.group.getObjectByName("button-6"));
  const pins = ["Pin_A", "Pin_A_1", "Pin_B", "Pin_B_1"].map((name) => [
    name,
    bounds(item.group.getObjectByName(name)),
  ]);
  const visual = preparePeripheralVisual(item);
  assert.equal(cap.userData.peripheralControl, "button");
  item.pressed = true;
  visual.update(0.1);
  assert.ok(Math.abs(center(cap).y - (resting.y - 0.03)) < 1e-7);
  assert.ok(bounds(item.group.getObjectByName("button-6")).equals(body));
  for (const [name, original] of pins)
    assert.ok(bounds(item.group.getObjectByName(name)).equals(original));
  item.pressed = false;
  visual.update(0.1);
  assert.ok(center(cap).distanceTo(resting) < 1e-7);
});

test("potentiometer shaft and visible pointer turn through 270 degrees without moving its pins or base", async () => {
  const item = await cadModel("pot");
  item.value = 0.5;
  const shaft = item.group.getObjectByName("pot-2");
  const axis = center(shaft);
  const fixed = ["pot-0", "pot-1", "pot-4", "pot-5", "pot-6"].map((name) => [
    name,
    bounds(item.group.getObjectByName(name)),
  ]);
  const visual = preparePeripheralVisual(item);
  const pointer = item.group.getObjectByName("pot-pointer");
  assert.ok(
    pointer?.isMesh && pointer.visible,
    "a visible marker makes the otherwise round shaft readable",
  );
  assert.equal(shaft.userData.peripheralControl, "pot");
  assert.equal(pointer.userData.peripheralControl, "pot");
  const direction = () => center(pointer).sub(axis).setY(0).normalize();
  visual.update(0.1);
  const middle = direction();
  item.value = 0;
  visual.update(0.1);
  const minimum = direction();
  item.value = 1;
  visual.update(0.1);
  const maximum = direction();
  assert.ok(Math.abs((minimum.angleTo(middle) * 180) / Math.PI - 135) < 1e-5);
  assert.ok(Math.abs((maximum.angleTo(middle) * 180) / Math.PI - 135) < 1e-5);
  assert.ok(
    minimum.x > 0 && maximum.x < 0,
    "the endpoints lie on opposite sides of the shaft",
  );
  for (const [name, original] of fixed)
    assert.ok(bounds(item.group.getObjectByName(name)).equals(original), name);
});

test("servo horn moves at 300 degrees per second toward the circuit target and keeps its pose without a valid signal", async () => {
  const item = await cadModel("servo");
  const axis = center(item.group.getObjectByName("servo-0"));
  const fixed = ["servo-1", "servo-2", "servo-3", "servo-4", "servo-5"].map(
    (name) => [name, bounds(item.group.getObjectByName(name))],
  );
  const visual = preparePeripheralVisual(item);
  const horn = item.group.getObjectByName("servo-horn");
  assert.ok(horn?.isMesh && horn.visible);
  const direction = () => center(horn).sub(axis).setY(0).normalize();
  visual.update(0, { active: false, angle: null });
  const neutral = direction();
  visual.update(0.1, { active: true, angle: 180 });
  assert.ok(
    Math.abs((direction().angleTo(neutral) * 180) / Math.PI - 30) < 1e-5,
  );
  visual.update(0.2, { active: true, angle: 180 });
  assert.ok(
    Math.abs(direction().x + 1) < 1e-6,
    "180 degrees points back along the body",
  );
  visual.update(0.1, { active: true, angle: 0 });
  const interrupted = direction();
  visual.update(2, { active: false, angle: null });
  assert.ok(direction().distanceTo(interrupted) < 1e-7);
  visual.update(0.5, { active: true, angle: 0 });
  assert.ok(Math.abs(direction().x - 1) < 1e-6);
  for (const [name, original] of fixed)
    assert.ok(bounds(item.group.getObjectByName(name)).equals(original), name);
});
