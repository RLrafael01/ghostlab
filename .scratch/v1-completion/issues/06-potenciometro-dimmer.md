# 06 — Girar potenciômetro e regular o LED com analogRead e PWM

Status: in-progress
Priority: P1
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/14

## What to build

Montar potenciômetro, ler sua posição em entrada analógica e usar o programa para regular o brilho do LED.

## Acceptance criteria

- [ ] Potenciômetro tem terminais de alimentação, terra e cursor identificados, gesto de giro e alternativa numérica/teclado.
- [x] No circuito suportado, analogRead do pino conectado varia entre extremos e intermediários da faixa de 10 bits do Uno; o contrato define alimentação e referência.
- [x] O sketch transforma a leitura em 0–255 para analogWrite; giro do potenciômetro altera o brilho pela execução real.
- [x] Trocar pino no código sem mover fio muda o resultado; desconexão e falta de alimentação seguem regras explícitas, sem inventar leitura válida.
- [ ] Painel exibe posição e leitura; parâmetro pertence ao projeto e será preservado pelo salvamento, sem salvar instante de execução.
- [ ] Testes cobrem extremos, intermediário e circuito aberto, além do gesto nos dois modos de tela.

## Verificação

Girar para mínimo/meio/máximo e observar entrada analógica e brilho; mudar a escala no programa muda a curva de resposta.

## Rastreabilidade

Tarefas em initial-lab: 07. Histórias da [especificação original](../../initial-lab/spec.md): 13, 15, 17, 18.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. Modelo e pinos disponíveis; faltam giro/valor do cursor, ADC e propagação até analogRead. O PWM do LED da #11 é uma dependência pronta, não a conclusão do dimmer por potenciômetro. Evidência: `src/firmware/uno-simulation.js`, `src/main.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.

- 05/11/2026 — entrega em andamento na branch `codex/inputs-serial-servo`, base main `3137cad`: ADC de 10 bits recebe a tensão do cursor realmente conectado; exemplo A0 → PWM D9 e serial de analogRead implementado. Testes de circuito/runtime/demonstração verificam 0/2,5/5 V, troca de entrada e desconexão. Contrato e fallback explícito de 0 V estão em docs/PERIPHERALS.md. Gestos, painel e validação final nos dois modos permanecem pendentes; persistência será integrada em #20/#21. Critérios marcados correspondem às evidências já observadas na branch; issue permanece aberta e `in-progress` até validação e revisão finais. Não é conclusão na main.
