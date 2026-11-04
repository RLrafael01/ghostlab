export function createJumperHelp(host) {
  const document = host.ownerDocument;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "jumper-help";
  button.setAttribute("aria-expanded", "true");
  button.setAttribute("aria-label", "Recolher instruções dos jumpers");
  button.innerHTML = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-5 3h4M8.5 15.5C7 14.4 5.8 12.8 5.8 10.5a6.2 6.2 0 1 1 12.4 0c0 2.3-1.2 3.9-2.7 5L15 18H9z"/></svg>`;
  const status = document.createElement("span");
  status.className = "jumper-status";
  status.setAttribute("role", "status");
  status.textContent = "Cabos: arraste uma ponta colorida para outro contato";
  button.append(status);
  host.append(button);
  const shell = host.closest("main");
  const toolbar = shell?.querySelector(".toolbar");
  const tag = host.querySelector(".scene-tag");
  const inspector = shell?.querySelector(".inspector");
  let expanded = true;

  function layout() {
    const bounds = host.getBoundingClientRect();
    const fullscreen = document.fullscreenElement === shell;
    let top = tag ? tag.getBoundingClientRect().bottom - bounds.top + 12 : 20;
    if (fullscreen && toolbar)
      top = Math.max(
        top,
        toolbar.getBoundingClientRect().bottom - bounds.top + 12,
      );
    button.style.top = `${top}px`;
    let available = bounds.width - 40;
    if (fullscreen && inspector && !inspector.hidden) {
      const panel = inspector.getBoundingClientRect();
      if (panel.width)
        available = Math.min(available, panel.left - bounds.left - 32);
    }
    status.style.maxWidth = `${Math.max(100, available - 54)}px`;
    const width = expanded
      ? Math.min(available, status.getBoundingClientRect().width + 54)
      : 42;
    button.style.width = `${Math.max(42, width)}px`;
  }
  button.addEventListener("click", () => {
    expanded = !expanded;
    button.setAttribute("aria-expanded", String(expanded));
    button.setAttribute(
      "aria-label",
      expanded
        ? "Recolher instruções dos jumpers"
        : "Mostrar instruções dos jumpers",
    );
    status.setAttribute("aria-hidden", String(!expanded));
    layout();
  });
  const resize = new ResizeObserver(layout);
  for (const element of [host, toolbar, tag, inspector])
    if (element) resize.observe(element);
  new window.MutationObserver(layout).observe(status, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  document.addEventListener("fullscreenchange", layout);
  layout();
  return status;
}
