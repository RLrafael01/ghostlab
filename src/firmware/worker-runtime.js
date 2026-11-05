import { UnoSimulation } from "./uno-simulation.js";
export function runFirmwareWorker(hex, send, inputs) {
  const simulation = new UnoSimulation(hex);
  if (inputs) simulation.setInputs(inputs);
  const started = performance.now();
  let reportAt = 0;
  let timer;
  function tick() {
    const elapsed = performance.now() - started;
    const current = simulation.snapshot().milliseconds;
    const reporting = elapsed >= reportAt;
    const output = simulation.advance(
      Math.min(20, Math.max(0, elapsed - current)),
      { drainSerial: reporting },
    );
    if (reporting) {
      send({ ...output, speed: elapsed ? output.milliseconds / elapsed : 1 });
      reportAt = elapsed + 30;
    }
    timer = setTimeout(tick, 0);
  }
  tick();
  return {
    setInputs: (next) => simulation.setInputs(next),
    stop: () => clearTimeout(timer),
  };
}
