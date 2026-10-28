# Histórico de uso das skills do Matt Pocock

Registro mantido pelos agentes que trabalham no GhostLab. Os arquivos das skills ficam em `.agents/skills/`; sua origem está em `THIRD_PARTY_NOTICES.md`.

## Convenções

- Registre cada aplicação efetiva, inclusive skills chamadas como parte de outras. Instalar ou apenas ler uma skill não conta como aplicação.
- Acrescente uma entrada com ID sequencial, data no fuso `America/Sao_Paulo`, nome da skill, objetivo, estado e resultado ou evidência.
- Estados: `em andamento`, `concluído` ou `interrompido`. Retomar a mesma aplicação atualiza sua entrada; uma aplicação com outro objetivo recebe novo ID.
- Registre o início ao começar a aplicação e atualize o resultado antes de encerrar o trabalho. Preserve as entradas anteriores.
- Os registros iniciais abaixo foram reconstruídos a partir desta conversa. A numeração indica a ordem de registro, sem presumir horários exatos.

## Aplicações

| ID | Data | Skill | Objetivo | Estado | Resultado / evidência |
| --- | --- | --- | --- | --- | --- |
| 001 | 28/10/2026 | `setup-matt-pocock-skills` | Configurar o fluxo de desenvolvimento do projeto. | concluído | Configuração revisada e aprovada pelo usuário: tarefas locais, `AGENTS.md` e documentação de domínio com contexto único. Ver [configuração](agents/issue-tracker.md) e [rascunho aprovado](SKILL-SETUP-DRAFT.md). |
| 002 | 28/10/2026 | `writing-for-agents` | Escrever as instruções iniciais para agentes. | concluído | Criados [AGENTS.md](../AGENTS.md) e os documentos em `docs/agents/`, com referências condicionadas à tarefa. |
| 003 | 28/10/2026 | `grill-with-docs` | Refinar público e experiência da primeira versão. | concluído | [Recorte consolidado](V1-REVIEW.md) confirmado pelo usuário, incluindo comportamentos de verificação. Autorizada criação da spec e divisão de tarefas. |
| 004 | 28/10/2026 | `grilling` | Conduzir a entrevista iniciada por `grill-with-docs`. | concluído | Confirmação final recebida; público, fluxo, falhas, recuperação e limites da V1 alinhados. |
| 005 | 28/10/2026 | `writing-for-agents` | Incorporar o registro de aplicações às instruções do projeto. | concluído | Adicionada a seção “Registro de uso” ao [AGENTS.md](../AGENTS.md), apontando para este histórico e suas convenções. |
| 006 | 28/10/2026 | `domain-modeling` | Definir a falha experimentável como conceito do laboratório. | concluído | Criado [GLOSSARY.md](../GLOSSARY.md) com “falha simulada”, a partir da exigência do usuário de observar consequências de erros. Efeitos e recuperação permanecem em refinamento. |
| 007 | 28/10/2026 | `domain-modeling` | Definir o estado de dano confirmado pelo usuário. | concluído | Adicionado “dano virtual” ao [GLOSSARY.md](../GLOSSARY.md), distinguindo dano persistente de falha temporária e de previsão de dano físico. |
| 008 | 28/10/2026 | `domain-modeling` | Preservar a decisão de fidelidade e execução aprovada pelo usuário. | concluído | Criada [ADR-0001](adr/0001-firmware-real-e-falhas-educativas.md) com escolhas, trade-offs e limites de firmware real com falhas educativas. |
| 009 | 28/10/2026 | `to-spec` | Transformar o escopo aprovado em especificação local. | concluído | Publicada [spec](../.scratch/initial-lab/spec.md) com 34 histórias, responsabilidades, falhas, contratos e verificação pelas interfaces e fluxos aprovados. Estado local `open`, prontidão `ready-for-agent`; sem etiquetas de triage configuradas. |
| 010 | 28/10/2026 | `to-tickets` | Dividir a especificação em entregas demonstráveis com dependências. | em andamento | Divisão revisada a pedido do usuário: [11 propostas por prazo](task-proposals/deadline-plan/README.md) para interface em 30/10 e V1 funcional em 06/11, com piloto independente e integração em 05/11. Versão anterior preservada como histórico; aguarda aprovação da divisão revisada conforme etapa 4. |
| 011 | 28/10/2026 | `writing-for-agents` | Atualizar o ponto de entrada dos agentes para o escopo aprovado. | concluído | `AGENTS.md` aponta para a especificação vigente, com o brief reservado para contexto e riscos. |
| 012 | 28/10/2026 | `to-spec` | Registrar os marcos de apresentação solicitados sem alterar o escopo funcional final. | concluído | Spec atualizada com prévia identificada em 30/10, funcionamento completo em 06/11 e critérios distintos de verificação; execução real permanece requisito da V1. |

Skills de implementação, TDD e revisão ainda não foram aplicadas.

## Limite do registro

Este histórico é mantido por instrução aos agentes; não existe interceptação automática de chamadas. Aplicações feitas por outras ferramentas ou pessoas precisam ser registradas por quem as executar.
