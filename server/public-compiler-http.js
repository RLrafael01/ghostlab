import http from "node:http";
import { compileSketch, toolchain } from "./compiler.js";

export function createPublicCompilerServer({
  allowedOrigins,
  requestsPerMinute = 12,
}) {
  if (
    !Array.isArray(allowedOrigins) ||
    !allowedOrigins.length ||
    allowedOrigins.some(
      (origin) =>
        new URL(origin).origin !== origin || !origin.startsWith("https://"),
    )
  )
    throw new Error("Declare as origens HTTPS permitidas para a demonstração.");
  const origins = new Set(allowedOrigins);
  let windowStart = 0,
    requests = 0;
  const server = http.createServer((req, res) => {
    const path = req.url?.split("?")[0];
    const origin = req.headers.origin;
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Origin",
    };
    const send = (status, body, extra = {}) => {
      if (res.destroyed || res.headersSent) return;
      res.writeHead(status, { ...headers, ...extra });
      res.end(body === undefined ? undefined : JSON.stringify(body));
    };
    if (!origins.has(origin))
      return send(403, { message: "Origem não permitida." });
    headers["Access-Control-Allow-Origin"] = origin;
    if (!["/api/compile", "/api/compiler"].includes(path))
      return send(404, { message: "Rota inexistente." });
    if (req.method === "OPTIONS")
      return send(204, undefined, {
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "300",
      });
    if (path === "/api/compiler" && req.method === "GET")
      return send(200, {
        mode: "demo",
        toolchain,
        limits: {
          sourceBytes: 32768,
          timeoutSeconds: 30,
          memoryMiB: 512,
          concurrency: 1,
          requestsPerMinute,
        },
        availability:
          "Disponível enquanto o computador da demonstração e o túnel estiverem ligados.",
      });
    if (path !== "/api/compile" || req.method !== "POST")
      return send(405, { message: "Método não permitido." });
    const now = Date.now();
    if (now - windowStart >= 60_000) {
      windowStart = now;
      requests = 0;
    }
    if (++requests > requestsPerMinute)
      return send(
        429,
        {
          message:
            "Limite da demonstração atingido. Aguarde um minuto e tente novamente.",
          code: "rate-limit",
        },
        { "Retry-After": "60" },
      );
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return send(415, { message: "Envie JSON." });
    let size = 0,
      ended = false,
      chunks = [];
    const abort = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) abort.abort();
    });
    req.on("error", () => abort.abort());
    req.on("data", (chunk) => {
      if (ended) return;
      size += chunk.length;
      if (size > 40_000) {
        ended = true;
        chunks = [];
        send(413, {
          message: "Sketch excedeu o limite de tamanho.",
          code: "invalid-source",
        });
      } else chunks.push(chunk);
    });
    req.on("end", async () => {
      if (ended) return;
      let source;
      try {
        source = JSON.parse(Buffer.concat(chunks).toString("utf8")).source;
      } catch {
        return send(400, { message: "JSON inválido." });
      }
      try {
        send(
          200,
          await compileSketch(source, { isolated: true, signal: abort.signal }),
        );
      } catch (error) {
        send(
          error.code === "busy"
            ? 429
            : error.code === "unavailable"
              ? 503
              : 422,
          {
            message: error.message,
            code: error.code,
            diagnostics: error.diagnostics ?? [],
          },
        );
      }
    });
  });
  server.requestTimeout = 10_000;
  server.headersTimeout = 5_000;
  server.maxConnections = 16;
  return server;
}
