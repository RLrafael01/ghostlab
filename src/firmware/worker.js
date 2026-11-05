import { runFirmwareWorker } from "./worker-runtime.js";
let runner;
self.onmessage = ({ data }) => {
  try {
    if (data.type === "inputs") runner?.setInputs(data.inputs);
    else if (data.hex) {
      runner?.stop();
      runner = runFirmwareWorker(
        data.hex,
        (output) => self.postMessage({ output }),
        data.inputs,
      );
    }
  } catch (error) {
    runner?.stop();
    self.postMessage({ error: error.message });
  }
};
