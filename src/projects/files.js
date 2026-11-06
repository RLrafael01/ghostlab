import {
  MAX_FILE,
  parseProject,
  serializeProject,
  validateProject,
  componentPins,
} from "./schema.js";

const names = {
  uno: "Arduino Uno",
  board: "Protoboard",
  led: "LED vermelho",
  resistor: "Resistor",
  button: "Botão",
  servo: "Servo",
  sensor: "Sensor de distância",
  pot: "Potenciômetro",
};

const unoGround = [
  "GND junto a AREF/D13",
  "primeiro GND após 5V no conector de alimentação",
  "segundo GND após 5V, junto a VIN",
];

function terminalName(component, pin, occurrence = 0) {
  return component.type === "uno" && pin === "GND"
    ? unoGround[occurrence]
    : pin;
}

function describeComponent(component) {
  const { type, id, columns, parameters = {} } = component;
  const lines = [`- ${names[type]} #${id}`];
  if (type === "board") {
    lines.push(
      `  ${columns} colunas. Contatos a–j: colunas 1 a ${columns}; a–e e f–j são grupos separados.`,
    );
    const rails = componentPins(component).filter((pin) =>
      pin.startsWith("Superior +"),
    ).length;
    lines.push(
      `  Barramentos Superior +, Superior −, Inferior + e Inferior −: ${rails ? `contatos 1 a ${rails} em cada barramento` : "sem contatos de barramento"}.`,
    );
  } else {
    let ground = 0;
    lines.push(
      "  Terminais: " +
        componentPins(component)
          .map((pin) =>
            terminalName(component, pin, pin === "GND" ? ground++ : 0),
          )
          .join(", ") +
        ".",
    );
  }
  if (type === "pot")
    lines.push(
      `  Posição inicial do cursor: ${Math.round((parameters.value ?? 0.5) * 100)}%.`,
    );
  if (type === "sensor")
    lines.push(`  Distância virtual inicial: ${parameters.distanceCm} cm.`);
  if (type === "resistor")
    lines.push("  Resistência: o simulador não valida um valor em ohms.");
  if (type === "servo")
    lines.push(
      "  O firmware determina o ângulo durante a execução; carga e torque não são modelados.",
    );
  return lines.join("\n");
}

export function assemblyGuide(input) {
  const project = validateProject(input);
  const byId = new Map(
    project.components.map((component) => [component.id, component]),
  );
  const describeEnd = (end) => {
    if (end.componentId === null) return "ponta livre";
    const component = byId.get(end.componentId);
    return `${names[component.type]} #${component.id} / ${terminalName(component, end.pin, end.occurrence)}`;
  };
  return [
    `Guia de montagem — ${project.name}`,
    "\nComponentes",
    ...project.components.map((component) =>
      describeComponent({
        ...component,
        parameters:
          component.type === "sensor"
            ? {
                distanceCm: project.environment.distanceCm,
                ...component.parameters,
              }
            : component.parameters,
      }),
    ),
    ...(project.components.length ? [] : ["Nenhum componente."]),
    "\nFios jumper",
    ...project.wires.map(
      ({ id, color, ends }) =>
        `- Fio #${id} (${color}): ${ends.map(describeEnd).join(" ↔ ")}`,
    ),
    ...(project.wires.length ? [] : ["Nenhum fio."]),
    "\nLimites",
    "O GhostLab usa um modelo elétrico simplificado. Este guia descreve ligações virtuais. Confira o pinout das peças reais, a tensão, a corrente e a limitação adequada antes de montar. O simulador não certifica segurança nem prevê aquecimento ou dano físico.",
    "",
  ].join("\n");
}

export function projectDownload(action, input) {
  const project = validateProject(input);
  const stem =
    project.name
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "ghostlab";
  switch (action) {
    case "export":
      return {
        name: `${stem}.ghostlab.json`,
        type: "application/json",
        text: serializeProject(project),
      };
    case "sketch":
      return { name: `${stem}.ino`, type: "text/plain", text: project.code };
    case "guide":
      return {
        name: `${stem}-montagem.txt`,
        type: "text/plain",
        text: assemblyGuide(project),
      };
    default:
      throw new Error("Tipo de download inválido.");
  }
}

export async function importProjectFile(file, { confirm, apply }) {
  if (!file) return false;
  if (file.size > MAX_FILE) throw new Error("Arquivo excede o limite de 1 MB.");
  const project = parseProject(await file.text());
  if (!(await confirm())) return false;
  await apply(project);
  return true;
}

export function downloadProjectFile(document, { name, type, text }) {
  const url = URL.createObjectURL(
    new Blob([text], { type: type + ";charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
