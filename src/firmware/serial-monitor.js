export function createSerialMonitor(container, clear) {
  const document = container.ownerDocument;
  const details = document.createElement("details");
  details.className = "serial-monitor";
  details.innerHTML =
    '<summary>Monitor serial</summary><div class="serial-toolbar"><span></span><button type="button">Limpar monitor serial</button></div><pre tabindex="0" aria-label="Saída do monitor serial"></pre>';
  container.append(details);
  const output = details.querySelector("pre"),
    info = details.querySelector("span");
  details.querySelector("button").addEventListener("click", clear);
  return {
    update({ text, baud, dropped, droppedBytes = 0, session }) {
      const atEnd =
        output.scrollTop + output.clientHeight >= output.scrollHeight - 12;
      if (output.textContent !== text) output.textContent = text;
      info.textContent = `Sessão ${session} · ${baud ? Math.round(baud) + " baud" : "UART aguardando Serial.begin"} · últimos 8192 caracteres${dropped ? " · " + dropped + " caracteres descartados" : ""}${droppedBytes ? " · " + droppedBytes + " bytes descartados na UART" : ""}`;
      if (atEnd) output.scrollTop = output.scrollHeight;
    },
  };
}
