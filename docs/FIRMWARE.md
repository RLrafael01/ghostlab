# Firmware real: Blink e PWM

Implementação das issues #9, #10 e #11. O sketch é compilado pelo Arduino CLI em HEX para o Uno e executado por AVR8js em um Web Worker. O circuito recebe os estados dos GPIOs do firmware; a animação não interpreta palavras do código.

## Executar e editar código localmente

```sh
npm ci
npm run setup:compiler
npm run dev
```

Abra o endereço exibido pelo Vite. O comando de setup instala ferramentas isoladas em `.tools/` (ignoradas pelo Git), sem exigir placa física. Plataformas automatizadas: macOS Apple Silicon e Linux x64; no Windows, usar WSL2. O pacote AVR para macOS utiliza binários Intel e pode exigir Rosetta; o setup/compilação informa falha se o sistema não puder executá-los.

O compilador é um serviço próprio integrado ao servidor local do Vite, com POST `/api/compile`. `npm run preview` também oferece a compilação local. Na bancada, selecione Blink, Fade, LED ligado ou LED desligado; clique em **Compilar e executar**. O circuito inicial liga **D9 → resistor → LED → GND**, através dos barramentos da protoboard.

A [página piloto](../pilot.html) fica em `/pilot.html` no servidor e demonstra o mesmo caminho compilação → firmware → D9 sem depender da cena 3D.

## O que funciona

- C++ do Arduino core fixado: `setup`, `loop`, variáveis, condições, laços, `pinMode`, `digitalWrite`, `delay`/temporização do core e `analogWrite`.
- Blink: alterar 1000 para 250 nos dois `delay` muda o ritmo; HIGH e LOW constantes ligam/desligam. Alterar o pino exige mudar o fio correspondente.
- PWM: D3/D11 (timer 2), D5/D6 (timer 0), D9/D10 (timer 1). Os níveis 0, 64, 128, 192 e 255 são verificados com firmware compilado. Em pino sem PWM, vale o comportamento digital do core; não há PWM artificial.
- O exemplo Fade percorre 0→255→0. Alterar passo e intervalo no sketch modifica a transição. A emissão de luz e o percentual no painel usam o duty cycle observado em janelas fixas de 20 ms de tempo virtual, independentes do FPS.
- GPIOs de saída do primeiro Uno presente ao iniciar a execução alimentam o grafo de conexões; os pinos 5 V permanecem fontes fixas. Desconectar sinal/GND, inverter o LED ou retirar resistor altera o resultado do circuito.
- Parar encerra o worker e retira sinais GPIO. Reiniciar cria um processador novo para o mesmo código; código alterado precisa ser compilado antes. O estado de execução é separado de futuros danos virtuais.
- Editar durante a compilação cancela a solicitação. Respostas antigas não iniciam programa nem sobrescrevem a revisão atual. Editar durante a execução mantém a revisão anterior explicitamente identificada até recompilar.
- Controles no editor normal e no painel de código acessível pelo dock em tela cheia. O sketch é preservado ao recolher o painel.

## Prévia pública

GitHub Pages só hospeda arquivos estáticos. Os quatro exemplos originais têm firmware real previamente compilado, vinculado ao texto por SHA-256; a interface informa **“Executando firmware pré-compilado deste exemplo”**. Um texto diferente nunca reutiliza esse firmware como se tivesse sido compilado.

Para compilar alterações, use o servidor local acima. Serviço indisponível, resposta incompatível ou erro de C++ preservam o texto e mostram diagnóstico. Hospedar um compilador próprio acessível pelo link público é a issue #15, separada deste recorte; não foi criado um endpoint público nesta entrega.

Reproduza os artefatos dos exemplos com `npm run build:firmware`. Os arquivos contêm HEX, hash do sketch e versões da toolchain. Não há interpretador parcial de C++ nem tabela de animações.

## Versões e limites

| Item | Versão/limite |
| --- | --- |
| Arduino CLI | 1.5.1; download oficial com SHA-256 fixado por plataforma |
| Arduino AVR core | arduino:avr@1.8.6 |
| Alvo | arduino:avr:uno, ATmega328P, 16 MHz, flash 32 KiB / SRAM 2 KiB |
| Compilador do core | avr-gcc 7.3.0-atmel3.6.1-arduino7 |
| Emulador | avr8js 0.21.1, MIT |
| Entrada | sketch até 32768 bytes; envelope HTTP até 40000 bytes |
| Recursos | 1 compilação por processo, 30 s, saída de diagnóstico até 64 KiB |
| Memória | grupo de processos limitado por monitoramento a 512 MiB, amostragem de 250 ms |

O serviço escuta em loopback, exige Host local e mesma origem no navegador. Compila somente o alvo fixado, não aceita flags ou comandos do cliente, usa diretório temporário por trabalho e remove-o ao terminar. Cancelamento e timeout encerram o grupo de processos do compilador. O monitor é um limite operacional, não isolamento de segurança: este serviço local compila código confiável do usuário e **não deve ser exposto à internet**; a hospedagem pública exige isolamento próprio na issue #15.

Esta etapa implementa CPU, GPIO e timers, não todo o hardware externo do Uno. Entradas por botão/potenciômetro, UART/monitor serial, sensor, servo e bibliotecas adicionais seguem nas respectivas issues. Uma placa executa firmware por vez; adicionar outras não cria mais processadores. Circuito é simplificado, sem corrente, tensão analógica geral, curto educativo retido ou dano virtual. Não há garantia de precisão para montagem física. Hardware PWM com configurações customizadas permanece sujeito à fidelidade do emulador; os testes cobrem o core e exemplos fixados.

## Verificação

```sh
npm test
npm run test:firmware
npm run build
```

A segunda suíte compila sketches reais: Blink 1000/250 ms, níveis PWM nos seis pinos e fallback digital, além de C++ inválido, limite de tamanho, cancelamento, timeout, concorrência e recuperação. A suíte principal cobre circuito/fios, polaridade/resistor, separação de 5 V, amostragem em passos diferentes, worker real, controle de revisão e respostas obsoletas, prévia sem compilador e fronteira HTTP local. CI instala a mesma toolchain e executa ambas.

No navegador: compilar Blink, selecionar/focar LED, trocar para Fade, testar brilho constante 128, parar/reiniciar, retirar retorno, experimentar C++ inválido e abrir o editor em tela cheia. A marcação final dos tickets e as evidências do PR registram os resultados efetivamente observados.

Referências: [AVR8js](https://github.com/wokwi/avr8js), [Arduino CLI 1.5.1](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), [Fade do Arduino](https://docs.arduino.cc/built-in-examples/basics/Fade/).
