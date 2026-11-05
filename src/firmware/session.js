export function createFirmwareSession({
  compile,
  createRunner,
  onChange = () => {},
}) {
  let generation = 0,
    request,
    runner,
    artifact,
    executedSource;
  let inputs = {},
    inputSignature = "{}";
  let state = {
    phase: "idle",
    source: "",
    revision: 0,
    executedRevision: null,
    output: null,
    message: "Pronto para executar.",
    diagnostics: [],
    origin: null,
    serial: { text: "", dropped: 0, droppedBytes: 0, baud: null, session: 0 },
  };
  const emit = () => onChange({ ...state });
  function halt() {
    generation++;
    request?.abort();
    request = null;
    runner?.terminate();
    runner = null;
    state.output = null;
  }
  function start(binary, revision) {
    const id = ++generation;
    state.phase = "running";
    state.executedRevision = revision;
    state.origin = binary.origin;
    state.serial = {
      text: "",
      dropped: 0,
      droppedBytes: 0,
      baud: null,
      session: state.serial.session + 1,
    };
    state.message =
      binary.origin === "example"
        ? "Executando firmware pré-compilado deste exemplo."
        : binary.origin === "remote-compiler"
          ? "Executando código compilado no serviço de demonstração."
          : "Executando código compilado no servidor local.";
    const fail = (error) => {
      if (generation !== id) return;
      halt();
      state.phase = "error";
      state.message = String(error);
      emit();
    };
    try {
      runner = createRunner(
        binary.hex,
        (output) => {
          if (generation === id) {
            const text = state.serial.text + (output.serial?.text ?? "");
            const discarded = Math.max(0, text.length - 8192);
            state.serial = {
              ...state.serial,
              text: text.slice(-8192),
              dropped: state.serial.dropped + discarded,
              droppedBytes:
                state.serial.droppedBytes + (output.serial?.dropped ?? 0),
              baud: output.serial?.baud ?? state.serial.baud,
            };
            state.output = output;
            emit();
          }
        },
        fail,
        inputs,
      );
      emit();
    } catch (error) {
      fail(error);
    }
  }
  return {
    snapshot: () => ({ ...state }),
    setInputs(next) {
      const signature = JSON.stringify(next);
      if (signature === inputSignature) return;
      inputs = JSON.parse(signature);
      inputSignature = signature;
      runner?.setInputs?.(inputs);
    },
    clearSerial() {
      state.serial = { ...state.serial, text: "", dropped: 0, droppedBytes: 0 };
      emit();
    },
    edit(source) {
      if (source === state.source) return;
      state.source = source;
      state.revision++;
      if (state.phase === "compiling") {
        halt();
        state.phase = "idle";
        state.message = "Código alterado; compile novamente.";
      }
      emit();
    },
    async execute() {
      halt();
      state.phase = "compiling";
      state.diagnostics = [];
      state.message = "Compilando o código…";
      emit();
      const id = generation,
        source = state.source,
        revision = state.revision;
      request = new AbortController();
      try {
        const binary = await compile(source, { signal: request.signal });
        if (id !== generation || source !== state.source) return;
        artifact = binary;
        executedSource = source;
        request = null;
        start(binary, revision);
      } catch (error) {
        if (id !== generation) return;
        state.phase = "error";
        state.message = error.message;
        state.diagnostics = error.diagnostics ?? [];
        emit();
      }
    },
    stop() {
      halt();
      state.phase = "stopped";
      state.message = "Execução parada · GPIO sem sinal ativo.";
      emit();
    },
    restart() {
      if (!artifact || executedSource !== state.source) {
        state.message = "Compile o código atual antes de reiniciar.";
        emit();
        return;
      }
      halt();
      state.diagnostics = [];
      start(artifact, state.revision);
    },
  };
}
