import * as T from "three";
import { terminalPosition } from "./visual-wires.js";

export function setupJumperInteraction({
  host,
  canvas,
  scene,
  camera,
  controls,
  navigation,
  wires,
  items,
}) {
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  const plane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  const marker = new T.Mesh(
    new T.SphereGeometry(0.075, 12, 8),
    new T.MeshBasicMaterial({ color: "#86ffe0", depthTest: false }),
  );
  marker.visible = false;
  marker.renderOrder = 20;
  scene.add(marker);
  const status = document.createElement("div");
  status.className = "jumper-status";
  status.setAttribute("role", "status");
  status.textContent = "Cabos: arraste uma ponta colorida para outro contato";
  host.append(status);
  let gesture = null;
  function updateRay(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return rect;
  }
  function terminals() {
    return items.flatMap((item) => {
      const names = new Set();
      item.group.traverse((object) => {
        object.userData.pinNames?.forEach((name) => names.add(name));
        if (object.userData.pinName) names.add(object.userData.pinName);
      });
      return [...names]
        .map((pin) => ({ item, pin, position: terminalPosition(item, pin) }))
        .filter((terminal) => terminal.position);
    });
  }
  function targetAt(event, rect) {
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      return null;
    let nearest = null,
      distance = 14;
    for (const terminal of gesture.terminals) {
      if (!items.includes(terminal.item)) continue;
      const screen = terminal.position.clone().project(camera);
      if (screen.z < -1 || screen.z > 1) continue;
      const d = Math.hypot(
        rect.left + ((screen.x + 1) * rect.width) / 2 - event.clientX,
        rect.top + ((1 - screen.y) * rect.height) / 2 - event.clientY,
      );
      if (d < distance) {
        nearest = terminal;
        distance = d;
      }
    }
    return nearest;
  }
  function move(event) {
    const rect = updateRay(event);
    const point = ray.ray.intersectPlane(plane, new T.Vector3());
    if (point)
      wires.move(
        point.clamp(new T.Vector3(-15, 0, -15), new T.Vector3(15, 4, 15)),
      );
    gesture.target = targetAt(event, rect);
    marker.visible = !!gesture.target;
    if (gesture.target) marker.position.copy(gesture.target.position);
    status.textContent = gesture.target
      ? `Encaixar em ${gesture.target.item.type === "uno" ? "Uno" : gesture.target.item.type === "board" ? "Protoboard" : "Componente"} #${gesture.target.item.id} · ${gesture.target.pin}`
      : "Solte para deixar a ponta livre · Escape cancela";
  }
  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || gesture) return;
      updateRay(event);
      // Handles are deliberately larger than the cable; a cable body never starts a component drag.
      const hit = ray.intersectObjects(wires.handles.children, false)[0];
      if (!hit || !hit.object.visible) return;
      const { wire, index } = hit.object.userData.jumper;
      if (!wires.begin(wire, index)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      navigation.reset();
      controls.enabled = false;
      const pinTip = host.querySelector(".pin-tip");
      if (pinTip) pinTip.hidden = true;
      host.focus({ preventScroll: true });
      plane.constant = -hit.object.position.y;
      gesture = {
        pointerId: event.pointerId,
        terminals: terminals(),
        target: null,
      };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
      status.textContent =
        "Ponta retirada · arraste até um contato · Escape cancela";
    },
    true,
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      event.stopImmediatePropagation();
      move(event);
    },
    true,
  );
  function end(cancel = false) {
    if (!gesture) return;
    const { pointerId, target } = gesture;
    if (cancel) wires.cancel();
    else wires.finish(target);
    gesture = null;
    marker.visible = false;
    controls.enabled = true;
    canvas.style.cursor = "grab";
    status.textContent = cancel
      ? "Gesto cancelado · ligação anterior restaurada"
      : target
        ? `Ponta encaixada em ${target.pin} · outra ponta preservada`
        : "Ponta desconectada · arraste o conector para reconectar";
    if (canvas.hasPointerCapture(pointerId))
      canvas.releasePointerCapture(pointerId);
  }
  canvas.addEventListener(
    "pointerup",
    (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      event.stopImmediatePropagation();
      move(event);
      end();
    },
    true,
  );
  for (const name of ["pointercancel", "lostpointercapture"])
    canvas.addEventListener(name, () => end(true), true);
  host.addEventListener(
    "keydown",
    (event) => {
      if (!gesture) return;
      event.stopImmediatePropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        end(true);
      }
    },
    true,
  );
  window.addEventListener("blur", () => end(true));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) end(true);
  });
  return { cancel: () => end(true) };
}
