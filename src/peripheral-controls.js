import * as T from "three";

export function setupScenePeripheralControls({
  host,
  canvas,
  items,
  camera,
  controls,
  navigation,
  onSelect,
  onChange,
  wires,
  isBusy = () => false,
}) {
  const document = host.ownerDocument,
    window = document.defaultView;
  const ray = new T.Raycaster(),
    pointer = new T.Vector2(),
    listeners = [];
  let gesture = null;
  const listen = (target, type, callback) => {
    target.addEventListener(type, callback, true);
    listeners.push(() => target.removeEventListener(type, callback, true));
  };
  function end(cancel = false) {
    if (!gesture) return;
    const { item, pointerId, value } = gesture;
    gesture = null;
    if (item.type === "button") item.pressed = false;
    else if (cancel) item.value = value;
    controls.enabled = true;
    canvas.style.cursor = "grab";
    if (canvas.hasPointerCapture?.(pointerId))
      canvas.releasePointerCapture(pointerId);
    onChange();
  }
  listen(canvas, "pointerdown", (event) => {
    if (event.button !== 0 || gesture || isBusy()) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(
      items.map((item) => item.group),
      true,
    )[0];
    if (!hit) return;
    const cable = wires && ray.intersectObjects(wires.meshes, false)[0];
    if (cable && cable.distance < hit.distance) return;
    let object = hit.object,
      kind;
    while (object && !object.userData.item) {
      kind ??= object.userData.peripheralControl;
      object = object.parent;
    }
    const item = object?.userData.item;
    if (!kind || !item || !["button", "pot"].includes(item.type)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigation.reset();
    controls.enabled = false;
    onSelect(item);
    host.focus({ preventScroll: true });
    gesture = {
      item,
      pointerId: event.pointerId,
      x: event.clientX,
      value: item.value ?? 0.5,
    };
    if (item.type === "button") item.pressed = true;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = item.type === "pot" ? "ew-resize" : "pointer";
    onChange();
  });
  listen(canvas, "pointermove", (event) => {
    if (!gesture) return;
    event.stopImmediatePropagation();
    if (gesture.pointerId !== event.pointerId) return;
    if (gesture.item.type === "pot") {
      gesture.item.value = T.MathUtils.clamp(
        gesture.value + (event.clientX - gesture.x) / 180,
        0,
        1,
      );
      onChange();
    }
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(canvas, type, (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      event.stopImmediatePropagation();
      end(type !== "pointerup");
    });
  listen(host, "keydown", (event) => {
    if (!gesture || event.key !== "Escape") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    end(true);
  });
  listen(window, "blur", () => end(true));
  listen(document, "visibilitychange", () => {
    if (document.hidden) end(true);
  });
  return {
    get active() {
      return !!gesture;
    },
    cancel: () => end(true),
    dispose() {
      end(true);
      listeners.forEach((fn) => fn());
    },
  };
}

export function mountPeripheralInspector(container, item, onChange) {
  const document = container.ownerDocument,
    window = document.defaultView;
  const section = document.createElement("section");
  section.className = "peripheral-controls";
  const cleanup = [];
  const listen = (target, event, handler) => {
    target.addEventListener(event, handler);
    cleanup.push(() => target.removeEventListener(event, handler));
  };
  let refresh = () => {},
    release = () => {};
  if (item?.type === "button") {
    section.innerHTML =
      '<button type="button" aria-pressed="false">Segure para pressionar</button><output>Solto</output><p>Também funciona com Espaço/Enter ou pressionando o topo na cena. Arraste a base para mover.</p>';
    const button = section.querySelector("button"),
      output = section.querySelector("output");
    let pointer = null;
    const set = (pressed) => {
      item.pressed = pressed;
      refresh();
      onChange();
    };
    refresh = () => {
      button.setAttribute("aria-pressed", String(!!item.pressed));
      output.textContent = item.pressed ? "Pressionado" : "Solto";
    };
    release = () => {
      pointer = null;
      if (item.pressed) set(false);
    };
    listen(button, "pointerdown", (event) => {
      if (event.button !== 0 || pointer !== null) return;
      event.preventDefault();
      button.focus();
      pointer = event.pointerId;
      button.setPointerCapture?.(pointer);
      set(true);
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      listen(button, event, (e) => {
        if (pointer === e.pointerId) release();
      });
    listen(button, "keydown", (event) => {
      if (![" ", "Enter"].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) set(true);
    });
    listen(button, "keyup", (event) => {
      if ([" ", "Enter"].includes(event.key)) {
        event.preventDefault();
        release();
      }
    });
    listen(button, "blur", release);
    listen(window, "blur", release);
    listen(document, "visibilitychange", () => {
      if (document.hidden) release();
    });
    container.append(section);
  } else if (item?.type === "pot") {
    section.innerHTML =
      '<label>Posição do potenciômetro <input type="range" min="0" max="100" step="1" aria-label="Posição do potenciômetro"></label><label>Valor (%) <input type="number" min="0" max="100" step="1" aria-label="Valor do potenciômetro em porcentagem"></label><p>Gire arrastando a haste para os lados na cena ou use as setas do controle.</p>';
    const range = section.querySelector('[type="range"]'),
      number = section.querySelector('[type="number"]');
    refresh = () => {
      range.value = String(Math.round((item.value ?? 0.5) * 100));
      if (document.activeElement !== number) number.value = range.value;
    };
    const change = (event) => {
      const value = Number(event.target.value);
      if (!Number.isFinite(value)) return;
      item.value = T.MathUtils.clamp(value / 100, 0, 1);
      number.value = String(Math.round(item.value * 100));
      refresh();
      onChange();
    };
    listen(range, "input", change);
    listen(number, "input", change);
    listen(number, "change", change);
    container.append(section);
  }
  refresh();
  return {
    refresh,
    dispose() {
      release();
      cleanup.forEach((fn) => fn());
      section.remove();
    },
  };
}
