const GPIO = Array.from({ length: 20 }, (_, i) =>
  i < 14 ? `D${i}` : `A${i - 14}`,
);

// Connectivity adapter for the supported peripherals, not an analog solver.
export function simulatePeripherals({ components, firmware, pin, reachable, disabledSources }) {
  const unos = components.filter((component) => component.type === "uno");
  const active =
    firmware?.unoId === undefined
      ? unos[0]
      : unos.find((component) => component.id === firmware.unoId);
  const drivers = unos.filter((uno) => !disabledSources?.has(uno.id)).flatMap((uno) => [
    { node: pin(uno, "5V"), unoId: uno.id, voltage: 5, kind: "power" },
    { node: pin(uno, "GND"), unoId: uno.id, voltage: 0, kind: "ground" },
    ...Object.entries(firmware?.unoId === uno.id ? (firmware.pins ?? {}) : {})
      .filter(([name, value]) => GPIO.includes(name) && value.output)
      .map(([name, value]) => ({
        node: pin(uno, name),
        unoId: uno.id,
        voltage: value.level * 5,
        kind: "gpio",
        name,
      })),
  ]);
  function signal(node, direct = false) {
    const connected = reachable(node, !direct);
    const references = drivers.filter((driver) => connected.has(driver.node));
    const unsupported =
      references.some((driver) => driver.unoId !== active?.id) ||
      references.some((driver) => !Number.isFinite(driver.voltage)) ||
      new Set(references.map((driver) => driver.voltage)).size > 1;
    const voltage = unsupported ? null : (references[0]?.voltage ?? null);
    return {
      level: voltage === 5 ? 1 : voltage === 0 ? 0 : null,
      voltage,
      unsupported,
      references,
    };
  }
  function power(component, supply) {
    const positive = signal(pin(component, supply), true);
    const ground = signal(pin(component, "GND"), true);
    const unsupported = positive.unsupported || ground.unsupported;
    return {
      powered:
        !unsupported &&
        positive.references.some((driver) => driver.kind === "power") &&
        ground.references.some((driver) => driver.kind === "ground"),
      unsupported,
    };
  }
  const pots = components
    .filter((component) => component.type === "pot")
    .map((pot) => {
      const state = power(pot, "VCC");
      const value = Number.isFinite(pot.value)
        ? Math.max(0, Math.min(1, pot.value))
        : 0.5;
      return {
        id: pot.id,
        value,
        powered: state.powered,
        voltage: state.powered ? value * 5 : null,
        reason: state.unsupported
          ? "unsupported"
          : state.powered
            ? "powered"
            : "unpowered",
      };
    });
  for (const pot of pots) {
    if (!pot.powered) continue;
    drivers.push({
      node: pin(
        components.find((component) => component.id === pot.id),
        "Sinal",
      ),
      unoId: active.id,
      voltage: pot.voltage,
      kind: "pot",
    });
  }
  for (const pot of pots) {
    const component = components.find((component) => component.id === pot.id);
    if (signal(pin(component, "Sinal")).unsupported) {
      pot.voltage = null;
      pot.reason = "unsupported";
    }
  }
  const digital = active
    ? Object.fromEntries(
        GPIO.map((name) => [name, signal(pin(active, name)).level]),
      )
    : {};
  const analog = active
    ? Object.fromEntries(
        GPIO.filter((name) => name.startsWith("A")).map((name) => [
          name,
          signal(pin(active, name)).voltage,
        ]),
      )
    : {};
  const servos = components
    .filter((component) => component.type === "servo")
    .map((servo) => {
      const supply = power(servo, "5V");
      const connected = signal(pin(servo, "Sinal"));
      const driver =
        connected.references.length === 1 &&
        connected.references[0].kind === "gpio"
          ? connected.references[0]
          : null;
      const pulse = driver ? firmware.pins[driver.name] : null;
      // Servo.h trims about 2 us from its nominal 544–2400 us pulse range.
      const valid =
        pulse &&
        Number.isFinite(pulse.pulseWidthUs) &&
        pulse.pulseWidthUs >= 542 &&
        pulse.pulseWidthUs <= 2402 &&
        Number.isFinite(pulse.pulsePeriodUs) &&
        pulse.pulsePeriodUs >= 18_000 &&
        pulse.pulsePeriodUs <= 25_000 &&
        Number.isFinite(pulse.pulseAgeMs) &&
        pulse.pulseAgeMs >= 0 &&
        pulse.pulseAgeMs <= 60;
      const unsupported =
        supply.unsupported ||
        connected.unsupported ||
        (connected.references.length > 0 && !driver);
      const active = supply.powered && !unsupported && !!valid;
      return {
        id: servo.id,
        powered: supply.powered,
        active,
        angle: active
          ? ((Math.max(544, Math.min(2400, pulse.pulseWidthUs)) - 544) * 180) /
            1856
          : null,
        reason: unsupported
          ? "unsupported"
          : !supply.powered
            ? "unpowered"
            : !driver
              ? "open"
              : !valid
                ? "invalid-pulse"
                : "active",
      };
    });
  return {
    inputs: { digital, analog },
    unsupportedInputs: active
      ? GPIO.filter((name) => signal(pin(active, name)).unsupported)
      : [],
    pots,
    servos,
    buttons: components
      .filter((component) => component.type === "button")
      .map((button) => {
        const signals = ["1", "2", "3", "4"].map((name) => [
          name,
          signal(pin(button, name)),
        ]);
        return {
          id: button.id,
          pressed: !!button.pressed,
          signals: Object.fromEntries(
            signals.map(([name, value]) => [name, value.level]),
          ),
          reason: signals.some(([, value]) => value.unsupported)
            ? "unsupported"
            : "connected",
        };
      }),
  };
}
