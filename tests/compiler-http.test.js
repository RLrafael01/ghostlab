import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { compilerMiddleware } from "../server/compiler-http.js";
test("serviço local rejeita origens externas, payload excessivo e JSON inválido", async () => {
  const server = http.createServer((req, res) =>
    compilerMiddleware(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(url + "/api/compiler")).status, 200);
    const post = (body, headers = {}) =>
      fetch(url + "/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
    assert.equal(
      (await post("{}", { Origin: "https://untrusted.example" })).status,
      403,
    );
    const badHost = await new Promise((resolve) => {
      const req = http.request(
        url + "/api/compiler",
        { headers: { host: "evil.example" } },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        },
      );
      req.end();
    });
    assert.equal(badHost, 403);
    assert.equal((await post("x".repeat(100_000))).status, 413);
    assert.equal((await post("{broken")).status, 400);
    assert.equal((await post(JSON.stringify({ source: "" }))).status, 422);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
