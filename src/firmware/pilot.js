import { setupFirmwarePanel } from "./panel.js";
import "./style.css";
setupFirmwarePanel({
  editor: document.querySelector("textarea"),
  container: document.querySelector("#pilot-controls"),
  status: document.querySelector("#pilot-status"),
  base: import.meta.env.BASE_URL,
  getTarget: () => "pilot-uno",
  onOutput(output) {
    const pin = output?.pins.D9,
      brightness = pin?.output ? pin.duty : 0;
    document.querySelector(".pilot-led").style.opacity =
      0.15 + 0.85 * brightness;
    document.querySelector("#pilot-reading").textContent =
      `D9: ${Math.round(brightness * 100)}% · tempo virtual: ${((output?.milliseconds ?? 0) / 1000).toFixed(2)} s`;
  },
});
