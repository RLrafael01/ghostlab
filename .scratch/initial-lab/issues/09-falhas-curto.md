# 09 — Investigar falhas de ligação e curto

Status: open
Milestone: M2
Target: 04/11/2026
Blocked by: 06

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

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
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.
