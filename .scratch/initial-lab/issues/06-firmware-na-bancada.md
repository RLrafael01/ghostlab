# 06 — Executar o código do usuário no circuito 3D

Status: open
Milestone: M2
Target: 02/11/2026
Blocked by: 03, 05

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Editar C++, compilar e controlar botão e LED pelas ligações reais do projeto na bancada.

## Acceptance criteria

- [x] Código modificado muda o comportamento na cena pelo firmware e não pelo controlador da prévia.
- [ ] Conectividade da montagem e contatos da protoboard determinam entradas e saídas.
- [ ] Iniciar, parar, reiniciar e terminal serial funcionam; erros de compilação preservam código e identificam o programa que pode executar.
- [x] Prévia e execução real ficam distinguíveis; demonstrar execução funcional sem usar respostas predefinidas.
- [ ] Teste com firmware realmente compilado cobre botão, LED, serial e alteração de fio.

## Comments

- 05/11/2026 (Rafael, auditoria): [#10](https://github.com/RLrafael01/ghostlab/issues/10) e [#11](https://github.com/RLrafael01/ghostlab/issues/11) integradas pelo PR #26 em `6a1f31a`. Blink/PWM, código alterado compilado localmente, conectividade de saída, iniciar/parar/reiniciar e preservação do texto foram verificados; [revisão e evidências](../../../docs/FIRMWARE-REVIEW.md). O link público identifica os exemplos pré-compilados e não os apresenta como compilação de texto alterado. Os critérios que combinam entradas, terminal serial e teste botão→firmware→LED→serial continuam parciais: seguir [#12](https://github.com/RLrafael01/ghostlab/issues/12), [#13](https://github.com/RLrafael01/ghostlab/issues/13) e [#15](https://github.com/RLrafael01/ghostlab/issues/15) para compilação pela prévia. Status permanece `open`; não duplicar as saídas já entregues.

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.
