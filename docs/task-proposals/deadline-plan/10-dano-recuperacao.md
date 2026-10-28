# 10 — Experimentar dano virtual e restauração

Status: draft
Milestone: M2
Target: 04/11/2026
Blocked by: 09

Proposta revisada por prazo. Ainda não publicada como ticket no rastreador. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Observar LED sofrer dano virtual pela condição aprovada, corrigir circuito e substituir ou restaurar o componente.

## Acceptance criteria

- [ ] LED diretamente ligado à alimentação sem limitação no caminho sofre dano virtual, identificado visualmente e sem emissão de luz.
- [ ] Reinício comum preserva dano; substituir ou restaurar recupera componente mantendo código e montagem.
- [ ] Se a condição incorreta permanecer, a falha pode reaparecer.
- [ ] Explicação apresenta a simplificação e não afirma validar genericamente qualquer resistor.
- [ ] Testes distinguem falha reversível, dano, reinício e restauração.

## Comments

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
