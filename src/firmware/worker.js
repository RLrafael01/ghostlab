import { runFirmwareWorker } from "./worker-runtime.js";
self.onmessage = ({ data }) => {
  try {
    runFirmwareWorker(data.hex, (output) => self.postMessage({ output }));
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
