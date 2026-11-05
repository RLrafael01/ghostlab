import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const toolRoot = fileURLToPath(new URL("../.tools/", import.meta.url));
export const toolEnvironment = {
  PATH: process.env.PATH,
  HOME: toolRoot,
  TMPDIR: toolRoot,
  ARDUINO_DIRECTORIES_DATA: resolve(toolRoot, "arduino-data"),
  ARDUINO_DIRECTORIES_DOWNLOADS: resolve(toolRoot, "arduino-downloads"),
  ARDUINO_DIRECTORIES_USER: resolve(toolRoot, "arduino-user"),
};
export const toolchain = {
  cli: "1.5.1",
  core: "arduino:avr@1.8.6",
  fqbn: "arduino:avr:uno",
};
export class CompilationError extends Error {
  constructor(message, code = "compile-error", diagnostics = []) {
    super(message);
    this.code = code;
    this.diagnostics = diagnostics;
  }
}
let busy = false;
export async function compileSketch(
  source,
  { signal, timeoutMs = 30_000 } = {},
) {
  if (
    typeof source !== "string" ||
    !source.trim() ||
    Buffer.byteLength(source) > 32_768
  )
    throw new CompilationError(
      "O sketch deve conter entre 1 e 32768 bytes.",
      "invalid-source",
    );
  if (busy)
    throw new CompilationError(
      "Já existe uma compilação em andamento. Tente novamente.",
      "busy",
    );
  if (signal?.aborted)
    throw new CompilationError("Compilação cancelada.", "cancelled");
  busy = true;
  let work;
  try {
    await mkdir(resolve(toolRoot, "jobs"), { recursive: true });
    work = await mkdtemp(resolve(toolRoot, "jobs/job-"));
    const sketch = resolve(work, "sketch");
    await mkdir(sketch);
    await writeFile(resolve(sketch, "sketch.ino"), source);
    await runCompiler(
      [
        "compile",
        "--fqbn",
        toolchain.fqbn,
        "--jobs",
        "1",
        "--warnings",
        "all",
        "--build-path",
        resolve(work, "build"),
        "--output-dir",
        resolve(work, "out"),
        sketch,
      ],
      { signal, timeoutMs, work },
    );
    const hex = await readFile(resolve(work, "out/sketch.ino.hex"), "utf8");
    return {
      hex,
      sourceHash: createHash("sha256").update(source).digest("hex"),
      toolchain,
    };
  } finally {
    if (work) await rm(work, { recursive: true, force: true });
    busy = false;
  }
}
function runCompiler(args, { signal, timeoutMs, work }) {
  return new Promise((accept, reject) => {
    const child = spawn(resolve(toolRoot, "bin/arduino-cli"), args, {
      env: toolEnvironment,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "",
      failed;
    const stop = (error) => {
      failed ??= error;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        /* Process already exited. */
      }
    };
    const cancel = () =>
      stop(new CompilationError("Compilação cancelada.", "cancelled"));
    const timer = setTimeout(
      () =>
        stop(
          new CompilationError(
            "Compilação excedeu o limite de tempo.",
            "timeout",
          ),
        ),
      timeoutMs,
    );
    // Bound the whole compiler process group, including avr-g++ children.
    const monitor = setInterval(() => {
      if (!child.pid) return;
      const ps = spawn("ps", ["-eo", "pgid=,rss="], {
        stdio: ["ignore", "pipe", "ignore"],
      });
      let stats = "";
      ps.stdout.on("data", (chunk) => {
        stats += chunk;
      });
      ps.on("error", () =>
        stop(
          new CompilationError(
            "Não foi possível aplicar o limite de memória.",
            "resource-limit",
          ),
        ),
      );
      ps.on("close", (code) => {
        if (code !== 0) return;
        const kb = stats
          .trim()
          .split("\n")
          .reduce((sum, row) => {
            const [pgid, rss] = row.trim().split(/\s+/).map(Number);
            return sum + (pgid === child.pid ? rss : 0);
          }, 0);
        if (kb > 512 * 1024)
          stop(
            new CompilationError(
              "Compilação excedeu 512 MiB de memória.",
              "resource-limit",
            ),
          );
      });
    }, 250);
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
    const append = (chunk) => {
      output += chunk.toString();
      if (Buffer.byteLength(output) > 65_536)
        stop(
          new CompilationError(
            "Diagnóstico excedeu o limite de saída.",
            "resource-limit",
          ),
        );
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const clean = () => {
      clearTimeout(timer);
      clearInterval(monitor);
      signal?.removeEventListener("abort", cancel);
    };
    child.on("error", () => {
      clean();
      reject(
        new CompilationError(
          "Compilador não instalado. Execute npm run setup:compiler.",
          "unavailable",
        ),
      );
    });
    child.on("close", (code) => {
      clean();
      if (failed) return reject(failed);
      if (code === 0) return accept();
      const diagnostics = output
        .slice(0, 65_536)
        .replaceAll(work, "<projeto>")
        .trim()
        .split("\n");
      reject(
        new CompilationError(
          "O sketch não compilou. Confira os diagnósticos.",
          "compile-error",
          diagnostics,
        ),
      );
    });
  });
}
