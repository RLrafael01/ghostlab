import {
  CPU,
  avrInstruction,
  AVRIOPort,
  AVRTimer,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  PinState,
} from "avr8js";
const HZ = 16_000_000;
const WINDOW = HZ / 50;

function programFromHex(hex) {
  if (typeof hex !== "string" || hex.length > 100_000)
    throw new Error("Firmware HEX inválido.");
  const bytes = new Uint8Array(32768);
  let offset = 0,
    ended = false,
    loaded = false;
  for (const line of hex.trim().split(/\r?\n/)) {
    if (!/^:([0-9a-f]{2})+$/i.test(line) || ended)
      throw new Error("Registro HEX inválido.");
    const record = Uint8Array.from(line.slice(1).match(/../g), (b) =>
      parseInt(b, 16),
    );
    if (
      record.length !== record[0] + 5 ||
      record.reduce((a, b) => a + b, 0) & 255
    )
      throw new Error("Checksum HEX inválido.");
    const count = record[0],
      address = (record[1] << 8) | record[2],
      type = record[3];
    if (type === 0) {
      if (offset + address + count > bytes.length)
        throw new Error("Firmware excede a memória do Uno.");
      bytes.set(record.slice(4, 4 + count), offset + address);
      loaded ||= count > 0;
    } else if (type === 1) ended = true;
    else if (type === 2 || type === 4)
      offset = ((record[4] << 8) | record[5]) * (type === 2 ? 16 : 65536);
    else if (type !== 3 && type !== 5)
      throw new Error("Tipo de registro HEX não suportado.");
  }
  if (!ended || !loaded) throw new Error("Firmware HEX incompleto.");
  return new Uint16Array(bytes.buffer);
}

export class UnoSimulation {
  constructor(hex) {
    this.cpu = new CPU(programFromHex(hex), 2048);
    this.ports = [
      new AVRIOPort(this.cpu, portDConfig),
      new AVRIOPort(this.cpu, portBConfig),
      new AVRIOPort(this.cpu, portCConfig),
    ];
    this.timers = [timer0Config, timer1Config, timer2Config].map(
      (config) => new AVRTimer(this.cpu, config),
    );
    this.pins = Array.from({ length: 20 }, (_, i) => ({
      name: i < 14 ? `D${i}` : `A${i - 14}`,
      port: this.ports[i < 8 ? 0 : i < 14 ? 1 : 2],
      bit: i < 8 ? i : i < 14 ? i - 8 : i - 14,
      state: PinState.Input,
      last: 0,
      high: 0,
      transitions: 0,
      duty: 0,
      pwm: false,
    }));
    this.nextWindow = WINDOW;
    for (const port of this.ports) port.addListener(() => this.capture(port));
  }
  capture(port, cycle = this.cpu.cycles) {
    for (const pin of this.pins) {
      if (port && pin.port !== port) continue;
      if (pin.state === PinState.High) pin.high += cycle - pin.last;
      const state = pin.port.pinState(pin.bit);
      if (pin.state !== state) pin.transitions++;
      pin.state = state;
      pin.last = cycle;
    }
  }
  advance(milliseconds) {
    if (
      !Number.isFinite(milliseconds) ||
      milliseconds < 0 ||
      milliseconds > 10_000
    )
      throw new Error("Intervalo de simulação inválido.");
    const target = this.cpu.cycles + Math.round((milliseconds * HZ) / 1000);
    while (this.cpu.cycles < target) {
      avrInstruction(this.cpu);
      this.cpu.tick();
      if (this.cpu.cycles >= this.nextWindow) {
        this.capture();
        for (const pin of this.pins) {
          pin.duty = Math.max(0, Math.min(1, pin.high / WINDOW));
          pin.pwm = pin.transitions > 2;
          pin.high = 0;
          pin.transitions = 0;
        }
        this.nextWindow = this.cpu.cycles + WINDOW;
      }
    }
    return this.snapshot();
  }
  snapshot() {
    return {
      milliseconds: (this.cpu.cycles / HZ) * 1000,
      pins: Object.fromEntries(
        this.pins.map((pin) => [
          pin.name,
          {
            output: pin.state === PinState.Low || pin.state === PinState.High,
            level: pin.state === PinState.High ? 1 : 0,
            duty: pin.pwm ? pin.duty : pin.state === PinState.High ? 1 : 0,
            pwm: pin.pwm,
          },
        ]),
      ),
    };
  }
}
