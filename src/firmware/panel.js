import { examples } from "./examples.js";
import { createCompilerClient } from "./compiler-client.js";
import { createFirmwareSession } from "./session.js";
export function setupFirmwarePanel({
  editor,
  container,
  status,
  getTarget = () => null,
  onOutput = () => {},
  base = "./",
}) {
  const document = container.ownerDocument;
  container.innerHTML = `<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(
    examples,
  )
    .map(([id, e]) => `<option value="${id}">${e.name}</option>`)
    .join(
      "",
    )}<option value="custom" disabled>Personalizado</option></select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">LED no D9 com resistor e GND. Os exemplos originais têm firmware pronto para testar; compilar alterações requer o servidor local.</p>`;
  const select = container.querySelector("select"),
    run = container.querySelector('[data-action="run"]'),
    stop = container.querySelector('[data-action="stop"]'),
    restart = container.querySelector('[data-action="restart"]'),
    message = container.querySelector(".firmware-state"),
    errors = container.querySelector("details");
  let target;
  const session = createFirmwareSession({
    compile: createCompilerClient({ base }),
    createRunner(hex, output, error) {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
      worker.onmessage = ({ data }) =>
        data.error ? error(data.error) : output(data.output);
      worker.onerror = () =>
        error("Falha ao executar firmware. Pare e tente novamente.");
      worker.postMessage({ hex });
      return { terminate: () => worker.terminate() };
    },
    onChange(state) {
      const dirty =
        state.executedRevision !== null &&
        state.revision !== state.executedRevision;
      message.textContent =
        state.message +
        (state.phase === "running"
          ? ` Rev. ${state.executedRevision}${dirty ? " · código editado, compile para aplicar" : ""}`
          : "");
      status.textContent =
        state.phase === "running"
          ? `UNO · executando${dirty ? " versão anterior" : ""}`
          : state.phase === "compiling"
            ? "UNO · compilando"
            : "UNO · parado";
      stop.disabled = !["running", "compiling"].includes(state.phase);
      run.disabled = state.phase === "compiling";
      restart.disabled =
        state.executedRevision === null || dirty || state.phase === "compiling";
      errors.hidden = state.diagnostics.length === 0;
      errors.open = state.diagnostics.length > 0;
      errors.querySelector("pre").textContent = state.diagnostics.join("\n");
      onOutput(state.output ? { ...state.output, unoId: target } : null);
    },
  });
  function editSource() {
    const match = Object.entries(examples).find(
      ([, example]) => example.source === editor.value,
    );
    select.value = match?.[0] ?? "custom";
    session.edit(editor.value);
  }
  editor.value = examples.blink.source;
  editSource();
  editor.addEventListener("input", editSource);
  select.addEventListener("change", () => {
    const example = examples[select.value];
    if (!example) {
      editSource();
      return;
    }
    session.stop();
    editor.value = example.source;
    editSource();
  });
  run.addEventListener("click", () => {
    target = getTarget();
    session.execute();
  });
  stop.addEventListener("click", () => session.stop());
  restart.addEventListener("click", () => session.restart());
  window.addEventListener("pagehide", () => session.stop());
  return session;
}
