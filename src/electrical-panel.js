export function setupElectricalPanel(panel) {
  const toggle = panel.querySelector(".electrical-toggle");
  const content = panel.querySelector("#electrical-body");
  function setExpanded(expanded) {
    content.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute(
      "aria-label",
      expanded ? "Recolher estado elétrico" : "Mostrar estado elétrico",
    );
    panel.classList.toggle("is-collapsed", !expanded);
  }
  panel.addEventListener("click", (event) => {
    if (event.target.closest("details, a, input, select, textarea")) return;
    setExpanded(content.hidden);
  });
  setExpanded(true);
}
