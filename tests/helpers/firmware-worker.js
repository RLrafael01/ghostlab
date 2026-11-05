import { parentPort } from "node:worker_threads";
import { runFirmwareWorker } from "../../src/firmware/worker-runtime.js";
parentPort.once("message", (hex) =>
  runFirmwareWorker(hex, (output) => parentPort.postMessage(output)),
);
