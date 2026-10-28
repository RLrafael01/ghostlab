# 08 — Controlar a cancela pelo firmware e sensor

Status: draft
Milestone: M2
Target: 03/11/2026
Blocked by: 06

Proposta revisada por prazo. Ainda não publicada como ticket no rastreador. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Aproximar um objeto do sensor e ver o programa comandar a abertura real do servo virtual.

## Acceptance criteria

- [ ] Sensor de distância e servo podem ser conectados e possuem contratos de pinos, alimentação, sinal e limites.
- [ ] Posição do objeto altera a leitura recebida pelo firmware; comando produzido altera o servo na cena.
- [ ] Editar limiar no programa muda a resposta; painel mostra distância e posição.
- [ ] Verificar temporização com programa compilado e duas distâncias, sem animação independente do resultado do firmware.
- [ ] Integrar falhas e persistência quando disponíveis, preservando os contratos dos componentes.

## Comments

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
