import { compileSketch, toolchain } from "./compiler.js";

// Local development service. Public hosting requires an isolated compiler (#15).
export function compilerMiddleware(req, res, next) {
  if (!["/api/compile", "/api/compiler"].includes(req.url?.split("?")[0]))
    return next();
  const send = (status, body) => {
    if (!res.destroyed && !res.headersSent) {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(body));
    }
  };
  const host = req.headers.host;
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host ?? ""))
    return send(403, {
      message: "Compilação disponível somente no servidor local.",
    });
  if (
    req.headers.origin &&
    req.headers.origin !== `http://${host}` &&
    req.headers.origin !== `https://${host}`
  )
    return send(403, { message: "Origem não permitida." });
  if (req.url.split("?")[0] === "/api/compiler" && req.method === "GET")
    return send(200, { toolchain, mode: "local" });
  if (req.method !== "POST")
    return send(405, { message: "Método não permitido." });
  if (!req.headers["content-type"]?.startsWith("application/json"))
    return send(415, { message: "Envie JSON." });
  let size = 0,
    chunks = [],
    ended = false;
  const abort = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) abort.abort();
  });
  req.on("data", (chunk) => {
    if (ended) return;
    size += chunk.length;
    if (size > 40_000) {
      ended = true;
      send(413, { message: "Sketch excedeu o limite de tamanho." });
      req.resume();
    } else chunks.push(chunk);
  });
  req.on("error", () => abort.abort());
  req.on("end", async () => {
    if (ended) return;
    let source;
    try {
      source = JSON.parse(Buffer.concat(chunks).toString("utf8")).source;
    } catch {
      return send(400, { message: "JSON inválido." });
    }
    try {
      send(200, await compileSketch(source, { signal: abort.signal }));
    } catch (error) {
      send(
        error.code === "busy" ? 429 : error.code === "unavailable" ? 503 : 422,
        {
          message: error.message,
          code: error.code,
          diagnostics: error.diagnostics ?? [],
        },
      );
    }
  });
}
