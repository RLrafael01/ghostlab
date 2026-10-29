import { makeCatalogDraggable } from "./workspace-panels.js";

export function circularDistance(index, center, count) {
  return (
    ((((index - center + count * 1.5) % count) + count) % count) - count / 2
  );
}
export function setupImmersiveDock(catalog, { add, preview, drop }) {
  const shell = document.querySelector("main");
  const dock = document.createElement("nav");
  dock.className = "immersive-dock";
  dock.setAttribute("aria-label", "Dock de componentes e ferramentas");
  dock.innerHTML = `<div class="dock-caption"><b id="dock-title">Arduino Uno</b><span>Deslize para os lados · Arraste para cima para montar</span></div><div class="dock-body"><button class="dock-prev" aria-label="Item anterior">‹</button><div class="dock-track" aria-label="Carrossel de ferramentas"></div><button class="dock-next" aria-label="Próximo item">›</button></div><div class="dock-position" aria-live="polite"></div>`;
  shell.append(dock);
  const entries = [
    ...Object.entries(catalog).map(([type, data]) => ({
      type,
      name: data.name,
    })),
    { type: "code", name: "Código" },
    { type: "home", name: "Visão inicial" },
  ];
  const track = dock.querySelector(".dock-track");
  const cards = [];
  let center = 0,
    swipeBase = null;
  const spacing = () => Math.min(96, track.clientWidth / 5.3);
  const normalize = (value) =>
    ((value % entries.length) + entries.length) % entries.length;
  function render() {
    const selected = Math.round(normalize(center)) % entries.length;
    cards.forEach((card, index) => {
      const distance = circularDistance(index, center, entries.length);
      const abs = Math.abs(distance);
      card.style.transform = `translate(-50%, ${abs * 7}px) translateX(${distance * spacing()}px) scale(${Math.max(0.45, 1.16 - abs * 0.22)})`;
      card.style.opacity = String(Math.max(0, 1 - Math.pow(abs / 3, 1.5)));
      card.style.zIndex = String(10 - Math.round(abs));
      card.style.pointerEvents = abs < 2.8 ? "auto" : "none";
      card.tabIndex = abs < 2.8 ? 0 : -1;
      card.setAttribute("aria-hidden", String(abs >= 2.8));
      card.setAttribute("aria-current", String(index === selected));
    });
    dock.querySelector("#dock-title").textContent = entries[selected].name;
    dock.querySelector(".dock-position").textContent =
      `${selected + 1} / ${entries.length} · Clique no centro para ${entries[selected].type in catalog ? "adicionar" : "abrir"}`;
  }
  function move(amount, focus = false) {
    center = normalize(Math.round(center) + amount);
    render();
    if (focus) cards[Math.round(center)].focus({ preventScroll: true });
  }
  function swipe(delta, done) {
    if (swipeBase === null) swipeBase = center;
    center = normalize(swipeBase - delta / spacing());
    dock.classList.toggle("swiping", !done);
    if (done) {
      center = normalize(Math.round(center));
      swipeBase = null;
    }
    render();
  }
  entries.forEach((entry, index) => {
    const card = document.createElement("button");
    card.className = "dock-card";
    card.setAttribute("aria-label", entry.name);
    card.title = entry.name;
    if (entry.type === "code") {
      card.dataset.dockAction = "code";
      card.setAttribute("aria-controls", "code-panel");
      card.setAttribute(
        "aria-expanded",
        String(!document.querySelector("#code-panel").hidden),
      );
    }
    card.innerHTML = `<img src="/illustrations/${entry.type}.svg" alt="" draggable="false">`;
    makeCatalogDraggable(card, entry.type, {
      preview: entry.type in catalog ? preview : () => false,
      drop: entry.type in catalog ? drop : () => {},
      swipe,
    });
    card.addEventListener("click", () => {
      if (Math.abs(circularDistance(index, center, entries.length)) > 0.1) {
        center = index;
        render();
        return;
      }
      if (entry.type === "code") document.querySelector("#code-toggle").click();
      else if (entry.type === "home") document.querySelector("#home").click();
      else add(entry.type);
    });
    track.append(card);
    cards.push(card);
  });
  dock.querySelector(".dock-prev").onclick = () => move(-1);
  dock.querySelector(".dock-next").onclick = () => move(1);
  dock.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1, true);
    }
  });
  let wheel = 0;
  dock.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      wheel +=
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (Math.abs(wheel) >= 60) {
        move(Math.sign(wheel));
        wheel = 0;
      }
    },
    { passive: false },
  );
  let background = null;
  track.addEventListener("pointerdown", (event) => {
    if (event.target !== track || event.button !== 0) return;
    background = { id: event.pointerId, x: event.clientX };
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (background?.id === event.pointerId)
      swipe(event.clientX - background.x, false);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    track.addEventListener(name, (event) => {
      if (background?.id !== event.pointerId) return;
      const start = background.x;
      background = null;
      swipe(name === "pointerup" ? event.clientX - start : 0, true);
      if (track.hasPointerCapture(event.pointerId))
        track.releasePointerCapture(event.pointerId);
    });
  new ResizeObserver(render).observe(track);
  render();
}
