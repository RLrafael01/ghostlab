import { simulateCircuit } from "./electrical-simulation.js";

const reasons = {
  closed: "circuito fechado com resistor",
  open: "circuito aberto ou sem alimentação suportada",
  reversed: "polaridade invertida",
  unlimited: "sem resistor no caminho · fora deste modelo",
  unsupported: "ligações fora do modelo · confira 5 V e GND",
};

export function createElectricalView({
  items,
  wires,
  status,
  getFirmware = () => null,
}) {
  let previous = "";
  return {
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
      const result = simulateCircuit(project, firmware);
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
