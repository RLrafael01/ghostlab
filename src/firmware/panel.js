import { examples } from "./examples.js";
import { createConfiguredCompiler } from "./compiler-client.js";
import { createFirmwareSession } from "./session.js";
import { createSerialMonitor } from "./serial-monitor.js";
export function setupFirmwarePanel({
  editor,
  container,
  status,
  getTarget = () => null,
  onRestart = () => {},
  onOutput = () => {},
  onAssemble,
  base = "./",
}) {
  const document = container.ownerDocument;
  container.innerHTML = `<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(
    examples,
  )
    .map(([id, e]) => `<option value="${id}">${e.name}</option>`)
    .join(
      "",
    )}<option value="custom" disabled>Personalizado</option></select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">Escolha um exemplo e monte seu circuito. Botão: segure o topo. Potenciômetro: arraste o eixo ou ajuste no inspetor. A compilação pública depende do serviço de demonstração estar online.</p>`;
  const select = container.querySelector("select"),
    run = container.querySelector('[data-action="run"]'),
    stop = container.querySelector('[data-action="stop"]'),
    restart = container.querySelector('[data-action="restart"]'),
    message = container.querySelector(".firmware-state"),
    errors = container.querySelector("details");
  let target,
    assemble,
    confirmAssembly = false,
    assembling = false;
  const serial = createSerialMonitor(container, () => session.clearSerial());
  const session = createFirmwareSession({
    compile: createConfiguredCompiler({
      base,
      local: import.meta.env?.DEV ?? false,
    }),
    createRunner(hex, output, error, inputs) {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
      worker.onmessage = ({ data }) =>
        data.error ? error(data.error) : output(data.output);
      worker.onerror = () =>
        error("Falha ao executar firmware. Pare e tente novamente.");
      worker.postMessage({ hex, inputs });
      return {
        terminate: () => worker.terminate(),
        setInputs: (next) =>
          worker.postMessage({ type: "inputs", inputs: next }),
      };
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
      run.disabled = assembling || state.phase === "compiling";
      restart.disabled =
        state.executedRevision === null || dirty || state.phase === "compiling";
      errors.hidden = state.diagnostics.length === 0;
      errors.open = state.diagnostics.length > 0;
      errors.querySelector("pre").textContent = state.diagnostics.join("\n");
      serial.update(state.serial);
      onOutput(state.output ? { ...state.output, unoId: target } : null);
    },
  });
  if (onAssemble) {
    assemble = document.createElement("button");
    assemble.type = "button";
    assemble.textContent = "Montar circuito do exemplo";
    container.querySelector(".firmware-actions").append(assemble);
    assemble.addEventListener("click", async () => {
      if (!examples[select.value]) return;
      if (!confirmAssembly) {
        confirmAssembly = true;
        assemble.textContent = "Confirmar: substituir montagem";
        message.textContent =
          "A montagem atual será substituída. Clique novamente no botão para confirmar.";
        return;
      }
      assembling = true;
      assemble.disabled = true;
      run.disabled = true;
      restart.disabled = true;
      select.disabled = true;
      try {
        await onAssemble(select.value);
      } catch {
        message.textContent =
          "Não foi possível montar o exemplo. Tente novamente.";
      } finally {
        assembling = false;
        select.disabled = false;
        run.disabled = false;
        resetAssembly();
      }
    });
  }
  function resetAssembly() {
    confirmAssembly = false;
    if (assemble) {
      assemble.textContent = "Montar circuito do exemplo";
      assemble.disabled = assembling || select.value === "custom";
    }
  }
  function editSource() {
    const match = Object.entries(examples).find(
      ([, example]) => example.source === editor.value,
    );
    select.value = match?.[0] ?? "custom";
    resetAssembly();
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
  function resolveTarget() {
    target = getTarget();
    if (target === null || target === undefined) {
      message.textContent =
        "Adicione um Arduino Uno à bancada antes de executar.";
      return false;
    }
    return true;
  }
  run.addEventListener("click", () => {
    if (resolveTarget()) session.execute();
  });
  stop.addEventListener("click", () => session.stop());
  restart.addEventListener("click", () => {
    if (resolveTarget()) { onRestart(); session.restart(); }
  });
  window.addEventListener("pagehide", () => session.stop());
  return session;
}
