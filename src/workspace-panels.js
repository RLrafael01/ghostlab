export function setupWorkspacePanels() {
  const shell = document.querySelector("main");
  const fullscreen = document.querySelector("#fullscreen");
  const codeButton = document.querySelector("#code-toggle");
  const editor = document.querySelector("#code-panel");
  let expanded = false;
  function showExpanded(value) {
    expanded = value;
    shell.classList.toggle("expanded-workbench", value);
    fullscreen.textContent = value ? "⤢ Sair da tela cheia" : "⤢ Tela cheia";
    fullscreen.setAttribute("aria-pressed", String(value));
  }
  fullscreen.addEventListener("click", async () => {
    if (expanded) {
      if (document.fullscreenElement === shell) await document.exitFullscreen();
      showExpanded(false);
    } else {
      showExpanded(true);
      try {
        await shell.requestFullscreen?.();
      } catch {
        /* Embedded browsers may deny native fullscreen; expanded mode remains usable. */
      }
    }
  });
  document.addEventListener("fullscreenchange", () =>
    showExpanded(document.fullscreenElement === shell),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && expanded && !document.fullscreenElement)
      showExpanded(false);
  });
  function toggleCode() {
    const open = editor.hidden;
    editor.hidden = !open;
    codeButton.setAttribute("aria-expanded", String(open));
    codeButton.textContent = open ? "⌄ Recolher código" : "〈/〉 Código";
    if (open) editor.querySelector("textarea").focus();
    else codeButton.focus();
  }
  codeButton.addEventListener("click", toggleCode);
  document.querySelector("#close-code").addEventListener("click", toggleCode);
}

export function makeCatalogDraggable(card, type, { preview, drop }) {
  let drag = null;
  let suppressClick = false;
  card.style.touchAction = "none";
  card.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ghost: null,
    };
    suppressClick = false;
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (
      !drag.ghost &&
      Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7
    )
      return;
    if (!drag.ghost) {
      suppressClick = true;
      drag.ghost = card.cloneNode(true);
      drag.ghost.removeAttribute("id");
      drag.ghost.removeAttribute("aria-label");
      drag.ghost.setAttribute("aria-hidden", "true");
      drag.ghost.tabIndex = -1;
      drag.ghost.className = "catalog-drag-ghost";
      // The ghost must be inside the fullscreen element to remain visible.
      document.querySelector("main").append(drag.ghost);
    }
    event.preventDefault();
    drag.ghost.style.left = `${event.clientX + 14}px`;
    drag.ghost.style.top = `${event.clientY + 14}px`;
    const valid = preview(event);
    drag.ghost.classList.toggle("valid-drop", valid);
  });
  function finish(event, commit) {
    if (!drag || event.pointerId !== drag.id) return;
    const wasDragging = !!drag.ghost;
    drag.ghost?.remove();
    drag = null;
    if (card.hasPointerCapture(event.pointerId))
      card.releasePointerCapture(event.pointerId);
    if (commit && wasDragging) drop(type, event);
    preview(null);
  }
  window.addEventListener("blur", () => {
    if (drag) finish({ pointerId: drag.id }, false);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && drag) finish({ pointerId: drag.id }, false);
  });
  card.addEventListener("pointerup", (event) => finish(event, true));
  card.addEventListener("pointercancel", (event) => finish(event, false));
  card.addEventListener("lostpointercapture", (event) => finish(event, false));
  card.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick = false;
      }
    },
    true,
  );
  card.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drag) finish({ pointerId: drag.id }, false);
  });
}
