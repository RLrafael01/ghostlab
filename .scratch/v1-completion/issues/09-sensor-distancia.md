# 09 — Medir distância de objeto virtual com sensor e firmware

Status: done
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/05 (GitHub #13)
GitHub: https://github.com/RLrafael01/ghostlab/issues/17

## What to build

Arrastar um objeto diante do sensor e receber no programa uma leitura de distância que pode ser mostrada no painel e no serial.

## Acceptance criteria

- [x] Documentar o modelo escolhido, alimentação, Trig/Echo, faixa, unidades e simplificações; objeto de teste é distinto dos componentes arrastáveis.
- [x] Pulso Trig do firmware provoca Echo com temporização correspondente à distância; pulseIn e timeout funcionam no emulador.
- [x] Duas posições diferentes alteram a medida recebida pelo sketch e a mensagem serial; painel mostra distância modelada e medida.
- [x] Falta de alimentação, sinal desconectado e objeto fora da faixa têm comportamento definido, incluindo ausência de eco/timeout.
- [x] Interação é utilizável nos modos normal e tela cheia e não altera fios por acidente.
- [x] Teste compilado verifica temporização, unidades, duas distâncias e ausência de eco sem travar a interface.

## Verificação

Aproximar/afastar objeto, ler serial e alterar no código o limiar que acende um LED.

## Rastreabilidade

Tarefas em initial-lab: 08. Histórias da [especificação original](../../initial-lab/spec.md): 13, 16, 18, 19.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. Modelo HC-SR04 e pinos existem; faltam objeto de teste, distância, Trig/Echo temporizado, timeout, painel e serial. A temporização deve usar ciclos/eventos do emulador, não apenas snapshots de 20 ms. Evidência: `src/main.js`, `src/firmware/uno-simulation.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.

- 05/11/2026 — Implementado no PR #31. CI 42129438633 verificou sketch compilado, duas distâncias e timeout. Roteiro em docs/DISTANCE-SENSOR.md. Fechamento no GitHub após merge.

