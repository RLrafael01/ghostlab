# 03 — Editar e executar o próprio programa

> Versão substituída em 28/10/2026 pela [divisão por prazo](../deadline-plan/README.md). Preservada como histórico; não usar para publicar tickets.

Status: draft
Blocked by: 02

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário altera um exemplo comentado no editor, compila e observa seu programa mudar a resposta do LED e do terminal.

## Acceptance criteria

- [ ] Alterar código e compilar produz novo comportamento observável, sem trocar a montagem fixa.
- [ ] Código inválido apresenta diagnósticos úteis e preserva o conteúdo do editor.
- [ ] Indisponibilidade e timeout de compilação mostram erro recuperável; firmware antigo não é apresentado como se fosse o novo.
- [ ] Controles de início/parada/reinício respeitam a versão compilada e o estado da execução.
- [ ] Testes verificam mudança real de comportamento e recuperação após erro de compilação.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
