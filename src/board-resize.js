import { Box3, Plane, Raycaster, Vector2, Vector3 } from "three";
import { createBoardResize } from "./board-resize-model.js";

export function setupBoardResize({
  host,
  canvas,
  camera,
  controls,
  navigation,
  items,
  wires,
  getSelected,
  isBusy = () => false,
  onChange = () => {},
  getMountPoint,
  onStart = () => {},
}) {
  const overlay = document.createElement("div");
  overlay.className = "board-resize";
  overlay.hidden = true;
  const hint = document.createElement("span");
  hint.className = "board-resize-hint";
  hint.textContent =
    "Arraste as extremidades para mudar os furos · Esc cancela";
  overlay.append(hint);
  host.append(overlay);
  const bounds = new Box3();
  const ray = new Raycaster();
  const pointer = new Vector2();
  let gesture = null;

  function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
    ray.setFromCamera(pointer, camera);
    return ray.ray.intersectPlane(gesture.plane, new Vector3());
  }

  function move(event) {
    if (document.fullscreenElement !== gesture.fullscreenElement) {
      finish(true);
      return;
    }
    const point = pointerPoint(event);
    if (!point) return;
    gesture.resize.move(point.sub(gesture.offset));
    onChange();
    update();
  }

  function finish(cancel = false) {
    if (!gesture) return;
    const current = gesture;
    gesture = null;
    if (cancel) current.resize.cancel();
    controls.enabled = current.controlsEnabled;
    navigation.reset();
    host.classList.remove("resizing-board");
    if (current.handle.hasPointerCapture(current.id))
      current.handle.releasePointerCapture(current.id);
    onChange();
    update();
  }

  const corners = [
    { x: -1, z: 0, name: "esquerda" },
    { x: 1, z: 0, name: "direita" },
  ].map((corner) => {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "board-resize-handle";
    handle.dataset.corner = `${corner.x},${corner.z}`;
    handle.setAttribute(
      "aria-label",
      `Redimensionar protoboard pela extremidade ${corner.name}`,
    );
    handle.title = "Arraste para adicionar ou retirar colunas de furos";
    overlay.append(handle);
    handle.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      if (event.button !== 0 || gesture || isBusy()) return;
      const board = getSelected();
      if (board?.type !== "board" || !items.includes(board)) return;
      event.preventDefault();
      onStart();
      bounds.setFromObject(board.group);
      const resize = createBoardResize(
        board,
        corner,
        items,
        getMountPoint,
        wires,
      );
      if (!resize) return;
      gesture = {
        id: event.pointerId,
        board,
        resize,
        handle,
        controlsEnabled: controls.enabled,
        fullscreenElement: document.fullscreenElement,
        plane: new Plane(new Vector3(0, 1, 0), -bounds.max.y),
        offset: new Vector3(),
      };
      const point = pointerPoint(event);
      if (!point) {
        gesture = null;
        return;
      }
      gesture.offset.copy(point).sub(resize.corner);
      gesture.offset.y = 0;
      navigation.reset();
      controls.enabled = false;
      handle.focus({ preventScroll: true });
      handle.setPointerCapture(event.pointerId);
      host.classList.add("resizing-board");
    });
    handle.addEventListener("pointermove", (event) => {
      event.stopPropagation();
      if (gesture?.id !== event.pointerId || gesture.handle !== handle) return;
      move(event);
    });
    handle.addEventListener("pointerup", (event) => {
      event.stopPropagation();
      if (gesture?.id !== event.pointerId || gesture.handle !== handle) return;
      move(event);
      finish();
    });
    for (const name of ["pointercancel", "lostpointercapture"])
      handle.addEventListener(name, (event) => {
        if (gesture?.id === event.pointerId && gesture.handle === handle)
          finish(true);
      });
    return { ...corner, handle };
  });

  function update() {
    const board = getSelected();
    if (
      gesture &&
      (board !== gesture.board || !items.includes(gesture.board))
    ) {
      finish(true);
      return;
    }
    overlay.hidden =
      board?.type !== "board" ||
      !items.includes(board) ||
      (!gesture && isBusy());
    if (overlay.hidden) return;
    bounds.setFromObject(board.group);
    const rect = canvas.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    let bottom = 0;
    let left = Infinity;
    let right = -Infinity;
    for (const corner of corners) {
      const projected = new Vector3(
        corner.x < 0 ? bounds.min.x : bounds.max.x,
        bounds.max.y,
        (bounds.min.z + bounds.max.z) / 2,
      ).project(camera);
      const x =
        rect.left - hostRect.left + ((projected.x + 1) * rect.width) / 2;
      const y = rect.top - hostRect.top + ((1 - projected.y) * rect.height) / 2;
      corner.handle.hidden = projected.z < -1 || projected.z > 1;
      corner.handle.style.left = `${x}px`;
      corner.handle.style.top = `${y}px`;
      bottom = Math.max(bottom, y);
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
    for (const x of [bounds.min.x, bounds.max.x])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new Vector3(x, bounds.max.y, z).project(camera);
        bottom = Math.max(
          bottom,
          rect.top - hostRect.top + ((1 - projected.y) * rect.height) / 2,
        );
      }
    hint.style.left = `${Math.max(0, Math.min(hostRect.width - 310, (left + right) / 2 - 155))}px`;
    hint.style.top = `${Math.min(hostRect.height - 28, bottom + 15)}px`;
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (!gesture) return;
      event.stopImmediatePropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        finish(true);
      }
    },
    true,
  );
  window.addEventListener("blur", () => finish(true));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) finish(true);
  });
  document.addEventListener("fullscreenchange", () => finish(true));
  return {
    update,
    cancel: () => finish(true),
    get active() {
      return !!gesture;
    },
  };
}
