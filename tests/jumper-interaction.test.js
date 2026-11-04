import test from "node:test";
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
