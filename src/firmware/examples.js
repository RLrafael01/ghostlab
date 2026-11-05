export const examples = {
  blink: {
    name: "Blink · 1 segundo",
    source: `// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(1000);
  digitalWrite(LED, LOW);
  delay(1000);
}
`,
  },
  fade: {
    name: "Fade · brilho suave",
    source: `// LED no pino PWM D9, com resistor e retorno ao GND.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int brilho = 0; brilho <= 255; brilho += 5) {
    analogWrite(LED, brilho);
    delay(30);
  }
  for (int brilho = 255; brilho >= 0; brilho -= 5) {
    analogWrite(LED, brilho);
    delay(30);
  }
}
`,
  },
  on: {
    name: "LED ligado",
    source: `const int LED = 9;
void setup() {
  pinMode(LED, OUTPUT);
  digitalWrite(LED, HIGH);
}
void loop() {}
`,
  },
  off: {
    name: "LED desligado",
    source: `const int LED = 9;
void setup() {
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
}
void loop() {}
`,
  },
};
