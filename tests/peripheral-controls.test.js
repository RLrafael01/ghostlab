import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import * as T from "three";
import {
  mountPeripheralInspector,
  setupScenePeripheralControls,
} from "../src/peripheral-controls.js";

test("holding the button with keyboard releases on keyup, focus loss and cleanup", () => {
  const dom = new JSDOM("<section></section>");
  const container = dom.window.document.querySelector("section");
  const item = { id: 1, type: "button", pressed: false };
  const ui = mountPeripheralInspector(container, item, () => {});
  const button = container.querySelector("button");
  button.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(item.pressed, true);
  assert.equal(button.getAttribute("aria-pressed"), "true");
  button.dispatchEvent(
    new dom.window.KeyboardEvent("keyup", { key: " ", bubbles: true }),
  );
  assert.equal(item.pressed, false);
  button.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  dom.window.dispatchEvent(new dom.window.Event("blur"));
  assert.equal(item.pressed, false);
  button.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  ui.dispose();
  assert.equal(item.pressed, false);
  dom.window.close();
});

test("scene controls press the cap and rotate the shaft without moving their components, then release on cancellation", () => {
  const dom = new JSDOM('<div tabindex="0"><canvas></canvas></div>');
  const host = dom.window.document.querySelector("div"),
    canvas = host.querySelector("canvas");
  canvas.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 400,
    height: 400,
  });
  canvas.setPointerCapture = () => {};
  canvas.hasPointerCapture = () => false;
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 3, 4);
  camera.lookAt(0, 0.5, 0);
  camera.updateMatrixWorld();
  const items = ["button", "pot"].map((type, i) => {
    const group = new T.Group();
    group.position.x = i ? 0.5 : -0.5;
    const cap = new T.Mesh(
      new T.BoxGeometry(0.3, 0.2, 0.3),
      new T.MeshBasicMaterial(),
    );
    cap.position.y = 0.5;
    cap.userData.peripheralControl = type;
    group.add(cap);
    group.updateMatrixWorld(true);
    const item = { id: i, type, value: 0.5, pressed: false, group };
    group.userData.item = item;
    return item;
  });
  const controls = { enabled: true };
  const ui = setupScenePeripheralControls({
    host,
    canvas,
    items,
    camera,
    controls,
    navigation: { reset() {} },
    onSelect() {},
    onChange() {},
  });
  const point = (item) => {
    const p = item.group.children[0]
      .getWorldPosition(new T.Vector3())
      .project(camera);
    return [(p.x + 1) * 200, (1 - p.y) * 200];
  };
  const send = (type, p, pointerId = 1) => {
    const e = new dom.window.Event(type, { bubbles: true, cancelable: true });
    Object.assign(e, { button: 0, clientX: p[0], clientY: p[1], pointerId });
    canvas.dispatchEvent(e);
  };
  send("pointerdown", point(items[0]));
  assert.equal(items[0].pressed, true);
  send("pointerup", point(items[0]), 2);
  assert.equal(
    items[0].pressed,
    true,
    "other pointer cannot release the button",
  );
  send("pointercancel", point(items[0]));
  assert.equal(items[0].pressed, false);
  assert.equal(controls.enabled, true);
  const start = point(items[1]);
  send("pointerdown", start);
  send("pointermove", [start[0] + 90, start[1]]);
  assert.equal(items[1].value, 1);
  assert.equal(items[1].group.position.x, 0.5);
  host.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert.equal(
    items[1].value,
    0.5,
    "Escape restores the starting potentiometer value",
  );
  assert.equal(controls.enabled, true);
  ui.dispose();
  dom.window.close();
});

test("potentiometer slider and numeric input share the project value, clamp limits and retain keyboard focus", () => {
  const dom = new JSDOM("<section></section>");
  const container = dom.window.document.querySelector("section");
  const item = { id: 2, type: "pot", value: 0.5 };
  const ui = mountPeripheralInspector(container, item, () => {});
  const range = container.querySelector('input[type="range"]');
  const number = container.querySelector('input[type="number"]');
  assert.ok(
    range && number,
    "both pointer and keyboard controls are available",
  );
  range.focus();
  range.value = "75";
  range.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(item.value, 0.75);
  assert.equal(number.value, "75");
  assert.equal(dom.window.document.activeElement, range);
  number.focus();
  number.value = "0";
  number.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  range.focus();
  ui.refresh();
  assert.equal(
    item.value,
    0,
    "typed edits survive losing focus and the next scene frame",
  );
  assert.equal(number.value, "0");
  number.value = "200";
  number.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(item.value, 1);
  assert.equal(number.value, "100");
  item.value = 0.25;
  ui.refresh();
  assert.equal(range.value, "25");
  ui.dispose();
  dom.window.close();
});
