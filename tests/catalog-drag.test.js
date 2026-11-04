import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { makeCatalogDraggable } from "../src/workspace-panels.js";

function dockDrag(t) {
  const dom = new JSDOM(
    '<main><nav class="immersive-dock"><button>Fio jumper</button></nav></main>',
  );
  const saved = {
    window: globalThis.window,
    document: globalThis.document,
    AbortController: globalThis.AbortController,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.AbortController = dom.window.AbortController;
  t.after(() => {
    dom.window.close();
    Object.assign(globalThis, saved);
  });
  const card = document.querySelector("button");
  card.closest("nav").getBoundingClientRect = () => ({ top: 220 });
  card.setPointerCapture = () => {};
  card.hasPointerCapture = () => false;
  const swipes = [],
    drops = [],
    previews = [];
  let clicks = 0;
  makeCatalogDraggable(card, "wire", {
    swipe: (delta, done) => swipes.push([delta, done]),
    drop: (type) => drops.push(type),
    preview: (event, type) => {
      previews.push([!!event, type]);
      return true;
    },
  });
  card.addEventListener("click", () => clicks++);
  function pointer(type, x, y) {
    const event = new dom.window.Event(type, {
      bubbles: true,
      cancelable: true,
    });
    Object.assign(event, { button: 0, pointerId: 1, clientX: x, clientY: y });
    card.dispatchEvent(event);
  }
  return {
    card,
    pointer,
    swipes,
    drops,
    previews,
    clicks: () => clicks,
    ghost: () => document.querySelector(".catalog-drag-ghost"),
  };
}

test("dock drag can leave an initial horizontal swipe and place above the dock once", (t) => {
  const drag = dockDrag(t);
  drag.pointer("pointerdown", 100, 300);
  drag.pointer("pointermove", 112, 299);
  drag.pointer("pointermove", 130, 100);
  assert.ok(drag.ghost(), "upward movement out of the dock starts placement");
  assert.deepEqual(
    drag.swipes,
    [
      [12, false],
      [0, true],
    ],
    "restore the carousel before placing",
  );
  drag.pointer("pointerup", 130, 100);
  drag.card.click();
  assert.deepEqual(drag.drops, ["wire"]);
  assert.equal(
    drag.clicks(),
    0,
    "pointer release does not add a second component",
  );
  assert.equal(drag.ghost(), null);
  assert.deepEqual(drag.previews, [
    [true, "wire"],
    [false, "wire"],
  ]);
});

test("horizontal dock motion remains a swipe while the pointer is inside the dock", (t) => {
  const drag = dockDrag(t);
  drag.pointer("pointerdown", 100, 300);
  drag.pointer("pointermove", 112, 299);
  drag.pointer("pointermove", 130, 240);
  drag.pointer("pointerup", 130, 240);
  assert.equal(drag.ghost(), null);
  assert.deepEqual(drag.drops, []);
  assert.deepEqual(drag.swipes.at(-1), [30, true]);
});

test("canceling a promoted dock drag removes its ghost without adding a jumper", (t) => {
  const drag = dockDrag(t);
  drag.pointer("pointerdown", 100, 300);
  drag.pointer("pointermove", 112, 299);
  drag.pointer("pointermove", 130, 100);
  assert.ok(drag.ghost());
  drag.pointer("pointercancel", 130, 100);
  assert.equal(drag.ghost(), null);
  assert.deepEqual(drag.drops, []);
  assert.deepEqual(drag.swipes.at(-1), [0, true]);
});
