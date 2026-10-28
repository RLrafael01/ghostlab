# 10 — Salvar, reabrir e compartilhar projetos sem conta

Status: draft
Blocked by: 04

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário salva a montagem e o código no navegador e exporta um arquivo que outra pessoa pode importar.

## Acceptance criteria

- [ ] Salvar e reabrir preserva código, tipos e parâmetros de componentes, posições e conexões.
- [ ] Formato versionado admite o catálogo da V1; cada integração posterior deve manter seu round-trip.
- [ ] Exportar e importar reproduz o projeto; dados inválidos não substituem o trabalho aberto.
- [ ] Projeto reaberto começa nova execução sem retomar danos ou instante anteriores.
- [ ] Exportar também código e lista de componentes e ligações para orientar a montagem física.
- [ ] Falha de armazenamento apresenta orientação e mantém o trabalho em memória; testes cobrem round-trip e importação inválida.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
