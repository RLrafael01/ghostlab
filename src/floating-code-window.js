// A fullscreen editor owns its window geometry; normal mode retains the page layout.
export function setupFloatingCodeWindow({ shell, editor }) {
  const document = editor.ownerDocument;
  const view = document.defaultView;
  const header = editor.querySelector(".editor-head");
  if (!header) return null;
  const styleKeys = ["left", "top", "width", "height"];
  const inline = Object.fromEntries(
    styleKeys.map((key) => [key, editor.style[key]]),
  );
  let expanded = false;
  let rectangle = null;
  let gesture = null;

  const controls = [];
  for (const [name, label, symbol] of [
    ["move", "Mover janela de código", "✥"],
    ["reset", "Restaurar janela", "↺"],
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `code-window-tool code-window-${name}`;
    button.setAttribute("aria-label", label);
    button.title =
      name === "move"
        ? "Arraste ou use as setas para mover · Shift: passo maior"
        : "Restaurar tamanho e posição da janela";
    button.textContent = symbol;
    button.disabled = true;
    if (name === "move") {
      button.addEventListener("pointerdown", (event) => start(event, button));
      button.addEventListener("keydown", (event) => keyboard(event));
    } else {
      button.addEventListener("click", () => {
        finish(false);
        rectangle = initialRectangle();
        render();
      });
    }
    header.insertBefore(button, header.querySelector("#close-code"));
    controls.push(button);
  }
  for (const [direction, label] of Object.entries({
    n: "pela borda superior",
    ne: "pelo canto superior direito",
    e: "pela borda direita",
    se: "pelo canto inferior direito",
    s: "pela borda inferior",
    sw: "pelo canto inferior esquerdo",
    w: "pela borda esquerda",
    nw: "pelo canto superior esquerdo",
  })) {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = `code-window-resize resize-${direction}`;
    handle.setAttribute("aria-label", `Redimensionar código ${label}`);
    handle.title =
      "Arraste ou use as setas para redimensionar · Shift: passo maior";
    handle.disabled = true;
    handle.addEventListener("pointerdown", (event) =>
      start(event, handle, direction),
    );
    handle.addEventListener("keydown", (event) => keyboard(event, direction));
    editor.append(handle);
    controls.push(handle);
  }

  function bounds() {
    const width = shell.clientWidth || view.innerWidth;
    const height = shell.clientHeight || view.innerHeight;
    const top = Math.min(
      Math.max(
        72,
        (shell.querySelector(".toolbar")?.getBoundingClientRect().bottom || 0) +
          12,
      ),
      height - 32,
    );
    return { left: 16, top, right: width - 16, bottom: height - 16 };
  }
  function fit(rect) {
    const area = bounds();
    const width = Math.min(Math.max(rect.width, 420), area.right - area.left);
    const height = Math.min(Math.max(rect.height, 280), area.bottom - area.top);
    return {
      left: Math.max(area.left, Math.min(rect.left, area.right - width)),
      top: Math.max(area.top, Math.min(rect.top, area.bottom - height)),
      width,
      height,
    };
  }
  function initialRectangle() {
    const area = bounds();
    const dockTop = shell
      .querySelector(".immersive-dock")
      ?.getBoundingClientRect().top;
    const bottom =
      dockTop > area.top + 280
        ? Math.min(area.bottom, dockTop - 12)
        : area.bottom;
    const width = Math.min(900, area.right - area.left);
    const height = Math.min(420, bottom - area.top);
    return fit({
      left: (area.left + area.right - width) / 2,
      top: bottom - height,
      width,
      height,
    });
  }
  function render() {
    if (!expanded || !rectangle) return;
    for (const key of styleKeys) editor.style[key] = `${rectangle[key]}px`;
  }
  function resize(rect, direction, dx, dy) {
    const area = bounds();
    const minWidth = Math.min(420, area.right - area.left);
    const minHeight = Math.min(280, area.bottom - area.top);
    let { left, top } = rect;
    let right = left + rect.width;
    let bottom = top + rect.height;
    if (direction.includes("w"))
      left = Math.max(area.left, Math.min(left + dx, right - minWidth));
    if (direction.includes("e"))
      right = Math.min(area.right, Math.max(right + dx, left + minWidth));
    if (direction.includes("n"))
      top = Math.max(area.top, Math.min(top + dy, bottom - minHeight));
    if (direction.includes("s"))
      bottom = Math.min(area.bottom, Math.max(bottom + dy, top + minHeight));
    return { left, top, width: right - left, height: bottom - top };
  }
  function finish(commit) {
    if (!gesture) return;
    const previous = gesture;
    gesture = null;
    previous.listeners.abort();
    if (!commit) rectangle = fit(previous.start);
    editor.classList.remove("code-window-interacting");
    if (previous.handle.hasPointerCapture?.(previous.id))
      previous.handle.releasePointerCapture(previous.id);
    render();
  }
  function keyboard(event, direction = "") {
    if (!expanded || editor.hidden) return;
    const delta = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    finish(false);
    const step = event.shiftKey ? 40 : 10;
    const [dx, dy] = delta.map((value) => value * step);
    rectangle = direction
      ? resize(rectangle, direction, dx, dy)
      : fit({
          ...rectangle,
          left: rectangle.left + dx,
          top: rectangle.top + dy,
        });
    render();
  }
  function start(event, handle = header, direction = "") {
    if (!expanded || editor.hidden || gesture || event.button !== 0) return;
    if (
      handle === header &&
      event.target.closest("button, input, select, textarea, a")
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    const listeners = new view.AbortController();
    const options = { signal: listeners.signal };
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: { ...rectangle },
      handle,
      listeners,
    };
    editor.classList.add("code-window-interacting");
    handle.setPointerCapture?.(event.pointerId);
    document.addEventListener(
      "pointermove",
      (move) => {
        if (!gesture || move.pointerId !== gesture.id) return;
        move.preventDefault();
        move.stopPropagation();
        const dx = move.clientX - gesture.x;
        const dy = move.clientY - gesture.y;
        rectangle = direction
          ? resize(gesture.start, direction, dx, dy)
          : fit({
              ...gesture.start,
              left: gesture.start.left + dx,
              top: gesture.start.top + dy,
            });
        render();
      },
      options,
    );
    document.addEventListener(
      "pointerup",
      (up) => {
        if (up.pointerId === gesture?.id) finish(true);
      },
      options,
    );
    document.addEventListener(
      "pointercancel",
      (cancel) => {
        if (cancel.pointerId === gesture?.id) finish(false);
      },
      options,
    );
    handle.addEventListener(
      "lostpointercapture",
      (lost) => {
        if (lost.pointerId === gesture?.id) finish(false);
      },
      options,
    );
    document.addEventListener(
      "keydown",
      (key) => {
        if (key.key === "Escape") {
          key.preventDefault();
          key.stopPropagation();
          finish(false);
        }
      },
      { ...options, capture: true },
    );
    view.addEventListener("blur", () => finish(false), options);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) finish(false);
      },
      options,
    );
  }
  header.addEventListener("pointerdown", (event) => start(event));
  view.addEventListener("resize", () => {
    finish(false);
    if (!expanded || !rectangle) return;
    rectangle = fit(rectangle);
    render();
  });
  return {
    setExpanded(value) {
      finish(false);
      expanded = value;
      editor.classList.toggle("floating-code-window", expanded);
      for (const control of controls) control.disabled = !expanded;
      if (expanded) {
        rectangle = rectangle ? fit(rectangle) : initialRectangle();
        render();
      } else {
        for (const key of styleKeys) editor.style[key] = inline[key];
      }
    },
    setOpen(open) {
      if (!open) finish(false);
      if (expanded && open) {
        rectangle = fit(rectangle);
        render();
      }
    },
  };
}
