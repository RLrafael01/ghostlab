# 05 — Controlar uma entrada analógica por potenciômetro

Status: draft
Blocked by: 04

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário monta um potenciômetro, varia seu valor e observa o firmware e o painel responderem.

## Acceptance criteria

- [ ] Componente pode ser adicionado, ligado e manipulado na bancada.
- [ ] Valor manipulado chega à entrada analógica conectada e pode ser lido pelo firmware.
- [ ] Exemplo compilado transforma a leitura em saída ou mensagem serial observável.
- [ ] Contrato documenta pinos, faixa simulada, alimentação e limites; exportação futura preserva parâmetros.
- [ ] Teste de comportamento cobre leituras em valores distintos e o pino realmente conectado.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
