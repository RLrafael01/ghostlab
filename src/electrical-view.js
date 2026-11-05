import { createCircuitSimulation } from "./electrical-simulation.js";

const reasons = {
  closed: "circuito fechado com resistor",
  open: "circuito aberto ou sem alimentação suportada",
  reversed: "polaridade invertida",
  unlimited: "sem resistor no caminho · fora deste modelo",
  unsupported: "ligações fora do modelo · confira 5 V e GND",
  short: "fonte virtual em falha",
  damaged: "dano virtual · substitua ou restaure",
};

export function createElectricalView({
  items,
  wires,
  status,
  getFirmware = () => null,
  restartFirmware = () => {},
}) {
  const simulation = createCircuitSimulation();
  const explanation = status.ownerDocument.createElement("details");
  const summary = status.ownerDocument.createElement("summary");
  summary.textContent = "Por que isso aconteceu?";
  const messages = status.ownerDocument.createElement("ul");
  const restore = status.ownerDocument.createElement("button");
  restore.type = "button";
  restore.textContent = "Restaurar simulação";
  explanation.append(summary, messages, restore);
  explanation.hidden = true;
  status.after(explanation);
  let previous = "";
  restore.onclick = () => {
    simulation.restore();
    previous = "";
    restartFirmware();
  };
  return {
    restart() {
      simulation.restart();
      previous = "";
    },
    update() {
      const project = {
        components: items.map(({ id, type, columns }) => ({
          id,
          type,
          columns,
        })),
        wires: wires.connections(),
      };
      const firmware = getFirmware();
      const signature = JSON.stringify([
        project,
        firmware?.unoId,
        firmware?.pins,
      ]);
      if (signature === previous) return;
      previous = signature;
      const result = simulation.evaluate(project, firmware);
      const highlighted = new Set(
        result.faults.flatMap((fault) => fault.wireIds ?? []),
      );
      for (const mesh of wires.meshes) {
        mesh.material.emissive.set("#ff3322");
        mesh.material.emissiveIntensity = highlighted.has(mesh.userData.wireId)
          ? 1.5
          : 0;
      }
      explanation.hidden = result.faults.length === 0;
      if (explanation.hidden) explanation.open = false;
      const descriptions = result.faults.map((fault) => {
        const entry = status.ownerDocument.createElement("li");
        entry.textContent =
          fault.kind === "short"
            ? `Uno #${fault.id}: um caminho direto uniu 5 V a GND. Separe os contatos e reinicie para recuperar a fonte virtual.`
            : `LED #${fault.id}: alimentação sem limitação provocou dano virtual. Coloque um resistor em série e substitua o LED ou restaure. O modelo não calcula corrente nem segurança da montagem física.`;
        return entry;
      });
      messages.replaceChildren(...descriptions);
      status.replaceChildren();
      if (!result.leds.length)
        status.textContent = "Adicione um LED para testar o circuito.";
      for (const led of result.leds) {
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
    },
  };
}
