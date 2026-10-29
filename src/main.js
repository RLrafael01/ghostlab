import { BREADBOARD } from "./breadboard-layout.js";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";
import { lightWorkbench } from "./workbench-lighting.js";
import {
  createVisualWires,
  terminalPosition,
  leadTip,
} from "./visual-wires.js";
import { createBenchNavigation } from "./bench-navigation.js";
import { loadCAD, pinNameForHit, UNO_HEADERS } from "./cad-models.js";
const catalog = {
  uno: {
    name: "Arduino Uno",
    color: 0x157c88,
    pins: UNO_HEADERS.flatMap((header) => header.names),
    size: [3, 0.25, 2.2],
  },
  board: {
    name: "Protoboard",
    color: 0xe4e5de,
    pins: ["+", "−", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    size: [4, 0.25, 2],
  },
  led: {
    name: "LED vermelho",
    color: 0xe85d62,
    pins: ["Ânodo +", "Cátodo −"],
    size: [0.5, 0.7, 0.5],
  },
  resistor: {
    name: "Resistor",
    color: 0xd2b788,
    pins: ["1", "2"],
    size: [1, 0.25, 0.3],
  },
  button: {
    name: "Botão",
    color: 0x444f5b,
    pins: ["1", "2", "3", "4"],
    size: [0.8, 0.3, 0.8],
  },
  servo: {
    name: "Servo",
    color: 0x3675ca,
    pins: ["GND", "5V", "Sinal"],
    size: [1.2, 1, 0.7],
  },
  sensor: {
    name: "Sensor de distância",
    color: 0x247d94,
    pins: ["VCC", "Trig", "Echo", "GND"],
    size: [1.7, 0.3, 0.7],
  },
  pot: {
    name: "Potenciômetro",
    color: 0x377eb6,
    pins: ["VCC", "Sinal", "GND"],
    size: [0.8, 0.5, 0.8],
  },
};
document.querySelector("#app").innerHTML =
  `<header><div class="brand">◈ <b>ghostlab</b><span>LABORATÓRIO VIRTUAL</span></div><div class="project">Minha primeira bancada <span> / rascunho</span></div><span class="badge">● PRÉVIA INTERATIVA</span></header><main><aside><div class="eyebrow">SUA CAIXA DE FERRAMENTAS</div><h2>Componentes</h2><input id="search" placeholder="Buscar componente…" aria-label="Buscar componente"><div id="catalog"></div><div class="note">Construa uma ideia.<br>Comece adicionando uma peça à bancada.</div></aside><section class="workspace"><div class="toolbar"><div><b>Bancada 3D</b><span id="count"></span></div><label class="snap-control"><input type="checkbox" id="snap" checked title="Aproxima LED, resistor e botão aos contatos; não valida ligações elétricas"> Encaixe visual</label><button id="home">⌂ Visão inicial</button></div><div id="scene" tabindex="0" aria-label="Bancada 3D interativa"><div class="scene-tag">MONTAGEM VISUAL · SEM SIMULAÇÃO ELÉTRICA</div><div class="guide">WASD / setas: navegar · Arraste o fundo: orbitar · Scroll: zoom · Arraste peças: mover</div></div><div class="editor"><div class="editor-head"><b>〈/〉 sketch.ino</b><span>Prévia — código ainda não executado</span></div><textarea spellcheck="false" aria-label="Código Arduino">// Seu próximo projeto começa aqui.
// Nesta prévia, o código não é executado.
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
}</textarea></div></section><aside class="inspector"><div class="eyebrow">DETALHES DA MONTAGEM</div><h2>Inspetor</h2><div id="details"></div><h3>Na bancada</h3><div id="parts"></div><div class="note">Montagem visual disponível.<br>Execução de firmware e conexões elétricas serão integradas nas próximas etapas.</div></aside></main><footer><span><i></i> Bancada pronta</span><span>UNO · PRÉVIA VISUAL</span><span>GhostLab / 2026</span></footer>`;
const host = document.querySelector("#scene"),
  scene = new T.Scene();

const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.append(renderer.domElement);
lightWorkbench(renderer, scene);
const visualWires = createVisualWires(scene);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 1.2;
controls.maxDistance = 35;
const navigation = createBenchNavigation(host, camera, controls);
function home() {
  navigation.reset();
  camera.position.set(3, 10, 14);
  controls.target.set(0.3, 0, 0);
  controls.update();
}
home();
const ray = new T.Raycaster(),
  pointer = new T.Vector2();
const items = [];
let selected = null,
  serial = 0,
  outline = null;
async function add(type, x, z) {
  const data = catalog[type],
    g = new T.Group();
  const status = document.querySelector("footer span");
  status.textContent = `Carregando ${data.name}…`;
  try {
    g.add(await loadCAD(type));
  } catch (error) {
    status.textContent = `Não foi possível carregar ${data.name}. Tente adicionar novamente.`;
    console.error(error);
    return;
  }
  status.textContent = "Bancada pronta · modelos CAD";
  const item = { id: ++serial, type, group: g };
  g.position.set(
    x ?? ((items.length % 4) - 1.5) * 2.4,
    0,
    z ?? 3 + Math.floor(Math.max(0, items.length - 2) / 4) * 2,
  );
  g.userData.item = item;
  scene.add(g);
  items.push(item);
  if (!drag) select(item);
  else renderPanel();
  return item;
}
function select(item) {
  selected = item;
  if (outline) {
    scene.remove(outline);
    outline.geometry.dispose();
    outline.material.dispose();
    outline = null;
  }
  if (item) {
    outline = new T.BoxHelper(item.group, 0x65e0bd);
    scene.add(outline);
  }
  renderPanel();
}
function remove() {
  if (!selected || drag) return;
  const item = selected;
  visualWires.removeFor(item);
  for (const child of items)
    if (child.mountedTo === item) {
      child.mountedTo = null;
      child.group.position.y = 0;
    }
  scene.remove(item.group);
  item.group.traverse((o) => {
    if (o.isInstancedMesh) o.dispose();
    o.geometry?.dispose();
    if (o.material) {
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
  items.splice(items.indexOf(item), 1);
  select(null);
}
function renderPanel() {
  document.querySelector("#count").textContent = `${items.length} componentes`;
  document.querySelector("#details").innerHTML = selected
    ? `<div class="selected-icon">◈</div><h3>${catalog[selected.type].name} <small>#${selected.id}</small></h3><div class="eyebrow">POSIÇÃO NA BANCADA</div><div class="coords"><label>X <input id="x" type="number" step="0.5" min="-15" max="15" value="${selected.group.position.x}"></label><label>Z <input id="z" type="number" step="0.5" min="-15" max="15" value="${selected.group.position.z}"></label></div><p class="hint">Arraste a peça na cena ou ajuste X/Z. WASD e setas navegam pela bancada.</p><div class="eyebrow">PINOS</div><div class="pins">${catalog[selected.type].pins.map((p) => `<span>${p}</span>`).join("")}</div><button id="focus-part" class="focus-part">⌕ Focar peça</button><button id="delete" class="danger">Remover componente</button>`
    : '<div class="empty">Selecione um componente na cena ou na lista para inspecionar seus pinos e ajustar a posição.</div>';
  for (const axis of ["x", "z"])
    document.querySelector("#" + axis)?.addEventListener("change", (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) {
        const position = selected.group.position.clone();
        position[axis] = Math.max(-15, Math.min(15, n));
        moveItem(selected, position);
        snapToBoard(selected);
        e.target.value = String(selected.group.position[axis]);
        outline?.update();
        renderPanel();
      }
    });
  document.querySelector("#delete")?.addEventListener("click", remove);
  document.querySelector("#focus-part")?.addEventListener("click", () => {
    const bounds = new T.Box3().setFromObject(selected.group);
    const center = bounds.getCenter(new T.Vector3());
    const size = bounds.getSize(new T.Vector3());
    const direction = camera.position.clone().sub(controls.target).normalize();
    const distance = Math.max(1.8, Math.max(size.x, size.y, size.z) * 1.8);
    navigation.reset();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.update();
  });
  const list = document.querySelector("#parts");
  list.innerHTML = "";
  items.forEach((item) => {
    const b = document.createElement("button");
    b.className = "part" + (item === selected ? " active" : "");
    b.textContent = `${catalog[item.type].name} #${item.id}`;
    b.onclick = () => select(item);
    list.append(b);
  });
}
function moveItem(item, position) {
  const delta = position.clone().sub(item.group.position);
  item.group.position.copy(position);
  for (const child of items)
    if (child.mountedTo === item) child.group.position.add(delta);
}
function snapToBoard(item) {
  if (!["led", "resistor", "button"].includes(item.type)) return;
  item.mountedTo = null;
  item.group.position.y = 0;
  if (!document.querySelector("#snap").checked) return;
  const board = items.find(
    (candidate) =>
      candidate.type === "board" &&
      Math.abs(item.group.position.x - candidate.group.position.x) < 3.5 &&
      Math.abs(item.group.position.z - candidate.group.position.z) < 0.7,
  );
  if (!board) return;
  const anchor = terminalPosition(board, "a1");
  const tip =
    item.type === "led"
      ? leadTip(item, "Ânodo +")
      : item.type === "button"
        ? leadTip(item, "1")
        : terminalPosition(item, "1");
  const reference = tip ?? item.group.position.clone();
  const pitch = BREADBOARD.pitch * BREADBOARD.sceneScale;
  const column = T.MathUtils.clamp(
    Math.round((reference.x - anchor.x) / pitch),
    0,
    BREADBOARD.columns - 1,
  );
  const x = anchor.x + column * pitch;
  const side = reference.z < board.group.position.z ? -1 : 1;
  const rows = Array.from(
    { length: BREADBOARD.rowsPerSide },
    (_, row) =>
      board.group.position.z +
      side *
        (BREADBOARD.outerRowZ - row * BREADBOARD.pitch) *
        BREADBOARD.sceneScale,
  );
  const z = rows.reduce((a, b) =>
    Math.abs(a - reference.z) < Math.abs(b - reference.z) ? a : b,
  );
  item.group.position.add(
    new T.Vector3(
      x - reference.x,
      anchor.y - 0.055 - reference.y,
      z - reference.z,
    ),
  );
  item.mountedTo = board;
  outline?.update();
}
let drag = null;
const dragPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
function updateRay(event) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - r.left) / r.width) * 2 - 1,
    (-(event.clientY - r.top) / r.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
}
renderer.domElement.addEventListener(
  "pointerdown",
  (event) => {
    if (event.button !== 0 || drag) return;
    host.focus({ preventScroll: true });
    navigation.reset();
    updateRay(event);
    let object = ray.intersectObjects(
      items.map((item) => item.group),
      true,
    )[0]?.object;
    while (object && !object.userData.item) object = object.parent;
    const item = object?.userData.item;
    if (!item) {
      select(null);
      return;
    }
    const point = ray.ray.intersectPlane(dragPlane, new T.Vector3());
    if (!point) return;
    controls.enabled = false;
    event.stopImmediatePropagation();
    select(item);
    host.focus();
    drag = {
      item,
      id: event.pointerId,
      offset: item.group.position.clone().sub(point),
    };
    renderer.domElement.setPointerCapture(event.pointerId);
    renderer.domElement.style.cursor = "grabbing";
  },
  true,
);
renderer.domElement.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  updateRay(event);
  const point = ray.ray.intersectPlane(dragPlane, new T.Vector3());
  if (!point) return;
  point.add(drag.offset);
  moveItem(
    drag.item,
    new T.Vector3(
      T.MathUtils.clamp(point.x, -15, 15),
      0,
      T.MathUtils.clamp(point.z, -15, 15),
    ),
  );
  snapToBoard(drag.item);
  outline?.update();
  for (const axis of ["x", "z"]) {
    const input = document.querySelector("#" + axis);
    if (input) input.value = drag.item.group.position[axis].toFixed(2);
  }
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  drag = null;
  controls.enabled = true;
  renderer.domElement.style.cursor = "grab";
  renderPanel();
  if (renderer.domElement.hasPointerCapture(event.pointerId))
    renderer.domElement.releasePointerCapture(event.pointerId);
}
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  renderer.domElement.addEventListener(event, endDrag);
host.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Home") {
    e.preventDefault();
    home();
    return;
  }
  if (e.key === "Delete") remove();
});
function showCatalog(query = "") {
  const list = document.querySelector("#catalog");
  list.innerHTML = "";
  Object.entries(catalog)
    .filter(([, v]) => v.name.toLowerCase().includes(query.toLowerCase()))
    .forEach(([type, v]) => {
      const b = document.createElement("button");
      b.className = "catalog-item";
      b.innerHTML = `<span class="chip" style="background:#${v.color.toString(16).padStart(6, "0")}">◈</span><span>${v.name}<small>${type === "board" ? "830 contatos" : v.pins.length + " pinos"}</small></span><strong>＋</strong>`;
      b.onclick = () => add(type);
      list.append(b);
    });
}
document.querySelector("#search").oninput = (e) => showCatalog(e.target.value);
document.querySelector("#home").onclick = home;
new ResizeObserver(() => {
  const w = host.clientWidth,
    h = host.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}).observe(host);
