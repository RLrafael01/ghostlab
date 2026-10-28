# 06 — Controlar um servo por sensor de distância

> Versão substituída em 28/10/2026 pela [divisão por prazo](../deadline-plan/README.md). Preservada como histórico; não usar para publicar tickets.

Status: draft
Blocked by: 03, 04

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário conecta sensor e servo, aproxima um objeto na cena e vê o programa comandar o movimento.

## Acceptance criteria

- [ ] Sensor e servo podem ser montados em pinos suportados e possuem contratos documentados.
- [ ] Distância na cena influencia o sinal lido pelo firmware e a posição do servo decorre do comando produzido.
- [ ] Painel mostra distância e posição do servo, com limites declarados.
- [ ] Alterar no editor o limiar de distância muda quando o servo se movimenta.
- [ ] Teste com firmware cobre pelo menos duas distâncias e mudança de limiar; validar temporização necessária.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
