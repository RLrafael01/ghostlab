# 13 — Compartilhar projeto por exportação e importação de arquivo

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/12 (GitHub #20)
GitHub: https://github.com/RLrafael01/ghostlab/issues/21

## What to build

Exportar montagem e código num arquivo e abrir o mesmo projeto em outro navegador sem conta.

## Acceptance criteria

- [ ] Arquivo usa formato versionado do projeto e preserva código, componentes, parâmetros, fios e tamanho da protoboard.
- [ ] Validar estrutura, versão, limites de tamanho/quantidade, tipos e referências antes de substituir a bancada atual.
- [ ] Arquivo inválido, incompatível ou cancelamento não altera o trabalho aberto; importação pede confirmação quando houver alterações não salvas.
- [ ] Valores de texto importados não são interpretados como HTML nem executados; o código só roda após ação explícita de compilar/executar.
- [ ] Testes de round-trip incluem pontas livres, valores do potenciômetro, montagem redimensionada e dados inválidos; validar compartilhamento entre duas sessões.

## Verificação

Exportar um projeto, abrir em outra sessão e comparar; tentar importar JSON inválido e versão incompatível preservando a bancada atual.

## Rastreabilidade

Tarefas em initial-lab: 11. Histórias da [especificação original](../../initial-lab/spec.md): 31, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
