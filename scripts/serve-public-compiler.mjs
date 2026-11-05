import { createPublicCompilerServer } from "../server/public-compiler-http.js";
import { compileSketch } from "../server/compiler.js";

const allowedOrigins = (process.env.GHOSTLAB_COMPILER_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const port = Number(process.env.GHOSTLAB_COMPILER_PORT ?? 8787);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Porta inválida.");
const server = createPublicCompilerServer({ allowedOrigins });
// Fail before opening a socket if the toolchain or isolation cannot run.
await compileSketch("void setup(){} void loop(){}", { isolated: true });
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Compilador isolado de demonstração: http://127.0.0.1:${port} · origens: ${allowedOrigins.join(", ")}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });
