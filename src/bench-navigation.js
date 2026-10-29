import { Vector3 } from "three";

// Keyboard navigation is scoped to the workbench, never to editor/inspector inputs.
export function createBenchNavigation(host, camera, controls) {
  const held = new Set();
  const directions = {
    w: "forward",
    ArrowUp: "forward",
    s: "backward",
    ArrowDown: "backward",
    a: "left",
    ArrowLeft: "left",
    d: "right",
    ArrowRight: "right",
  };
  const forward = new Vector3();
  const right = new Vector3();
  const movement = new Vector3();
  const up = new Vector3(0, 1, 0);
  const keyName = (event) =>
    event.key.length === 1 ? event.key.toLowerCase() : event.key;
  function reset() {
    held.clear();
  }
  host.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      reset();
      return;
    }
    const key = keyName(event);
    if (!directions[key]) return;
    event.preventDefault();
    held.add(key);
  });
  window.addEventListener("keyup", (event) => held.delete(keyName(event)));
  window.addEventListener("blur", reset);
  host.addEventListener("focusout", reset);
  document.addEventListener("visibilitychange", reset);
  return {
    reset,
    update(deltaSeconds) {
      if (!held.size || !host.contains(document.activeElement)) return;
      const active = new Set([...held].map((key) => directions[key]));
      const horizontal =
        Number(active.has("right")) - Number(active.has("left"));
      const vertical =
        Number(active.has("forward")) - Number(active.has("backward"));
      if (!horizontal && !vertical) return;
      camera.getWorldDirection(forward);
      forward.y = 0;
      // At a straight-down view, use the camera's screen-up direction instead.
      if (forward.lengthSq() < 1e-8) {
        forward.setFromMatrixColumn(camera.matrixWorld, 1);
        forward.y = 0;
      }
      forward.normalize();
      right.crossVectors(forward, up).normalize();
      movement
        .copy(forward)
        .multiplyScalar(vertical)
        .addScaledVector(right, horizontal);
      movement.normalize().multiplyScalar(5 * Math.min(deltaSeconds, 0.05));
      camera.position.add(movement);
      controls.target.add(movement);
    },
  };
}
