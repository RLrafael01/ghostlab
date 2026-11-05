import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createPublicCompilerServer } from "../server/public-compiler-http.js";

test("demonstração permite apenas origens declaradas, limita pedidos e nunca serve arquivos", async () => {
  const origin = "https://rlrafael01.github.io";
  const server = createPublicCompilerServer({
    allowedOrigins: [origin],
    requestsPerMinute: 2,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, from = origin) =>
    fetch(base + "/api/compile", {
      method: "POST",
      headers: { Origin: from, "Content-Type": "application/json" },
      body,
    });
  try {
    const preflight = await fetch(base + "/api/compile", {
      method: "OPTIONS",
      headers: { Origin: origin, "Access-Control-Request-Method": "POST" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    assert.equal((await post("{}", "https://untrusted.example")).status, 403);
    assert.equal(
      (await fetch(base + "/api/compile", { method: "POST", body: "{}" }))
        .status,
      403,
    );
    assert.equal(
      (await fetch(base + "/AGENTS.md", { headers: { Origin: origin } }))
        .status,
      404,
    );
    assert.equal((await post("x".repeat(50_000))).status, 413);
    assert.equal((await post("{broken")).status, 400);
    const limited = await post("{}");
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "60");
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
