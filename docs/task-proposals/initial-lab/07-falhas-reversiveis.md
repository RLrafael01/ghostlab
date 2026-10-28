# 07 — Experimentar falta de alimentação e sinal desconectado

> Versão substituída em 28/10/2026 pela [divisão por prazo](../deadline-plan/README.md). Preservada como histórico; não usar para publicar tickets.

Status: draft
Blocked by: 04

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário executa uma montagem incompleta, observa a falha e solicita uma explicação antes de corrigi-la.

## Acceptance criteria

- [ ] Falta de alimentação deixa o componente afetado inativo com indicação na cena ou painel.
- [ ] Sinal desconectado produz o comportamento definido pelo contrato do componente.
- [ ] “Por que isso aconteceu?” apresenta causa e sugestão de correção sob demanda.
- [ ] A interface permite executar a montagem incorreta; explicação não é apresentada como bloqueio prévio.
- [ ] Corrigir a ligação recupera a falha reversível conforme o contrato; comportamento é verificado por testes.
- [ ] Integração permite aplicar os mesmos estados funcionais aos componentes adicionais quando disponíveis.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
