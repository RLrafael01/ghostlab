# 09 — Experimentar dano virtual e restaurar componentes

Status: draft
Blocked by: 07

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário liga um LED sem limitação de corrente no caminho, observa dano persistente e aprende a substituir ou restaurar a peça.

## Acceptance criteria

- [ ] Aplicar a condição educativa de dano aprovada e indicar o LED danificado, sem emissão de luz.
- [ ] Corrigir a montagem e apenas reiniciar preserva o dano.
- [ ] Substituir o LED ou restaurar permite funcionamento após corrigir a ligação; restauração mantém código e montagem.
- [ ] Restaurar mantendo a condição incorreta permite a falha reaparecer.
- [ ] Explicação esclarece a simplificação, sem prometer validar genericamente qualquer valor de resistor.
- [ ] Testes distinguem falha reversível, dano persistente, reinício e restauração.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
