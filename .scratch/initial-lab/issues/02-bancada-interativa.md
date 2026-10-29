# 02 — Explorar e organizar a bancada 3D

Status: done
Milestone: M1
Target: 29/10/2026
Blocked by: none

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Abrir o GhostLab, navegar pela cena e adicionar, selecionar, mover e remover componentes com pinos identificados.

## Acceptance criteria

- [x] Interface apresenta catálogo, bancada, área de código e painel de estados em navegador de computador.
- [x] Uno, protoboard e componentes do exemplo possuem representações simples e identificáveis; modelos detalhados não bloqueiam a entrega.
- [x] Navegação e seleção não impedem posicionar componentes e voltar à visão inicial.
- [x] Estado de projeto distingue montagem e prévia; mostrar que firmware ainda não é executado neste marco.
- [x] Demonstração executável localmente, com instruções de abertura, sem depender de compilação remota.

## Comments

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.

- 29/10/2026: primeira implementação com Three.js/Vite. Build aprovado e fluxo adicionar/mover/remover verificado no navegador. Revisão em andamento.

- 29/10/2026: build final e checagem de sintaxe aprovados; adição, seleção, movimentação por coordenada e remoção observadas no navegador. Revisão em dois eixos concluída; correções de posições e tooltip dos pinos aplicadas. Sem testes automatizados; firmware e fios permanecem fora desta tarefa.
