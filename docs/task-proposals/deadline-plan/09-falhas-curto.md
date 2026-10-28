# 09 — Investigar falhas de ligação e curto

Status: draft
Milestone: M2
Target: 04/11/2026
Blocked by: 06

Proposta revisada por prazo. Ainda não publicada como ticket no rastreador. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Executar montagens erradas e observar alimentação ausente, sinal desconectado e curto, com explicação sob demanda.

## Acceptance criteria

- [ ] Falta de alimentação e sinal desconectado alteram funcionamento conforme contrato, com efeitos na cena e painel.
- [ ] Curto direto entre alimentação e terra coloca fonte virtual em falha e inativa componentes dependentes; destacar o caminho.
- [ ] “Por que isso aconteceu?” revela causa e sugestão; montagem incorreta pode ser executada.
- [ ] Corrigir falhas reversíveis recupera o funcionamento; curto exige remover a condição e reiniciar.
- [ ] Regras e limitações educativas explícitas, sem estimativas físicas não calculadas; verificar comportamento e recuperação.

## Comments

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
