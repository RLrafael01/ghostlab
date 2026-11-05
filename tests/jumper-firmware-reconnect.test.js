import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as T from "three";
import { JSDOM } from "jsdom";
import { createVisualWires, terminalPosition } from "../src/visual-wires.js";
import { setupJumperInteraction } from "../src/jumper-interaction.js";
import { placeComponent } from "../src/component-placement.js";
import { createElectricalView } from "../src/electrical-view.js";
import { UnoSimulation } from "../src/firmware/uno-simulation.js";
import { createBreadboard } from "../src/parametric-board.js";
import { ledModel } from "./helpers/led-model.js";

function part(id, type, pins) {
  const group = new T.Group();
  for (const [index, pin] of pins.entries()) {
    const mesh = new T.Mesh(
      new T.SphereGeometry(0.02),
      new T.MeshStandardMaterial(),
    );
    mesh.position.x = index * 0.2;
    mesh.userData.pinName = pin;
    group.add(mesh);
  }
  return { id, type, group };
}

for (const name of ["blink", "fade"]) {
  test(`${name}: disconnect yellow wire, attach to another hole, reconnect positive restores actual firmware response`, async () => {
    const dom = new JSDOM('<section id="status"></section>');
    const status = dom.window.document.querySelector("#status");
    const uno = part(1, "uno", ["D9", "GND"]);
    const resistor = part(2, "resistor", ["1", "2"]);
    const led = await ledModel();
    led.id = 3;
    const board = { id: 4, type: "board", columns: 63, group: new T.Group() };
    board.group.add(createBreadboard(63));
    const items = [uno, resistor, led, board];
    const scene = new T.Scene();
    scene.add(...items.map((i) => i.group));
    const wires = createVisualWires(scene);
    const source = wires.connect(uno, "D9", board, "Superior + 2", "red");
    wires.connect(board, "Superior + 8", resistor, "1", "red");
    const yellow = wires.connect(resistor, "2", led, "Ânodo +", "yellow");
    wires.connect(led, "Cátodo −", board, "Superior − 8", "blue");
    wires.connect(board, "Superior − 3", uno, "GND", "black");
    const hex = JSON.parse(
      await readFile(
        new URL(`../public/firmware/${name}.json`, import.meta.url),
        "utf8",
      ),
    ).hex;
    const simulation = new UnoSimulation(hex);
    let firmware = { unoId: uno.id, ...simulation.advance(100) };
    const view = createElectricalView({
      items,
      wires,
      status,
      getFirmware: () => firmware,
    });
    const lens = led.group.getObjectByName("Funda");
    lens.userData.ledLens = true;
    const lit = () => {
      view.update();
      return /LED #3 · aceso/.test(status.textContent);
    };
    assert.equal(lit(), true, "initial firmware powers the closed circuit");
    for (const [wire, index, positive] of [
      [yellow, 1, { item: led, pin: "Ânodo +" }],
      [source, 1, { item: board, pin: "Superior + 2" }],
    ]) {
      const before = wires.connections();
      wires.begin(wire, index);
      wires.move(new T.Vector3(1, 1, 1));
      assert.equal(lit(), false, "disconnecting removes power");
      wires.finish({ item: board, pin: "a20" });
      assert.equal(
        lit(),
        false,
        "an unrelated contact leaves the circuit open",
      );
      wires.begin(wire, index);
      wires.finish(positive);
      assert.deepEqual(
        wires.connections(),
        before,
        "reconnect restores the exact electrical terminals",
      );
      assert.equal(
        lit(),
        true,
        "reconnecting restores power without restarting firmware",
      );
      if (name === "blink") {
        firmware = { unoId: 1, ...simulation.advance(1000) };
        assert.equal(lit(), false, "firmware still switches off");
        firmware = { unoId: 1, ...simulation.advance(1000) };
        assert.equal(lit(), true, "firmware still switches on");
      } else {
        const beforeBrightness = lens.material.emissiveIntensity;
        firmware = { unoId: 1, ...simulation.advance(300) };
        view.update();
        assert.ok(
          lens.material.emissiveIntensity > beforeBrightness,
          "PWM continues changing brightness",
        );
      }
    }
    dom.window.close();
  });
}

