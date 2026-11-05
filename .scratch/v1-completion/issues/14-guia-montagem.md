# 14 — Exportar sketch e guia de componentes e ligações para montagem física

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/12 (GitHub #20)
GitHub: https://github.com/RLrafael01/ghostlab/issues/22

## What to build

Baixar o sketch e uma lista compreensível das peças e ligações do projeto para orientar sua montagem física.

## Acceptance criteria

- [ ] Exportar código editável e lista de componentes, parâmetros suportados, pinos e fios com IDs/nomes que correspondem à bancada.
- [ ] Contatos da protoboard, ocorrência física de GND e pontas soltas são descritos sem ambiguidade; tamanho/colunas acompanham a montagem.
- [ ] Anotar parâmetros ainda não modelados e os limites de simulação; não inventar valor validado de resistor nem certificar segurança física.
- [ ] Projeto aberto e edições permanecem intactos após download.
- [ ] Verificar saída com montagem livre e exemplo; cada conexão exportada deve ser rastreável a seus dois terminais.

## Verificação

Exportar montagem de LED com resistor e protoboard redimensionada e conferir todas as peças/conexões contra a cena.

## Rastreabilidade

Tarefas em initial-lab: 11. Histórias da [especificação original](../../initial-lab/spec.md): 32, 33.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
