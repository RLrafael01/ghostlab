import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { setupWorkspacePanels } from "../src/workspace-panels.js";

function workspace(t) {
  const dom = new JSDOM(
    `<main><div class="toolbar"><button id="fullscreen"></button></div><button id="code-toggle"></button><div class="editor" id="code-panel"><div class="editor-head"><b>sketch.ino</b><span>UNO · parado</span><button id="close-code">Recolher</button></div><div class="firmware-controls"><button>Executar</button></div><textarea aria-label="Código Arduino"></textarea></div><div class="immersive-dock"></div><button data-dock-action="code" class="dock-card" aria-current="true"></button></main>`,
  );
  const { document } = dom.window;
  globalThis.document = document;
  globalThis.CustomEvent = dom.window.CustomEvent;
  const captured = new Set();
  dom.window.HTMLElement.prototype.setPointerCapture = (id) => captured.add(id);
  dom.window.HTMLElement.prototype.hasPointerCapture = (id) => captured.has(id);
  dom.window.HTMLElement.prototype.releasePointerCapture = (id) =>
    captured.delete(id);
  Object.defineProperty(dom.window, "innerWidth", {
    value: 1440,
    writable: true,
  });
  Object.defineProperty(dom.window, "innerHeight", {
    value: 900,
    writable: true,
  });
  document.querySelector(".toolbar").getBoundingClientRect = () => ({
    bottom: 60,
  });
  document.querySelector(".immersive-dock").getBoundingClientRect = () => ({
    top: 670,
  });
  const shell = document.querySelector("main");
  shell.requestFullscreen = async () => {
    document.fullscreenElement = shell;
    document.dispatchEvent(new dom.window.Event("fullscreenchange"));
  };
  document.exitFullscreen = async () => {
    document.fullscreenElement = null;
    document.dispatchEvent(new dom.window.Event("fullscreenchange"));
  };
  setupWorkspacePanels();
  t.after(() => {
    dom.window.close();
    delete globalThis.document;
    delete globalThis.CustomEvent;
  });
  const editor = document.querySelector("#code-panel");
  const pointer = (target, type, x, y, id = 1) => {
    const event = new dom.window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: x,
      clientY: y,
    });
    Object.defineProperty(event, "pointerId", { value: id });
    target.dispatchEvent(event);
  };
  const rect = () =>
    Object.fromEntries(
      ["left", "top", "width", "height"].map((key) => [
        key,
        Number.parseFloat(editor.style[key]),
      ]),
    );
  return { document, window: dom.window, shell, editor, pointer, rect };
}

test("fullscreen code can be moved by its title bar without dragging the code or changing the normal layout", async (t) => {
  const { document, shell, editor, pointer, rect } = workspace(t);
  const title = editor.querySelector(".editor-head");
  const code = editor.querySelector("textarea");
  code.value = "delay(250);";
  pointer(title, "pointerdown", 400, 200);
  pointer(title, "pointermove", 520, 260);
  pointer(title, "pointerup", 520, 260);
  assert.equal(editor.style.left, "");
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  const before = rect();
  assert.ok(
    Number.isFinite(before.left),
    "fullscreen opens a positioned code window",
  );
  pointer(title, "pointerdown", 400, 200);
  pointer(title, "pointermove", 520, 260);
  pointer(title, "pointerup", 520, 260);
  assert.equal(rect().left, before.left + 120);
  assert.equal(rect().top, before.top + 60);
  const moved = rect();
  pointer(code, "pointerdown", 500, 350);
  pointer(code, "pointermove", 600, 450);
  pointer(code, "pointerup", 600, 450);
  assert.deepEqual(rect(), moved);
  await document.exitFullscreen();
  assert.equal(editor.hidden, false);
  assert.equal(editor.style.left, "");
  assert.equal(editor.style.height, "");
  assert.equal(code.value, "delay(250);");
});