for (const [landing, pin, rotation] of [
  ["connector", "Ânodo +", 0],
  ["positive label", "Ânodo +", 0],
  ["negative label", "Cátodo −", 0],
  ["positive ring edge", "Ânodo +", 0],
  ["negative ring edge", "Cátodo −", Math.PI / 3],
  ["rotated positive label", "Ânodo +", Math.PI / 2],
  ["rotated negative label", "Cátodo −", Math.PI / 2],
]) {
  test(`pointer reconnect onto LED ${landing} restores firmware after another breadboard hole`, async () => {
    // Build CAD before installing a DOM: labels are irrelevant to picking contacts,
    // and JSDOM intentionally has no canvas rendering implementation.
    const boardModel = createBreadboard(63);
    const dom = new JSDOM(
      '<div id="host" tabindex="0"><canvas></canvas></div><section id="status"></section>',
    );
    const oldWindow = globalThis.window,
      oldDocument = globalThis.document,
      oldObserver = globalThis.ResizeObserver;
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.ResizeObserver = class {
      observe() {}
    };
    try {
      const host = document.querySelector("#host"),
        canvas = host.querySelector("canvas"),
        status = document.querySelector("#status");
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
      const scene = new T.Scene(),
        camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
      const uno = part(1, "uno", ["D9", "GND"]);
      uno.group.position.x = -3.8;
      const resistor = part(2, "resistor", ["1", "2"]);
      resistor.group.position.set(0.4, 0.5, -0.4);
      const led = await ledModel();
      led.id = 3;
      led.group.position.set(1.3, 0, -0.4);
      led.group.rotation.y = rotation;
      led.group.getObjectByName("Funda").userData.ledLens = true;
      const board = { id: 4, type: "board", columns: 63, group: new T.Group() };
      board.group.add(boardModel);
      board.group.position.x = 1.7;
      const items = [uno, board, led, resistor];
      scene.add(...items.map((i) => i.group));
      placeComponent(led, items);
      camera.position.set(1.3, 3, 3.6);
      camera.lookAt(1.3, 0.4, -0.4);
      camera.updateMatrixWorld();
      const wires = createVisualWires(scene);
      wires.connect(uno, "D9", resistor, "1", "red");
      const yellow = wires.connect(resistor, "2", led, "Ânodo +", "yellow");
      const ground = wires.connect(led, "Cátodo −", uno, "GND", "blue");
      const [wire, endIndex] = pin === "Ânodo +" ? [yellow, 1] : [ground, 0];
      const wireIndex = pin === "Ânodo +" ? 1 : 2;
      const hex = JSON.parse(
        await readFile(
          new URL("../public/firmware/blink.json", import.meta.url),
          "utf8",
        ),
      ).hex;
      const sim = new UnoSimulation(hex);
      let firmware = { unoId: 1, ...sim.advance(100) };
      const view = createElectricalView({
        items,
        wires,
        status,
        getFirmware: () => firmware,
      });
      setupJumperInteraction({
        host,
        canvas,
        scene,
        camera,
        wires,
        items,
        controls: { enabled: true },
        navigation: { reset() {} },
        onChange: () => view.update(),
      });
      const pointer = (type, position) => {
        const p = position.clone().project(camera);
        const event = new dom.window.Event(type, {
          bubbles: true,
          cancelable: true,
        });
        Object.assign(event, {
          button: 0,
          pointerId: 1,
          clientX: (p.x + 1) * 500,
          clientY: (1 - p.y) * 500,
        });
        canvas.dispatchEvent(event);
      };
      const settle = () => {
        wires.update(1 / 60, true);
        scene.updateMatrixWorld(true);
        view.update();
      };
      settle();
      assert.match(status.textContent, /LED #3 · aceso/);
      let target = terminalPosition(led, pin);
      if (landing.includes("label")) {
        const symbol = led.group.children.find(
          (object) =>
            object.userData.pinName === pin &&
            object.geometry?.type === "BoxGeometry",
        );
        target = symbol.getWorldPosition(new T.Vector3());
      } else if (landing.includes("ring edge")) {
        const ring = led.group.children.find(
          (object) =>
            object.userData.pinName === pin &&
            object.geometry?.type === "TorusGeometry",
        );
        // Pick the visible outer tube, away from the canonical central point.
        target = ring.localToWorld(new T.Vector3(0.075, 0, 0.012));
      }
      for (let round = 0; round < 2; round++) {
        pointer("pointerdown", wire.handles[endIndex].position);
        assert(wires.active);
        const hole = terminalPosition(board, "a20");
        pointer("pointermove", hole);
        pointer("pointerup", hole);
        settle();
        assert.equal(wires.connections()[wireIndex].ends[endIndex].pin, "a20");
        assert.match(status.textContent, /LED #3 · apagado/);
        pointer("pointerdown", wire.handles[endIndex].position);
        assert(wires.active);
        pointer("pointermove", target);
        pointer("pointerup", target);
        settle();
        assert.deepEqual(wires.connections()[wireIndex].ends[endIndex], {
          componentId: 3,
          pin,
          occurrence: 0,
        });
        assert.match(status.textContent, /LED #3 · aceso/);
      }
      firmware = { unoId: 1, ...sim.advance(1000) };
      view.update();
      assert.match(
        status.textContent,
        /LED #3 · apagado/,
        "Blink keeps switching off after reconnect",
      );
      firmware = { unoId: 1, ...sim.advance(1000) };
      view.update();
      assert.match(
        status.textContent,
        /LED #3 · aceso/,
        "Blink keeps switching on without restarting",
      );
    } finally {
      globalThis.window = oldWindow;
      globalThis.document = oldDocument;
      globalThis.ResizeObserver = oldObserver;
      dom.window.close();
    }
  });
}
