import { breadboardLayout } from "./breadboard-layout.js";

export function simulateCircuit({ components, wires }) {
  const byId = new Map(
    components.map((component) => [component.id, component]),
  );
  const boards = new Map(
    components
      .filter((component) => component.type === "board")
      .map((board) => [
        board.id,
        new Map(
          breadboardLayout(board.columns).terminals.map((terminal) => [
            terminal.name,
            terminal.electricalGroup,
          ]),
        ),
      ]),
  );
  const graph = new Map();
  function node(end) {
    const component = byId.get(end.componentId);
    if (!component || !end.pin) return null;
    const contact =
      component.type === "board"
        ? boards.get(component.id).get(end.pin)
        : end.pin;
    if (!contact) return null;
    return JSON.stringify([end.componentId, contact]);
  }
  function connect(a, b, resistor = false) {
    if (a === null || b === null) return;
    for (const [from, to] of [
      [a, b],
      [b, a],
    ]) {
      if (!graph.has(from)) graph.set(from, []);
      graph.get(from).push({ to, resistor });
    }
  }
  function reachable(start, throughResistors = true) {
    const visited = new Set([start]);
    for (const current of visited)
      for (const edge of graph.get(current) ?? [])
        if (throughResistors || !edge.resistor) visited.add(edge.to);
    return visited;
  }
  const pin = (component, name) =>
    node({ componentId: component.id, pin: name });
  for (const wire of wires) connect(...wire.ends.map(node));
  for (const component of components)
    if (component.type === "resistor")
      connect(pin(component, "1"), pin(component, "2"), true);
  const sources = components
    .filter((component) => component.type === "uno")
    .map((component) => ({
      id: component.id,
      high: reachable(pin(component, "5V")),
      low: reachable(pin(component, "GND")),
      directHigh: reachable(pin(component, "5V"), false),
      directLow: reachable(pin(component, "GND"), false),
    }));
  for (const source of sources)
    source.unsupported =
      [...source.high].some((node) => source.low.has(node)) ||
      sources.some(
        (other) =>
          other !== source &&
          [...source.high, ...source.low].some(
            (node) => other.high.has(node) || other.low.has(node),
          ),
      );
  const leds = components
    .filter((component) => component.type === "led")
    .map((component) => {
      const anode = pin(component, "Ânodo +"),
        cathode = pin(component, "Cátodo −");
      let reason = "open";
      if (
        sources.some(
          (source) =>
            source.unsupported &&
            [anode, cathode].some(
              (node) => source.high.has(node) || source.low.has(node),
            ),
        )
      ) {
        reason = "unsupported";
      } else {
        const forward = sources.find(
          (source) => source.high.has(anode) && source.low.has(cathode),
        );
        if (forward)
          reason =
            forward.directHigh.has(anode) && forward.directLow.has(cathode)
              ? "unlimited"
              : "closed";
        else if (
          sources.some(
            (source) => source.high.has(cathode) && source.low.has(anode),
          )
        )
          reason = "reversed";
      }
      return { id: component.id, on: reason === "closed", reason };
    });
  return {
    leds,
    sources: sources.map(({ id, unsupported }) => ({
      id,
      supported: !unsupported,
    })),
  };
}