showCatalog();
async function loadPresentation() {
  const [uno, board, led, resistor] = await Promise.all([
    add("uno", -3.8, 0),
    add("board", 1.7, 0),
    add("led", 1.3, -0.4),
    add("resistor", 0.4, -0.4),
  ]);
  if (items.includes(board) && items.includes(led)) snapToBoard(led);
  if (items.includes(board) && items.includes(resistor)) snapToBoard(resistor);
  if (items.includes(uno) && items.includes(board)) {
    visualWires.connect(uno, "5V", board, "Superior + 2", "#c43c34", 0.55);
    visualWires.connect(uno, "GND", board, "Superior − 3", "#262b30", 0.8);
    visualWires.connect(uno, "D9", board, "a16", "#20a79a", 1);
    visualWires.connect(board, "c20", board, "g26", "#e9b640", 0.35);
  }
  select(null);
}
loadPresentation();
let lastFrame = performance.now();
renderer.setAnimationLoop((now) => {
  const deltaSeconds = Math.max(0, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!drag) {
    navigation.update(deltaSeconds);
    controls.update();
  }
  visualWires.update();
  renderer.render(scene, camera);
});

const pinTip = document.createElement("div");
pinTip.className = "pin-tip";
pinTip.hidden = true;
host.append(pinTip);
renderer.domElement.addEventListener("pointermove", (event) => {
  const rect = host.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    (-(event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(
    items.map((item) => item.group),
    true,
  )[0];
  const name = pinNameForHit(hit);
  pinTip.hidden = !name;
  if (name) {
    pinTip.textContent = "Pino " + name;
    pinTip.style.left =
      Math.min(rect.width - 100, event.clientX - rect.left + 12) + "px";
    pinTip.style.top = event.clientY - rect.top - 30 + "px";
  }
});
renderer.domElement.addEventListener(
  "pointerleave",
  () => (pinTip.hidden = true),
);

window.addEventListener("blur", () => {
  if (drag) endDrag({ pointerId: drag.id });
});
