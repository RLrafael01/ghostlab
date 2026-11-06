import {
  CPU,
  avrInstruction,
  AVRIOPort,
  AVRTimer,
  AVRADC,
  ADCMuxInputType,
  adcConfig,
  AVRUSART,
  usart0Config,
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
const SERIAL_CAPACITY = 4096;

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
    this.adc = new AVRADC(this.cpu, adcConfig);
    this.analogReadings = {};
    let pendingADCChannel = null;
    const readADC = this.adc.onADCRead;
    const completeADC = this.adc.completeADCRead.bind(this.adc);
    this.adc.onADCRead = (input) => {
      pendingADCChannel =
        input.type === ADCMuxInputType.SingleEnded && input.channel < 6
          ? `A${input.channel}`
          : null;
      readADC(input);
    };
    this.adc.completeADCRead = (value) => {
      // Disabled ADC reads complete with zero without calling onADCRead.
      const channel = pendingADCChannel;
      pendingADCChannel = null;
      completeADC(value);
      if (channel !== null)
        this.analogReadings[channel] = {
          value,
          milliseconds: (this.cpu.cycles / HZ) * 1000,
        };
    };
    this.usart = new AVRUSART(this.cpu, usart0Config, HZ);
    this.serialBytes = new Uint8Array(SERIAL_CAPACITY);
    this.serialStart = 0;
    this.serialLength = 0;
    this.serialDropped = 0;
    this.serialDecoder = new TextDecoder();
    this.usart.onByteTransmit = (byte) => {
      if (this.serialLength === SERIAL_CAPACITY) {
        this.serialStart = (this.serialStart + 1) % SERIAL_CAPACITY;
        this.serialDropped++;
      } else this.serialLength++;
      this.serialBytes[
        (this.serialStart + this.serialLength - 1) % SERIAL_CAPACITY
      ] = byte;
    };
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
      risingCycle: null,
      previousRisingCycle: null,
      fallingCycle: null,
      pulseWidthUs: null,
      pulsePeriodUs: null,
    }));
    this.nextWindow = WINDOW;
    this.digitalInputs = {};
    this.sensors = new Map();
    this.echoLevels = new Map();
    this.echoReadings = {};
    for (const port of this.ports) port.addListener(() => this.capture(port));
  }
  setInputs({ digital = {}, analog = {}, sensors = [] } = {}) {
    if (!digital || typeof digital !== "object" || Array.isArray(digital))
      throw new Error("Entradas digitais inválidas.");
    if (!analog || typeof analog !== "object" || Array.isArray(analog))
      throw new Error("Entradas analógicas inválidas.");
    for (const [name, value] of Object.entries(digital))
      if (
        !this.pins.some((pin) => pin.name === name) ||
        ![0, 1, null].includes(value)
      )
        throw new Error("Entrada digital inválida.");
    for (const [name, value] of Object.entries(analog))
      if (
        !/^A[0-5]$/.test(name) ||
        (value !== null && (!Number.isFinite(value) || value < 0 || value > 5))
      )
        throw new Error("Entrada analógica inválida.");
    const next = new Map();
    for (const sensor of sensors) {
      if (
        !this.pins.some(({ name }) => name === sensor.triggerPin) ||
        !this.pins.some(({ name }) => name === sensor.echoPin) ||
        sensor.triggerPin === sensor.echoPin
      )
        continue;
      const previous = this.sensors.get(sensor.id);
      next.set(
        sensor.id,
        previous &&
          previous.triggerPin === sensor.triggerPin &&
          previous.echoPin === sensor.echoPin
          ? Object.assign(previous, sensor)
          : { ...sensor },
      );
    }
    for (const [id, previous] of this.sensors) {
      if (next.get(id) !== previous || next.get(id).distanceCm == null) {
        previous.pulse = null;
        this.echoLevels.delete(previous.echoPin);
        delete this.echoReadings[id];
      }
    }
    this.sensors = next;
    this.digitalInputs = { ...digital };
    for (const pin of this.pins) this.applyInput(pin);
    for (let channel = 0; channel < 6; channel++)
      this.adc.channelValues[channel] = analog[`A${channel}`] ?? 0;
  }
  applyInput(pin) {
    const value = this.echoLevels.get(pin.name) ?? this.digitalInputs[pin.name];
    pin.port.setPin(
      pin.bit,
      value == null ? pin.state === PinState.InputPullUp : value === 1,
    );
  }
  capture(port, cycle = this.cpu.cycles) {
    for (const pin of this.pins) {
      if (port && pin.port !== port) continue;
      if (pin.state === PinState.High) pin.high += cycle - pin.last;
      const state = pin.port.pinState(pin.bit);
      if (pin.state !== state) {
        pin.transitions++;
        if (state === PinState.High) {
          pin.pulsePeriodUs =
            pin.previousRisingCycle === null
              ? null
              : (cycle - pin.previousRisingCycle) / (HZ / 1_000_000);
          pin.risingCycle = pin.previousRisingCycle = cycle;
        } else if (state === PinState.Low && pin.risingCycle !== null) {
          pin.pulseWidthUs = (cycle - pin.risingCycle) / (HZ / 1_000_000);
          this.triggerEcho(pin);
          pin.fallingCycle = cycle;
          pin.risingCycle = null;
        } else if (state === PinState.Input || state === PinState.InputPullUp) {
          pin.risingCycle = pin.previousRisingCycle = pin.fallingCycle = null;
          pin.pulseWidthUs = pin.pulsePeriodUs = null;
        }
      }
      pin.state = state;
      pin.last = cycle;
      this.applyInput(pin);
    }
  }
  triggerEcho(trigger) {
    if (trigger.pulseWidthUs < 10) return;
    for (const sensor of this.sensors.values()) {
      if (
        sensor.triggerPin !== trigger.name ||
        sensor.pulse ||
        !(sensor.distanceCm >= 2 && sensor.distanceCm <= 400)
      )
        continue;
      const echo = this.pins.find(({ name }) => name === sensor.echoPin);
      if (echo.state === PinState.High || echo.state === PinState.Low) continue;
      const pulse = {};
      sensor.pulse = pulse;
      const width = Math.round((sensor.distanceCm * 58 * HZ) / 1_000_000);
      this.cpu.addClockEvent(() => {
        if (sensor.pulse !== pulse) return;
        this.echoLevels.set(echo.name, 1);
        this.applyInput(echo);
        this.cpu.addClockEvent(() => {
          if (sensor.pulse !== pulse) return;
          sensor.pulse = null;
          this.echoLevels.delete(echo.name);
          this.applyInput(echo);
          this.echoReadings[sensor.id] = width / (HZ / 1_000_000) / 58;
        }, width);
      }, HZ / 5000);
    }
  }
  advance(milliseconds, { drainSerial = true } = {}) {
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
    const output = this.snapshot();
    if (drainSerial) output.serial = this.drainSerial();
    return output;
  }
  drainSerial() {
    const bytes = new Uint8Array(this.serialLength);
    for (let index = 0; index < bytes.length; index++)
      bytes[index] =
        this.serialBytes[(this.serialStart + index) % SERIAL_CAPACITY];
    // If bytes were discarded, an earlier partial UTF-8 character is no longer valid.
    if (this.serialDropped) this.serialDecoder = new TextDecoder();
    const output = {
      text: this.serialDecoder.decode(bytes, { stream: true }),
      dropped: this.serialDropped,
      baud: this.usart.txEnable ? this.usart.baudRate : null,
    };
    this.serialStart = this.serialLength = this.serialDropped = 0;
    return output;
  }
  snapshot() {
    return {
      milliseconds: (this.cpu.cycles / HZ) * 1000,
      echoReadings: { ...this.echoReadings },
      analogReadings: Object.fromEntries(
        Object.entries(this.analogReadings).map(([name, reading]) => [
          name,
          { ...reading },
        ]),
      ),
      serial: {
        text: "",
        dropped: 0,
        baud: this.usart.txEnable ? this.usart.baudRate : null,
      },
      pins: Object.fromEntries(
        this.pins.map((pin) => [
          pin.name,
          {
            output: pin.state === PinState.Low || pin.state === PinState.High,
            level: pin.state === PinState.High ? 1 : 0,
            duty: pin.pwm ? pin.duty : pin.state === PinState.High ? 1 : 0,
            pwm: pin.pwm,
            input: (this.cpu.data[pin.port.portConfig.PIN] >> pin.bit) & 1,
            pullup: pin.state === PinState.InputPullUp,
            pulseWidthUs: pin.pulseWidthUs,
            pulsePeriodUs: pin.pulsePeriodUs,
            pulseAgeMs:
              pin.fallingCycle === null
                ? null
                : (this.cpu.cycles - pin.fallingCycle) / (HZ / 1000),
          },
        ]),
      ),
    };
  }
}
