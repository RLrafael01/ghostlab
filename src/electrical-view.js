import { createCircuitSimulation } from "./electrical-simulation.js";

const reasons = {
  short: "fonte em falha · corrija e reinicie",
  closed: "circuito fechado com resistor",
  open: "circuito aberto ou sem alimentação suportada",
  reversed: "polaridade invertida",
  unlimited: "sem resistor no caminho · fora deste modelo",
  unsupported: "ligações fora do modelo · confira 5 V e GND",
};
const servoReasons = {
  unpowered: "sem alimentação suportada",
  open: "sem sinal conectado",
  "invalid-pulse": "pulsos ausentes ou fora da faixa",
  unsupported: "ligações fora do modelo",
};

export function createElectricalView({
  items,
  wires,
  status,
  getFirmware = () => null,
  onInputs = () => {},
  onState = () => {},
}) {
  const simulation = createCircuitSimulation();
  const details = status.ownerDocument.createElement("details");
  const summary = status.ownerDocument.createElement("summary");
  summary.textContent = "Por que isso aconteceu?";
  const explanation = status.ownerDocument.createElement("p");
  details.append(summary, explanation);
  details.hidden = true;
  status.after(details);
  let previous = "",
    result;
  function peripheral(titleText, detailText) {
    const row = status.ownerDocument.createElement("p");
    row.className = "electrical-peripheral";
    const title = status.ownerDocument.createElement("strong");
    const detail = status.ownerDocument.createElement("span");
    title.textContent = titleText;
    detail.textContent = detailText;
    row.append(title, detail);
    status.append(row);
  }
  return {
    restart() {
      simulation.restart();
      previous = "";
    },
    update() {
      const project = {
        components: items.map(
          ({ id, type, columns, pressed, value, distanceCm }) => ({
            id,
            type,
            columns,
            pressed,
            value,
            distanceCm,
          }),
        ),
        wires: wires.connections(),
      };
      const firmware = getFirmware();
      const signature = JSON.stringify([
        project,
        firmware?.unoId,
        firmware?.pins,
        firmware?.analogReadings,
        firmware?.echoReadings,
      ]);
      if (signature === previous) return result;
      previous = signature;
      result = simulation.evaluate(project, firmware);
      const wireIds = new Set(result.faults.flatMap((fault) => fault.wireIds));
      for (const mesh of wires.meshes ?? []) {
        mesh.material.emissive.set("#ff3322");
        mesh.material.emissiveIntensity = wireIds.has(mesh.userData.wireId)
          ? 1.5
          : 0;
      }
      details.hidden = result.faults.length === 0;
      if (details.hidden) details.open = false;
      const message = result.faults
        .map(
          ({ id }) =>
            `Uno #${id}: um caminho direto uniu 5 V a GND. Retire o jumper do caminho destacado e reinicie. O modelo não calcula corrente ou aquecimento.`,
        )
        .join(" ");
      if (explanation.textContent !== message)
        explanation.textContent = message;
      onInputs(result.inputs);
      onState(result);
      status.replaceChildren();
      if (!(
        result.leds?.length ||
        result.buttons?.length ||
        result.pots?.length ||
        result.servos?.length ||
        result.sensors?.length
      ))
        status.textContent = "Adicione um LED para testar o circuito.";
      for (const led of result.leds ?? []) {
        const item = items.find((item) => item.id === led.id);
        item.group.traverse((object) => {
          if (!object.userData.ledLens) return;
          object.material.emissive.set("#ff1528");
          object.material.emissiveIntensity =
            (led.brightness ?? (led.on ? 1 : 0)) * 2.5;
        });
        const row = status.ownerDocument.createElement("p");
        row.className = "electrical-led";
        row.dataset.on = String(led.on);
        const title = status.ownerDocument.createElement("strong");
        title.textContent = `LED #${led.id} · ${led.on ? "aceso" : "apagado"}`;
        const reason = status.ownerDocument.createElement("span");
        reason.textContent =
          (led.brightness !== undefined
            ? `Brilho: ${Math.round(led.brightness * 100)}% · `
            : "") + reasons[led.reason];
        row.append(title, reason);
        status.append(row);
      }
      for (const button of result.buttons ?? []) {
        peripheral(
          `Botão #${button.id} · ${button.pressed ? "pressionado" : "solto"}`,
          `Pares internos: 1/3 e 2/4${button.reason === "unsupported" ? " · ligações fora do modelo" : ""}`,
        );
      }
      for (const pot of result.pots ?? []) {
        const voltage = Number.isFinite(pot.voltage)
          ? `${pot.voltage.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} V`
          : pot.reason === "unsupported"
            ? "ligações fora do modelo"
            : "sem alimentação suportada";
        peripheral(
          `Potenciômetro #${pot.id} · ${Math.round(pot.value * 100)}%`,
          `Tensão modelada: ${voltage}`,
        );
      }
      for (const sensor of result.sensors ?? []) {
        const reading = firmware?.echoReadings?.[sensor.id];
        const state = {
          ready: "aguardando pulso",
          open: "Trig/Echo desconectado",
          unpowered: "sem alimentação",
          "out-of-range": "fora da faixa",
        }[sensor.reason];
        peripheral(
          `Sensor #${sensor.id} · objeto a ${sensor.distanceCm} cm`,
          sensor.reason === "ready" && reading != null
            ? `Eco: ${reading.toFixed(1)} cm`
            : state,
        );
      }
      for (const servo of result.servos ?? []) {
        peripheral(
          `Servo #${servo.id} · ${servo.active ? "ativo" : "inativo"}`,
          servo.active
            ? `Alvo: ${Math.round(servo.angle)}° · resposta visual: 300°/s`
            : `${servoReasons[servo.reason] ?? "sem atuação"} · mantém última posição`,
        );
      }
      if (result.unsupportedInputs?.length) {
        peripheral(
          "Entradas em conflito · fora do modelo",
          result.unsupportedInputs.join(" · "),
        );
      }
      const inputs = Object.entries(firmware?.pins ?? {}).filter(
        ([name, pin]) =>
          !pin.output &&
          (pin.input === 0 || pin.input === 1) &&
          !result.unsupportedInputs?.includes(name) &&
          (pin.pullup ||
            result.inputs?.digital?.[name] != null ||
            result.inputs?.analog?.[name] != null),
      );
      if (inputs.length) {
        peripheral(
          "Entradas GPIO · firmware",
          inputs
            .map(
              ([name, pin]) =>
                `${name}: ${pin.input ? "HIGH" : "LOW"}${pin.pullup ? " (INPUT_PULLUP)" : ""}`,
            )
            .join(" · "),
        );
      }
      for (const [name, reading] of Object.entries(
        firmware?.analogReadings ?? {},
      )) {
        const time = (reading.milliseconds / 1000).toLocaleString("pt-BR", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        });
        peripheral(
          "Última conversão ADC · firmware",
          `${name}: ${reading.value}/1023 · t=${time} s${result.inputs?.analog?.[name] == null ? " · entrada sem tensão válida; fallback 0 V" : ""}`,
        );
      }
      return result;
    },
  };
}
