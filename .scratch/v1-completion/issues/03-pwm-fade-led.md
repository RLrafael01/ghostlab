# 03 — Controlar brilho do LED por PWM e executar fade suave pelo código

Status: open
Priority: P0
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: v1-completion/02 (GitHub #10)
GitHub: https://github.com/RLrafael01/ghostlab/issues/11

## What to build

Executar analogWrite em um pino PWM do Uno para apagar, acender parcialmente e aumentar/diminuir o brilho do LED de forma gradual, como um dimmer.

## Acceptance criteria

- [ ] Exemplo Fade editável em pino PWM compatível, inicialmente D9, percorre 0→255→0; mudar incremento ou intervalo no sketch altera a transição.
- [ ] 0 produz LED apagado, 255 brilho máximo e valores intermediários brilho intermediário monotônico. Testar também 64, 128 e 192.
- [ ] Brilho deriva do duty cycle observado nos timers/saídas do firmware em tempo virtual, não de busca por analogWrite no texto nem de amostra de um único frame.
- [ ] Documentar e verificar pinos/timers PWM suportados do Uno; não inventar PWM em pino incompatível. Manter Blink e saída digital funcionando.
- [ ] Desconectar sinal/GND, inverter polaridade ou retirar limitação altera o resultado conforme contrato elétrico; 5 V fixo não recebe o valor PWM de outro pino.
- [ ] Painel mostra intensidade/duty cycle do modelo; resposta visual consistente com FPS diferente e após parar/reiniciar, inclusive em tela cheia.
- [ ] Limites explícitos: PWM representa controle de brilho educativo, sem cálculo analógico geral de corrente ou tensão média garantida.

## Verificação

Firmware real nos níveis 0/64/128/192/255 e fade completo; comparar duty cycle com brilho e repetir após desconectar/reconectar.

## Rastreabilidade

Tarefas em initial-lab: 06 (detalhamento solicitado em 05/11). Histórias da [especificação original](../../initial-lab/spec.md): 9, 13, 17, 18.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Referência

- [Exemplo oficial Arduino: Fade](https://docs.arduino.cc/built-in-examples/basics/Fade/)

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
