# 08 — Provocar e recuperar um curto na alimentação

Status: draft
Blocked by: 07

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário liga alimentação a terra, observa a fonte virtual em falha e investiga o caminho do curto.

## Acceptance criteria

- [ ] Detectar o curto direto no circuito montado, incluindo caminhos relevantes da protoboard.
- [ ] Componentes dependentes ficam inativos e o caminho identificado é destacado na cena.
- [ ] Explicação descreve a regra educativa e os limites; não apresenta estimativas físicas não calculadas.
- [ ] Remover o curto e reiniciar recupera a fonte; reiniciar com curto presente mantém ou reproduz a falha.
- [ ] Testes verificam fonte, componentes dependentes, caminho identificado e recuperação.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
