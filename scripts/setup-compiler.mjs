import { mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { toolRoot, toolEnvironment, toolchain } from "../server/compiler.js";
const bundles = {
  "darwin-arm64": [
    "macOS_ARM64",
    "cb952e8c1621c95ef5f1d17831c945e3d0ec5973f89c557a7ec8feb9c4f7d4c9",
  ],
  "linux-x64": [
    "Linux_64bit",
    "28a8e119c498a25607821c36cb2dc49e8463941b261a0d99091baa7bc692dd2b",
  ],
};
const target = bundles[`${process.platform}-${process.arch}`];
if (!target)
  throw new Error(
    "Setup automático disponível para macOS Apple Silicon e Linux x64 (Windows: usar WSL2).",
  );
for (const dir of ["bin", "arduino-data", "arduino-downloads", "arduino-user"])
  await mkdir(resolve(toolRoot, dir), { recursive: true });
const cli = resolve(toolRoot, "bin/arduino-cli");
let installed = false;
try {
  installed =
    JSON.parse(
      execFileSync(cli, ["version", "--format", "json"], { encoding: "utf8" }),
    ).VersionString === toolchain.cli;
} catch {}
if (!installed) {
  const response = await fetch(
    `https://github.com/arduino/arduino-cli/releases/download/v${toolchain.cli}/arduino-cli_${toolchain.cli}_${target[0]}.tar.gz`,
  );
  if (!response.ok) throw new Error(`Download falhou: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash("sha256").update(bytes).digest("hex") !== target[1])
    throw new Error("Checksum do Arduino CLI divergente.");
  const archive = resolve(toolRoot, "cli.tar.gz");
  await writeFile(archive, bytes);
  execFileSync("tar", [
    "-xzf",
    archive,
    "-C",
    resolve(toolRoot, "bin"),
    "arduino-cli",
  ]);
  await rm(archive);
}
const options = { env: toolEnvironment, stdio: "inherit" };
execFileSync(cli, ["core", "update-index"], options);
execFileSync(cli, ["core", "install", toolchain.core], options);
for (const [name, version] of Object.entries(toolchain.libraries))
  execFileSync(cli, ["lib", "install", `${name}@${version}`], options);
console.log(
  "Compilador pronto: Arduino CLI " + toolchain.cli + " / " + toolchain.core,
);
