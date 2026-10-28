# 04 — Montar e modificar um circuito digital em 3D

Status: draft
Blocked by: 02

Proposta para revisão, ainda não publicada como ticket de implementação no rastreador. Escopo: GhostLab V1 aprovado em 28/10/2026.

## What to build

O usuário cria uma montagem com Uno, protoboard, fios, resistor, botão e LED e observa o resultado no firmware.

## Acceptance criteria

- [ ] Adicionar, selecionar, posicionar e remover componentes e fios funciona com teclado e mouse.
- [ ] Pinos são identificáveis; os grupos internos da protoboard participam da conectividade.
- [ ] Conectar botão e LED a pinos distintos muda os sinais efetivamente recebidos e produzidos pelo firmware.
- [ ] Remover e reconectar um fio altera o funcionamento; a cena não usa uma animação predefinida para fingir a execução.
- [ ] O formato de projeto possui identificadores e conexões estáveis e admite os componentes das próximas entregas.
- [ ] Testes cobrem uma montagem correta e sua alteração pela interface pública da simulação.

## Comments

- 28/10/2026: proposta criada com `to-tickets`; aguarda aprovação da granularidade e das dependências.
