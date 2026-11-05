import { access, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

// This adapter is deliberately fail-closed. Ordinary local development does not
// opt into it; the public demo always does, and cannot fall back to host access.
export async function compilerSandbox({ toolRoot, work }) {
  if (process.platform !== "darwin")
    throw new Error(
      "A demonstração pública exige o sandbox macOS validado neste projeto.",
    );
  await access("/usr/bin/sandbox-exec", constants.X_OK);
  const job = await realpath(work);
  const root = await realpath(toolRoot);
  const readPaths = [
    "/System/Library",
    "/usr/lib",
    "/usr/bin",
    "/bin",
    "/usr/share",
    "/Library/Apple",
    "/private/var/db/dyld",
    "/private/var/db/oah",
    "/System/Cryptexes/OS",
    "/System/Volumes/Preboot/Cryptexes/OS",
    resolve(root, "bin"),
    resolve(root, "arduino-data"),
    resolve(root, "arduino-user"),
    job,
  ];
  const profile = `(version 1)
(deny default)
(allow process-exec process-fork sysctl-read file-map-executable)
(allow file-read-metadata)
(allow file-read-data ${readPaths.map((path) => `(subpath ${JSON.stringify(path)})`).join(" ")}
  (literal "/") (literal "/dev/null") (literal "/dev/random") (literal "/dev/urandom"))
(allow file-write* (subpath ${JSON.stringify(job)}) (literal "/dev/null"))
`;
  return {
    command: "/usr/bin/sandbox-exec",
    // Fixed shell program; the executable and its arguments are positional,
    // never interpolated. Children inherit CPU and per-file size limits.
    prefix: [
      "-p",
      profile,
      "/bin/sh",
      "-c",
      'ulimit -f 32768 && ulimit -t 30 && exec "$@"',
      "ghostlab-compiler",
    ],
    job,
  };
}
