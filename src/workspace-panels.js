export function setupWorkspacePanels() {
  const shell = document.querySelector("main");
  const fullscreen = document.querySelector("#fullscreen");
  const codeButton = document.querySelector("#code-toggle");
  const editor = document.querySelector("#code-panel");
  setCodeOpen(true);
  function showExpanded(value) {
    shell.classList.toggle("expanded-workbench", value);
    fullscreen.textContent = value ? "⤢ Sair da tela cheia" : "⤢ Tela cheia";
    fullscreen.setAttribute("aria-pressed", String(value));
  }
  const message = document.createElement("p");
  message.className = "fullscreen-message";
  message.setAttribute("role", "alert");
  message.hidden = true;
  shell.append(message);
  fullscreen.addEventListener("click", async () => {
    message.hidden = true;
    try {
      if (document.fullscreenElement === shell) await document.exitFullscreen();
      else {
        if (!shell.requestFullscreen) throw new Error("unsupported");
        await shell.requestFullscreen();
      }
    } catch {
      message.textContent =
        "Tela cheia não foi permitida neste navegador. Abra o GhostLab no Chrome, Edge ou Firefox e tente novamente.";
      message.hidden = false;
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const expanded = document.fullscreenElement === shell;
    showExpanded(expanded);
    setCodeOpen(!expanded);
    shell.dispatchEvent(new CustomEvent("workbench-fullscreen"));
  });
  function setCodeOpen(open) {
    editor.hidden = !open;
    codeButton.setAttribute("aria-expanded", String(open));
    codeButton.textContent = open ? "⌄ Recolher código" : "〈/〉 Código";
    document
      .querySelector('[data-dock-action="code"]')
      ?.setAttribute("aria-expanded", String(open));
  }
  function toggleCode() {
    if (document.fullscreenElement !== shell) return;
    const open = editor.hidden;
    setCodeOpen(open);
    if (open) editor.querySelector("textarea").focus();
    else if (document.fullscreenElement === shell)
      document.querySelector('.dock-card[aria-current="true"]')?.focus();
    else codeButton.focus();
  }
  codeButton.addEventListener("click", toggleCode);
  document.querySelector("#close-code").addEventListener("click", toggleCode);
}

export function makeCatalogDraggable(card, type, { preview, drop, swipe }) {
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
    drag.listeners = new AbortController();
    const options = { signal: drag.listeners.signal };
    const cancel = () => {
      if (drag) finish({ pointerId: drag.id }, false);
    };
    window.addEventListener("blur", cancel, options);
    document.addEventListener("fullscreenchange", cancel, options);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) cancel();
      },
      options,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") cancel();
      },
      options,
    );
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
    if (swipe && !drag.mode) {
      drag.mode =
        Math.abs(event.clientX - drag.x) > Math.abs(event.clientY - drag.y)
          ? "swipe"
          : "place";
    }
    if (drag.mode === "swipe") {
      suppressClick = true;
      event.preventDefault();
      swipe(event.clientX - drag.x, false);
      return;
    }
    if (!drag.ghost) {
      suppressClick = true;
      drag.ghost = card.cloneNode(true);
      drag.ghost.removeAttribute("style");
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
    if (drag.mode === "swipe") swipe(commit ? event.clientX - drag.x : 0, true);
    drag.ghost?.remove();
    drag.listeners.abort();
    drag = null;
    if (card.hasPointerCapture(event.pointerId))
      card.releasePointerCapture(event.pointerId);
    if (commit && wasDragging) drop(type, event);
    preview(null);
  }
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
