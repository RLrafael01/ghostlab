# 06 — Girar potenciômetro e regular o LED com analogRead e PWM

Status: open
Priority: P1
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: v1-completion/03 (GitHub #11)
GitHub: https://github.com/RLrafael01/ghostlab/issues/14

## What to build

Montar potenciômetro, ler sua posição em entrada analógica e usar o programa para regular o brilho do LED.

## Acceptance criteria

- [ ] Potenciômetro tem terminais de alimentação, terra e cursor identificados, gesto de giro e alternativa numérica/teclado.
- [ ] No circuito suportado, analogRead do pino conectado varia entre extremos e intermediários da faixa de 10 bits do Uno; o contrato define alimentação e referência.
- [ ] O sketch transforma a leitura em 0–255 para analogWrite; giro do potenciômetro altera o brilho pela execução real.
- [ ] Trocar pino no código sem mover fio muda o resultado; desconexão e falta de alimentação seguem regras explícitas, sem inventar leitura válida.
- [ ] Painel exibe posição e leitura; parâmetro pertence ao projeto e será preservado pelo salvamento, sem salvar instante de execução.
- [ ] Testes cobrem extremos, intermediário e circuito aberto, além do gesto nos dois modos de tela.

## Verificação

Girar para mínimo/meio/máximo e observar entrada analógica e brilho; mudar a escala no programa muda a curva de resposta.

## Rastreabilidade

Tarefas em initial-lab: 07. Histórias da [especificação original](../../initial-lab/spec.md): 13, 15, 17, 18.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
