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
  button: {
    name: "Botão · entrada digital",
    source: `// Botão: terminal 1 → D2; terminal 2 → GND.
// INPUT_PULLUP mantém D2 alto ao soltar; pressionar liga D2 ao GND.
// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
const int BOTAO = 2;
const int LED = 9;
int ultimoEstado = -1;

void setup() {
  pinMode(BOTAO, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int pressionado = digitalRead(BOTAO) == LOW;
  digitalWrite(LED, pressionado ? HIGH : LOW);
  if (pressionado != ultimoEstado) {
    Serial.print("Botao: ");
    Serial.println(pressionado ? "pressionado" : "solto");
    ultimoEstado = pressionado;
  }
  delay(10);
}
`,
  },
  pot: {
    name: "Potenciômetro · dimmer",
    source: `// Potenciômetro: VCC → 5V; GND → GND; Sinal → A0.
// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
// Gire o controle no inspetor para variar a entrada de 0 a 5 V.
const int POT = A0;
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int leitura = analogRead(POT);
  int brilho = leitura / 4; // ADC 0–1023 → PWM 0–255.
  analogWrite(LED, brilho);
  Serial.print("ADC: ");
  Serial.print(leitura);
  Serial.print(" | PWM: ");
  Serial.println(brilho);
  delay(100);
}
`,
  },
  serial: {
    name: "Serial · contador e LED",
    source: `// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
// Abra o monitor serial para acompanhar o contador real do programa.
const int LED = 9;
unsigned long contador = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool ligado = contador % 2 == 0;
  digitalWrite(LED, ligado ? HIGH : LOW);
  Serial.print("Contador: ");
  Serial.print(contador);
  Serial.print(" | LED: ");
  Serial.println(ligado ? "ligado" : "desligado");
  contador++;
  delay(1000); // Altere este intervalo para mudar o ritmo.
}
`,
  },
  distance: {
    name: "Sensor · distância no serial",
    source: `const int TRIG = 7, ECHO = 6, LED = 9;
void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(12);
  digitalWrite(TRIG, LOW);
  unsigned long echo = pulseIn(ECHO, HIGH, 30000);
  if (echo) {
    Serial.print(echo / 58.0, 1);
    Serial.println(" cm");
  } else {
    Serial.println("Sem eco");
  }
  digitalWrite(LED, echo && echo < 30UL * 58);
  delay(80);
}
`,
  },
  servo: {
    name: "Servo · 0°, 90° e 180°",
    source: `#include <Servo.h>
// Servo: 5V → 5V; GND → GND; Sinal → D6.
// Servo.h gera pulsos reais; não é o PWM comum de analogWrite.
// O LED da bancada não é utilizado neste exemplo.
Servo motor;
const int angulos[] = {0, 90, 180};

void setup() {
  motor.attach(6);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 3; i++) {
    motor.write(angulos[i]);
    Serial.print("Angulo: ");
    Serial.println(angulos[i]);
    delay(1000); // Altere os ângulos ou a pausa para experimentar.
  }
}
`,
  },
};
