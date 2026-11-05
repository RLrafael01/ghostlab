import { examples } from "./examples.js";
export function createCompilerClient({ base = "./", request = fetch } = {}) {
  return async function compile(source, { signal } = {}) {
    let response;
    try {
      response = await request("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
        signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
    }
    if (response?.headers.get("content-type")?.includes("application/json")) {
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(result.message || "Falha na compilação.");
        error.diagnostics = result.diagnostics;
        throw error;
      }
      const hash = await sourceHash(source);
      if (result.sourceHash !== hash || typeof result.hex !== "string")
        throw new Error("O firmware recebido não corresponde ao código atual.");
      return { ...result, origin: "compiler" };
    }
    const match = Object.entries(examples).find(
      ([, example]) => example.source === source,
    );
    if (match) {
      const file = await request(`${base}firmware/${match[0]}.json`, {
        signal,
      });
      if (file.ok) {
        const artifact = await file.json();
        if (artifact.sourceHash === (await sourceHash(source)))
          return { ...artifact, origin: "example" };
      }
    }
    throw new Error(
      "Compilador indisponível. No link público, execute os exemplos originais. Para compilar suas alterações, abra o servidor local com npm run dev (veja o README).",
    );
  };
}
async function sourceHash(source) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
