import { parentPort } from "node:worker_threads";
import { runFirmwareWorker } from "../../src/firmware/worker-runtime.js";
let runner;
parentPort.on("message", (data) => {
  if (data?.type === "inputs") runner?.setInputs(data.inputs);
  else {
    runner?.stop();
    runner = runFirmwareWorker(
      typeof data === "string" ? data : data.hex,
      (output) => parentPort.postMessage(output),
      typeof data === "string" ? undefined : data.inputs,
    );
  }
});
