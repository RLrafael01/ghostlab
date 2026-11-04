import test, { beforeEach, afterEach } from "node:test";
const originalResizeObserver = globalThis.ResizeObserver;
beforeEach(() => {
  globalThis.ResizeObserver = class {
    observe() {}
  };
});
afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import * as T from "three";
import { createVisualWires } from "../src/visual-wires.js";
import { setupJumperInteraction } from "../src/jumper-interaction.js";

test("only the owning pointer controls a jumper and Escape restores its terminal", () => {
  const dom = new JSDOM('<div id="host" tabindex="0"><canvas></canvas></div>');
  const previousWindow = globalThis.window,
    previousDocument = globalThis.document;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  try {
    const host = document.querySelector("#host"),
      canvas = host.querySelector("canvas");
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
    });
    canvas.setPointerCapture = () => {};
    canvas.hasPointerCapture = () => false;
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const group = new T.Group();
    const pin = new T.Mesh(
      new T.SphereGeometry(0.01),
      new T.MeshBasicMaterial(),
    );
    pin.userData.pinName = "A";
    group.add(pin);
    const item = { id: 1, type: "uno", group };
    scene.add(group);
    const wires = createVisualWires(scene);
    wires.connect(item, "A", item, "A", "red");
    wires.update();
    scene.updateMatrixWorld(true);
    let dragging = false,
      downstream = 0;
    const controls = { enabled: true };
    setupJumperInteraction({
      host,
      canvas,
      scene,
      camera,
      controls,
      navigation: { reset() {} },
      wires,
      items: [item],
      isComponentDragging: () => dragging,
    });
    canvas.addEventListener("pointerdown", () => downstream++, true);
    function pointer(type, id) {
      const event = new dom.window.Event(type, {
        bubbles: true,
        cancelable: true,
      });
      Object.assign(event, {
        button: 0,
        pointerId: id,
        clientX: 50,
        clientY: 50,
      });
      canvas.dispatchEvent(event);
    }
    pointer("pointerdown", 1);
    assert.equal(wires.active, true);
    assert.equal(controls.enabled, false);
    pointer("pointerdown", 2);
    assert.equal(downstream, 0);
    pointer("pointercancel", 2);
    pointer("lostpointercapture", 2);
    assert.equal(wires.active, true);
    host.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    assert.equal(wires.active, false);
    assert.equal(controls.enabled, true);
    assert.equal(wires.snapshot()[0].ends[0].pin, "A");
    assert.match(
      host.querySelector('[role="status"]').textContent,
      /restaurada/,
    );
    dragging = true;
    pointer("pointerdown", 3);
    assert.equal(wires.active, false);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    dom.window.close();
  }
});

test("dragged jumper follows board height and returns to bench height when detached", () => {
  const dom = new JSDOM('<div id="host" tabindex="0"><canvas></canvas></div>');
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  try {
    const host = document.querySelector("#host");
    const canvas = host.querySelector("canvas");
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 1000,
      width: 1000,
      height: 1000,
    });
    canvas.setPointerCapture = () => {};
    canvas.hasPointerCapture = () => false;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 10, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const group = new T.Group();
    const body = new T.Mesh(
      new T.BoxGeometry(2, 1, 2),
      new T.MeshBasicMaterial(),
    );
    body.position.y = 0.5;
    const pin = new T.Mesh(
      new T.SphereGeometry(0.01),
      new T.MeshBasicMaterial(),
    );
    pin.position.y = 1;
    pin.userData.pinName = "a1";
    group.add(body, pin);
    const board = { id: 1, type: "board", group };
    scene.add(group);
    const wires = createVisualWires(scene);
    const wire = wires.addLoose(new T.Vector3(-2, 0, 0));
    wires.update();
    scene.updateMatrixWorld(true);
    setupJumperInteraction({
      host,
      canvas,
      scene,
      camera,
      wires,
      items: [board],
      controls: { enabled: true },
      navigation: { reset() {} },
    });
    function pointer(type, position) {
      const projected = position.clone().project(camera);
      const event = new dom.window.Event(type, {
        bubbles: true,
        cancelable: true,
      });
      Object.assign(event, {
        button: 0,
        pointerId: 1,
        clientX: (projected.x + 1) * 500,
        clientY: (1 - projected.y) * 500,
      });
      canvas.dispatchEvent(event);
    }
    pointer("pointerdown", wire.handles[0].position);
    assert.equal(wires.active, true);
    pointer("pointermove", new T.Vector3(0.8, 1, 0));
    assert.ok(
      wires.snapshot()[0].ends[0].position[1] >= 1.1,
      "tip clears the board before connection",
    );
    wires.update(1 / 60, false);
    assert.ok(
      wire.handles[0].position.y > 1,
      "rendered tip clears the board in the same frame",
    );
    pointer("pointermove", new T.Vector3(0, 1, 0));
    pointer("pointerup", new T.Vector3(0, 1, 0));
    assert.equal(wires.snapshot()[0].ends[0].componentId, 1);
    assert.equal(wires.snapshot()[0].ends[0].pin, "a1");
    wires.update();
    scene.updateMatrixWorld(true);
    pointer("pointerdown", wire.handles[0].position);
    pointer("pointermove", new T.Vector3(3, 0.12, 0));
    pointer("pointerup", new T.Vector3(3, 0.12, 0));
    assert.equal(wires.snapshot()[0].ends[0].componentId, null);
    assert.ok(
      Math.abs(wires.snapshot()[0].ends[0].position[1] - 0.12) < 1e-6,
      "released tip rests on bench",
    );
    assert.deepEqual(wires.snapshot()[0].ends[1].position, [-1.2, 0.12, 0]);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    dom.window.close();
  }
});
