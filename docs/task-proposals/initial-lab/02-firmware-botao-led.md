# 02 — Executar firmware real com botão, LED 3D e serial

Status: draft
Blocked by: none

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

Em uma montagem fixa mínima, apertar um botão virtual muda a saída de um LED pela execução de um sketch compilado, com mensagens no terminal.

## Acceptance criteria

- [ ] Compilar o exemplo para Uno por um serviço próprio com toolchain e limites documentados; não depender do endpoint de demonstração de terceiros.
- [ ] Executar o firmware no navegador; interação com botão chega à entrada do emulador e altera LED na cena 3D.
- [ ] Mensagens seriais emitidas pelo firmware aparecem na interface.
- [ ] Iniciar, parar e reiniciar funcionam sem deixar a interface presa.
- [ ] Um teste com firmware realmente compilado verifica entrada, saída e serial; registrar limitações e instruções de execução local.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
