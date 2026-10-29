import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";
const catalog = {
  uno: {
    name: "Arduino Uno",
    color: 0x157c88,
    pins: [
      "D0",
      "D1",
      "D2",
      "D3",
      "D4",
      "D5",
      "D6",
      "D7",
      "D8",
      "D9",
      "D10",
      "D11",
      "D12",
      "D13",
      "5V",
      "GND",
      "A0",
      "A1",
    ],
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
  `<header><div class="brand">◈ <b>ghostlab</b><span>LABORATÓRIO VIRTUAL</span></div><div class="project">Minha primeira bancada <span> / rascunho</span></div><span class="badge">● PRÉVIA INTERATIVA</span></header><main><aside><div class="eyebrow">SUA CAIXA DE FERRAMENTAS</div><h2>Componentes</h2><input id="search" placeholder="Buscar componente…" aria-label="Buscar componente"><div id="catalog"></div><div class="note">Construa uma ideia.<br>Comece adicionando uma peça à bancada.</div></aside><section class="workspace"><div class="toolbar"><div><b>Bancada 3D</b><span id="count"></span></div><button id="home">⌂ Visão inicial</button></div><div id="scene" tabindex="0" aria-label="Bancada 3D interativa"><div class="scene-tag">GHOSTLAB / WORKSPACE 01</div><div class="guide">Arraste o fundo para orbitar · Scroll para zoom · Selecione uma peça para mover</div></div><div class="editor"><div class="editor-head"><b>〈/〉 sketch.ino</b><span>Prévia — código ainda não executado</span></div><textarea spellcheck="false" aria-label="Código Arduino">// Seu próximo projeto começa aqui.
// Nesta prévia, o código não é executado.
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
}</textarea></div></section><aside class="inspector"><div class="eyebrow">DETALHES DA MONTAGEM</div><h2>Inspetor</h2><div id="details"></div><h3>Na bancada</h3><div id="parts"></div><div class="note">Montagem visual disponível.<br>Execução de firmware e conexões elétricas serão integradas nas próximas etapas.</div></aside></main><footer><span><i></i> Bancada pronta</span><span>UNO · PRÉVIA VISUAL</span><span>GhostLab / 2026</span></footer>`;
const host = document.querySelector("#scene"),
  scene = new T.Scene();
scene.background = new T.Color("#101c28");
scene.fog = new T.Fog("#101c28", 25, 55);
const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.append(renderer.domElement);
renderer.shadowMap.enabled = true;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 4;
controls.maxDistance = 35;
function home() {
  camera.position.set(10, 13, 15);
  controls.target.set(0, 0, 0);
  controls.update();
}
home();
scene.add(new T.HemisphereLight(0xe1efff, 0x284039, 2));
const light = new T.DirectionalLight(0xffffff, 3);
light.position.set(3, 10, 5);
scene.add(light);
scene.add(new T.GridHelper(40, 80, 0x36505e, 0x203441));
const ray = new T.Raycaster(),
  pointer = new T.Vector2();
const items = [];
let selected = null,
  serial = 0,
  outline = null;
function box(group, w, h, d, color, x = 0, y = 0, z = 0) {
  const m = new T.Mesh(
    new T.BoxGeometry(w, h, d),
    new T.MeshStandardMaterial({ color, roughness: 0.6 }),
  );
  m.position.set(x, y, z);
  group.add(m);
  return m;
}
function text(group, label, x, y, z) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 80;
  const ctx = c.getContext("2d");
  ctx.font = "bold 30px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ecf8ff";
  ctx.fillText(label, 256, 50);
  const s = new T.Sprite(
    new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false }),
  );
  s.position.set(x, y, z);
  s.scale.set(2.6, 0.4, 1);
  group.add(s);
}
function add(type, x, z) {
  const data = catalog[type],
    g = new T.Group();
  const [w, h, d] = data.size;
  box(g, w, h, d, data.color, 0, h / 2, 0);
  if (type === "uno") {
    box(g, 1.1, 0.18, 0.55, 0x192328, 0, 0.3, 0);
    box(g, 0.55, 0.35, 0.5, 0xb9c4c8, -1.2, 0.3, 0);
    text(g, "UNO", 0, 0.6, 0);
  }
  if (type === "board") {
    for (let a = 0; a < 24; a++)
      for (let b = 0; b < 8; b++)
        box(
          g,
          0.055,
          0.02,
          0.055,
          0x68737a,
          -1.7 + a * 0.145,
          0.26,
          -0.75 + b * 0.21,
        );
  }
  if (type === "sensor") {
    for (const x of [-0.45, 0.45]) {
      const m = new T.Mesh(
        new T.CylinderGeometry(0.3, 0.3, 0.35, 24),
        new T.MeshStandardMaterial({ color: 0xc7d1d7 }),
      );
      m.rotation.x = Math.PI / 2;
      m.position.set(x, 0.3, 0.3);
      g.add(m);
    }
  }
  if (type === "servo") box(g, 1.4, 0.12, 0.15, 0xe2e9ef, 0.3, 1.1, 0);
  if (type === "led") {
    const m = new T.Mesh(
      new T.SphereGeometry(0.28, 20, 12),
      new T.MeshStandardMaterial({ color: data.color }),
    );
    m.position.y = 0.7;
    g.add(m);
  }
  data.pins.forEach((p, i) => {
    const row = i % 2,
      idx = Math.floor(i / 2),
      n = Math.ceil(data.pins.length / 2);
    const terminal = box(
      g,
      0.09,
      0.16,
      0.09,
      0xd6bc74,
      -w * 0.4 + (n === 1 ? 0 : (idx * w * 0.8) / (n - 1)),
      h + 0.08,
      (row ? 1 : -1) * d * 0.4,
    );
    terminal.userData.pinName = p;
  });
  const item = { id: ++serial, type, group: g };
  g.position.set(
    x ?? ((items.length % 4) - 1.5) * 2.4,
    0,
    z ?? Math.floor(items.length / 4) * 2.5,
  );
  g.userData.item = item;
  scene.add(g);
  items.push(item);
  select(item);
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
  if (!selected) return;
  const item = selected;
  scene.remove(item.group);
  item.group.traverse((o) => {
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
    ? `<div class="selected-icon">◈</div><h3>${catalog[selected.type].name} <small>#${selected.id}</small></h3><div class="eyebrow">POSIÇÃO NA BANCADA</div><div class="coords"><label>X <input id="x" type="number" step="0.5" min="-15" max="15" value="${selected.group.position.x}"></label><label>Z <input id="z" type="number" step="0.5" min="-15" max="15" value="${selected.group.position.z}"></label></div><p class="hint">Use as setas do teclado com a bancada em foco para mover a peça.</p><div class="eyebrow">PINOS</div><div class="pins">${catalog[selected.type].pins.map((p) => `<span>${p}</span>`).join("")}</div><button id="delete" class="danger">Remover componente</button>`
    : '<div class="empty">Selecione um componente na cena ou na lista para inspecionar seus pinos e ajustar a posição.</div>';
  for (const axis of ["x", "z"])
    document.querySelector("#" + axis)?.addEventListener("change", (e) => {
      const n = Number(e.target.value);
      if (Number.isFinite(n)) {
        selected.group.position[axis] = Math.max(-15, Math.min(15, n));
        e.target.value = String(selected.group.position[axis]);
        outline?.update();
      }
    });
  document.querySelector("#delete")?.addEventListener("click", remove);
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
let down;
renderer.domElement.addEventListener("pointerdown", (e) => {
  down = [e.clientX, e.clientY];
  host.focus();
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = host.getBoundingClientRect();
  pointer.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    (-(e.clientY - r.top) / r.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(
    items.map((i) => i.group),
    true,
  )[0];
  let o = hit?.object;
  while (o && !o.userData.item) o = o.parent;
  select(o?.userData.item ?? null);
});
host.addEventListener("keydown", (e) => {
  if (e.key === "Home") {
    home();
    return;
  }
  if (!selected) return;
  const movement = {
    ArrowLeft: ["x", -0.5],
    ArrowRight: ["x", 0.5],
    ArrowUp: ["z", -0.5],
    ArrowDown: ["z", 0.5],
  }[e.key];
  if (movement) {
    e.preventDefault();
    selected.group.position[movement[0]] = T.MathUtils.clamp(
      selected.group.position[movement[0]] + movement[1],
      -15,
      15,
    );
    outline?.update();
    renderPanel();
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
      b.innerHTML = `<span class="chip" style="background:#${v.color.toString(16).padStart(6, "0")}">◈</span><span>${v.name}<small>${v.pins.length} pinos</small></span><strong>＋</strong>`;
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
add("uno", -2, 0);
add("board", 2, 0);
select(null);
renderer.setAnimationLoop(() => {
  controls.update();
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
  const name = hit?.object.userData.pinName;
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
