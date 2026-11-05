# 11 — Simular dano no LED e permitir substituição ou restauração

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/10 (GitHub #18)
GitHub: https://github.com/RLrafael01/ghostlab/issues/19

## What to build

Ligar LED sem limitação no caminho provoca dano virtual educativo; corrigir o circuito exige substituir a peça ou restaurar a simulação para fazê-la funcionar novamente.

## Acceptance criteria

- [ ] Definir a condição educativa para fonte fixa e GPIO/PWM energizado sem limitação; dano não é inferido apenas da cor do LED ou de um resistor solto na cena.
- [ ] LED danificado fica identificado e não emite luz, mesmo após corrigir fio e reiniciar o firmware.
- [ ] Substituir cria peça funcional com reconexões explícitas; restaurar limpa dano/falhas retidas e reinicia execução preservando código e montagem.
- [ ] Condição incorreta que permanece provoca falha novamente após restaurar; remover curto segue a semântica da issue de falhas.
- [ ] “Por que isso aconteceu?” explica simplificação e correção sem prometer que qualquer resistor torna o circuito físico seguro.
- [ ] Salvar projeto não persiste dano da sessão nem instante do firmware; testes distinguem reiniciar, restaurar, substituir e reabrir.

## Verificação

Danificar LED, corrigir ligação, reiniciar e comprovar dano mantido; substituir/restaurar e repetir com montagem ainda incorreta.

## Rastreabilidade

Tarefas em initial-lab: 10. Histórias da [especificação original](../../initial-lab/spec.md): 20, 24, 25, 26, 27, 28, 29, 33.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. Ligação sem resistor mantém o LED apagado, sem dano persistente. Faltam estado de dano, substituição/restauração e testes que distingam reinício de recuperação. Evidência: `src/electrical-simulation.js`, `tests/electrical-simulation.test.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.
