# 03 — Montar e alterar ligações na prévia

Status: open
Milestone: M1
Target: 29/10/2026
Blocked by: 02

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Conectar e remover fios entre pinos, explorando a montagem e os grupos de contato da protoboard na interface.

## Acceptance criteria

- [ ] Criar, selecionar e remover conexões com feedback de origem e destino.
- [ ] Conexões ficam registradas no projeto com identificadores estáveis e grupos internos da protoboard representados.
- [ ] Ligações erradas continuam permitidas; a prévia não afirma executar uma simulação elétrica validada.
- [ ] Adicionar/remover componente atualiza suas conexões sem deixar fios presos a objetos inexistentes.
- [ ] Formato inicial admite parâmetros e código, para futura integração com firmware e persistência.

## Comments

- 05/11/2026 (Enzo): issue GitHub #3 implementada no PR #6: grupos internos por coluna e barramentos, pontas livres, LED alimentado pelas conexões e invariância ao mover peças. 32 testes e build aprovados; limites e evidências em docs/ELECTRICAL-MODEL.md. O formato completo de projeto com parâmetros, código e persistência permanece fora desse recorte; este ticket amplo continua aberto.

- 04/11/2026 (Enzo): correção no mesmo PR #4 após feedback: Fio jumper disponível no catálogo e no dock, com duas pontas livres; foco e remoção na lista; criação e encaixe em j20 verificados no navegador. Grupos elétricos e formato completo de projeto continuam pendentes.

- 03/11/2026 (Enzo): issue GitHub #2 implementada no PR #4: reconectar pontas de jumpers existentes, deixar soltas e cancelar com Escape. Esta é uma entrega parcial desta tarefa local: criar novos fios livremente, seleção/remoção de fios e grupos elétricos da protoboard continuam pendentes. A issue GitHub #3 trata o sistema elétrico separadamente.

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.
