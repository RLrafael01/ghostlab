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
| 003 | 28/10/2026 | `grill-with-docs` | Refinar público e experiência da primeira versão. | em andamento | Uno/C++, compilação própria e falhas educativas aprovados. [Recorte consolidado](V1-REVIEW.md) aguarda revisão final antes de publicar spec e tarefas. |
| 004 | 28/10/2026 | `grilling` | Conduzir a entrevista iniciada por `grill-with-docs`. | em andamento | Entendimento consolidado com catálogo proposto de falhas, recuperação e comportamentos verificáveis. Confirmação final pendente conforme a skill. |
| 005 | 28/10/2026 | `writing-for-agents` | Incorporar o registro de aplicações às instruções do projeto. | concluído | Adicionada a seção “Registro de uso” ao [AGENTS.md](../AGENTS.md), apontando para este histórico e suas convenções. |
| 006 | 28/10/2026 | `domain-modeling` | Definir a falha experimentável como conceito do laboratório. | concluído | Criado [GLOSSARY.md](../GLOSSARY.md) com “falha simulada”, a partir da exigência do usuário de observar consequências de erros. Efeitos e recuperação permanecem em refinamento. |
| 007 | 28/10/2026 | `domain-modeling` | Definir o estado de dano confirmado pelo usuário. | concluído | Adicionado “dano virtual” ao [GLOSSARY.md](../GLOSSARY.md), distinguindo dano persistente de falha temporária e de previsão de dano físico. |
| 008 | 28/10/2026 | `domain-modeling` | Preservar a decisão de fidelidade e execução aprovada pelo usuário. | concluído | Criada [ADR-0001](adr/0001-firmware-real-e-falhas-educativas.md) com escolhas, trade-offs e limites de firmware real com falhas educativas. |

Skills de implementação, TDD e revisão ainda não foram aplicadas.

## Limite do registro

Este histórico é mantido por instrução aos agentes; não existe interceptação automática de chamadas. Aplicações feitas por outras ferramentas ou pessoas precisam ser registradas por quem as executar.
