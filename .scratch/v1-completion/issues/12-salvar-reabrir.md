# 12 — Criar bancada vazia, salvar e reabrir projetos no navegador

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: GitHub #3
GitHub: https://github.com/RLrafael01/ghostlab/issues/20

## What to build

Criar um projeto do zero, salvar a montagem e o código e recuperar o trabalho após fechar/reabrir a página, sem conta.

## Acceptance criteria

- [ ] Formato versionado guarda identificadores estáveis, código, componentes, parâmetros, posições/rotações, tamanho da protoboard, cores dos fios e pontas conectadas/livres.
- [ ] Salvar/reabrir preserva a montagem e os dados; grupos da protoboard e ligações são reconstruídos sem apontar para peças inexistentes.
- [ ] Estado transitório do firmware, serial, falhas e dano de sessão ficam separados; abrir projeto inicia execução nova, sem executar código automaticamente.
- [ ] Bancada vazia é acessível e trocar de projeto não descarta alterações silenciosamente.
- [ ] Falha de quota/permissão/formato armazenado mantém projeto em memória e oferece recuperação/exportação quando disponível.
- [ ] Contratos aceitam parâmetros do catálogo aprovado; componentes integrados depois acrescentam casos à mesma verificação de round-trip.
- [ ] Testes cobrem recarregar projeto, IDs, fios soltos, protoboard redimensionada e erro de armazenamento.

## Verificação

Montar, editar código, salvar, recarregar e comparar projeto; provocar falha de armazenamento sem perder edição.

## Rastreabilidade

Tarefas em initial-lab: 03 (formato), 11. Histórias da [especificação original](../../initial-lab/spec.md): 2, 5, 6, 7, 8, 30, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