test("code window resizes from corners and edges, keeps readable bounds, and remembers its geometry when reopened", async (t) => {
  const { document, window, shell, editor, pointer, rect } = workspace(t);
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  const corner = editor.querySelector(
    '[aria-label="Redimensionar código pelo canto inferior direito"]',
  );
  assert.ok(corner, "the window exposes a resize corner");
  const before = rect();
  pointer(corner, "pointerdown", 800, 600);
  pointer(corner, "pointermove", 920, 660);
  pointer(corner, "pointerup", 920, 660);
  assert.deepEqual(rect(), {
    ...before,
    width: before.width + 120,
    height: before.height + 60,
  });
  const leftEdge = editor.querySelector(
    '[aria-label="Redimensionar código pela borda esquerda"]',
  );
  const right = rect().left + rect().width;
  pointer(leftEdge, "pointerdown", 400, 400);
  pointer(leftEdge, "pointermove", 2400, 400);
  pointer(leftEdge, "pointerup", 2400, 400);
  assert.equal(rect().width, 420, "shrinking keeps a readable minimum width");
  assert.equal(
    rect().left + rect().width,
    right,
    "the opposite edge stays fixed",
  );
  const resized = rect();
  document.querySelector("#close-code").click();
  document.querySelector("#code-toggle").click();
  assert.deepEqual(rect(), resized);
  window.innerWidth = 640;
  window.innerHeight = 480;
  window.dispatchEvent(new window.Event("resize"));
  assert.ok(rect().left >= 0 && rect().top >= 0);
  assert.ok(rect().left + rect().width <= 640);
  assert.ok(rect().top + rect().height <= 480);
  await document.exitFullscreen();
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  assert.ok(rect().left + rect().width <= 640);
});

test("fullscreen window controls support keyboard movement, resizing and restoring the initial geometry", async (t) => {
  const { document, window, shell, editor, rect } = workspace(t);
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  const before = rect();
  const move = editor.querySelector('[aria-label="Mover janela de código"]');
  assert.ok(move, "keyboard users can focus the window movement control");
  const key = (target, key, shiftKey = false) =>
    target.dispatchEvent(
      new window.KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  key(move, "ArrowRight");
  key(move, "ArrowDown", true);
  assert.equal(rect().left, before.left + 10);
  assert.equal(rect().top, before.top + 40);
  const corner = editor.querySelector(
    '[aria-label="Redimensionar código pelo canto inferior direito"]',
  );
  key(corner, "ArrowRight", true);
  key(corner, "ArrowDown");
  assert.equal(rect().width, before.width + 40);
  assert.equal(rect().height, before.height + 10);
  editor.querySelector('[aria-label="Restaurar janela"]').click();
  assert.deepEqual(rect(), before);
});

test("window gestures ignore other pointers and roll back on Escape, cancellation, lost capture, blur and fullscreen exit", async (t) => {
  const { document, window, shell, editor, pointer, rect } = workspace(t);
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  const title = editor.querySelector(".editor-head");
  const before = rect();
  for (const cancel of [
    () =>
      document.dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    () => pointer(title, "pointercancel", 500, 300),
    () => pointer(title, "lostpointercapture", 500, 300),
    () => window.dispatchEvent(new window.Event("blur")),
  ]) {
    pointer(title, "pointerdown", 400, 200);
    pointer(title, "pointermove", 500, 300, 2);
    pointer(title, "pointerup", 500, 300, 2);
    assert.deepEqual(
      rect(),
      before,
      "another pointer cannot take over the gesture",
    );
    pointer(title, "pointermove", 500, 300);
    assert.notDeepEqual(rect(), before);
    cancel();
    assert.deepEqual(
      rect(),
      before,
      "cancellation restores the last committed geometry",
    );
    pointer(title, "pointermove", 600, 400);
    assert.deepEqual(
      rect(),
      before,
      "cancelled listeners cannot move the panel",
    );
  }
  pointer(title, "pointerdown", 400, 200);
  pointer(title, "pointermove", 500, 300);
  await document.exitFullscreen();
  assert.equal(editor.style.left, "");
  await shell.requestFullscreen();
  document.querySelector("#code-toggle").click();
  assert.deepEqual(rect(), before);
});
