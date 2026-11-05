import { breadboardLayout } from "./breadboard-layout.js";
import { simulatePeripherals } from "./peripheral-circuit.js";

export function simulateCircuit({ components, wires }, firmware = null) {
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
    else if (component.type === "button") {
      // The CAD labels 1/3 on one side and 2/4 on the opposite side.
      connect(pin(component, "1"), pin(component, "3"));
      connect(pin(component, "2"), pin(component, "4"));
      if (component.pressed) connect(pin(component, "1"), pin(component, "2"));
    }
  const sources = components
    .filter((component) => component.type === "uno")
    .flatMap((component) => {
      const pins = firmware?.unoId === component.id ? firmware.pins : {};
      const drivers = [
        { name: "5V", duty: 1 },
        ...Object.entries(pins ?? {})
          .filter(
            ([name, value]) =>
              /^(D([0-9]|1[0-3])|A[0-5])$/.test(name) && value.output,
          )
          .map(([name, value]) => ({ name, duty: value.duty })),
      ];
      return drivers.map((driver) => ({
        id: component.id,
        brightness: Math.max(0, Math.min(1, driver.duty)),
        high: reachable(pin(component, driver.name)),
        low: reachable(pin(component, "GND")),
        directHigh: reachable(pin(component, driver.name), false),
        directLow: reachable(pin(component, "GND"), false),
      }));
    });
  const overlap = (a, b) => [...a].some((node) => b.has(node));
  for (const source of sources)
    source.unsupported =
      overlap(source.high, source.low) ||
      sources.some(
        (other) =>
          other !== source &&
          (overlap(source.high, other.high) ||
            (other.id !== source.id &&
              (overlap(source.high, other.low) ||
                overlap(source.low, other.high) ||
                overlap(source.low, other.low)))),
      );
  const leds = components
    .filter((component) => component.type === "led")
    .map((component) => {
      const anode = pin(component, "Ânodo +"),
        cathode = pin(component, "Cátodo −");
      let reason = "open",
        brightness = 0;
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
        if (forward) {
          brightness = forward.brightness;
          reason =
            forward.directHigh.has(anode) && forward.directLow.has(cathode)
              ? "unlimited"
              : "closed";
        } else if (
          sources.some(
            (source) => source.high.has(cathode) && source.low.has(anode),
          )
        )
          reason = "reversed";
      }
      if (reason !== "closed") brightness = 0;
      const result = {
        id: component.id,
        on: reason === "closed" && brightness > 0,
        reason,
      };
      return firmware ? { ...result, brightness } : result;
    });
  return {
    ...simulatePeripherals({ components, firmware, pin, reachable }),
    leds,
    sources: [...new Set(sources.map((source) => source.id))].map((id) => ({
      id,
      supported: !sources.some(
        (source) => source.id === id && source.unsupported,
      ),
    })),
  };
}
