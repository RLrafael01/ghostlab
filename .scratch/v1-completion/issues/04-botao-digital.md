# 04 — Acionar botão virtual e controlar LED com digitalRead

Status: open
Priority: P1
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/12

## What to build

Apertar e soltar o botão na cena muda a entrada lida pelo programa, que decide acender/apagar o LED.

## Acceptance criteria

- [ ] Contrato documenta pares internos de terminais do botão, estados pressionado/solto e ligação usada no exemplo.
- [ ] INPUT_PULLUP funciona no exemplo: apertar fecha o caminho para GND e soltar restaura a entrada; INPUT tem regra de entrada flutuante declarada.
- [ ] digitalRead lê o pino efetivamente conectado; fio solto ou mudança de pino altera o comportamento sem resposta predeterminada na interface.
- [ ] Pressionar/soltar com mouse e teclado é acessível e não inicia arraste acidental; interrupção do gesto não deixa botão preso.
- [ ] Painel mostra estado do botão e sinal lido; programa de controle do LED é editável e executado de verdade.
- [ ] Teste compilado cobre soltar, apertar, desconectar e reiniciar; contrato integra as falhas educativas quando disponíveis.

## Verificação

Pressionar→firmware→LED; inverter a condição no código inverte a resposta. Verificar estados também com o fio de entrada solto.

## Rastreabilidade

Tarefas em initial-lab: 05, 06. Histórias da [especificação original](../../initial-lab/spec.md): 13, 14, 17, 18.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. Modelo 3D e pinos existem. Faltam interação pressionar/soltar, ligação ao GPIO de entrada, INPUT_PULLUP, painel e teste de firmware com digitalRead. Evidência: `src/main.js`, `src/firmware/uno-simulation.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.
