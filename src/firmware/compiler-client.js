import { examples } from "./examples.js";

export function createConfiguredCompiler({
  base = "./",
  request = fetch,
  local = false,
} = {}) {
  if (local) return createCompilerClient({ base, request });
  let pending;
  async function load(signal) {
    let response;
    try {
      response = await request(`${base}compiler-config.json`, {
        cache: "no-store",
        signal: requestSignal(signal, 10_000),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(
        "Configuração do compilador indisponível. Tente novamente; seu código foi preservado.",
      );
    }
    if (response.status === 404) return createCompilerClient({ base, request });
    if (!response.ok)
      throw new Error(
        "Configuração do compilador indisponível. Tente novamente; seu código foi preservado.",
      );
    let config;
    try {
      config = await response.json();
    } catch {
      throw new Error(
        "Configuração do compilador inválida. Seu código foi preservado.",
      );
    }
    if (!config || typeof config.endpoint !== "string" || !config.endpoint)
      throw new Error(
        "Configuração do compilador inválida: informe um endpoint HTTPS.",
      );
    return createCompilerClient({ base, request, endpoint: config.endpoint });
  }
  return async (source, options = {}) => {
    pending ??= load(options.signal).catch((error) => {
      pending = undefined;
      throw error;
    });
    const compile = await pending;
    return compile(source, options);
  };
}

export function createCompilerClient({
  base = "./",
  request = fetch,
  endpoint,
} = {}) {
  if (endpoint) {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.hash)
      throw new Error(
        "O serviço de compilação público deve usar HTTPS, sem credenciais na URL.",
      );
  }
  return async function compile(source, { signal } = {}) {
    let response;
    try {
      response = await request(endpoint || "/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
        signal: requestSignal(signal, 35_000),
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
      return { ...result, origin: endpoint ? "remote-compiler" : "compiler" };
    }
    if (endpoint)
      throw new Error(
        "Serviço de compilação de demonstração indisponível. O computador que o hospeda precisa estar ligado; tente novamente mais tarde. Seu código foi preservado.",
      );
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
export async function loadExampleFirmware(
  source,
  { base = "./", request = fetch, signal } = {},
) {
  const match = Object.entries(examples).find(
    ([, example]) => example.source === source,
  );
  if (!match) throw new Error("O código editado precisa ser compilado.");
  const response = await request(`${base}firmware/${match[0]}.json`, {
    signal: requestSignal(signal, 10_000),
  });
  if (!response.ok) throw new Error("Artefato do exemplo indisponível.");
  const artifact = await response.json();
  if (
    artifact.sourceHash !== (await sourceHash(source)) ||
    typeof artifact.hex !== "string"
  )
    throw new Error("O firmware do exemplo não corresponde ao sketch.");
  return { ...artifact, origin: "example" };
}
function requestSignal(signal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
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
