import { UnoSimulation } from "./uno-simulation.js";
export function runFirmwareWorker(hex, send) {
  const simulation = new UnoSimulation(hex);
  const started = performance.now();
  let reportAt = 0;
  function tick() {
    const elapsed = performance.now() - started;
    const current = simulation.snapshot().milliseconds;
    const output = simulation.advance(
      Math.min(20, Math.max(0, elapsed - current)),
    );
    if (elapsed >= reportAt) {
      send({ ...output, speed: elapsed ? output.milliseconds / elapsed : 1 });
      reportAt = elapsed + 30;
    }
    setTimeout(tick, 0);
  }
  tick();
}
