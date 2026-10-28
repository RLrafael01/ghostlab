# Issue tracker: Local Markdown

Specs e tarefas deste projeto vivem em `.scratch/` e são versionadas no Git.

## Convenções

- Uma funcionalidade por diretório: `.scratch/<feature>/`.
- Spec: `.scratch/<feature>/spec.md`.
- Uma tarefa por arquivo: `.scratch/<feature>/issues/NN-<slug>.md`, numeradas a partir de `01`.
- Estado perto do início em `Status:`: `open`, `in-progress`, `blocked` ou `done`.
- Dependências em `Blocked by:`, com os números das tarefas ou `none`.
- Conversas e histórico ao final sob `## Comments`.
- Uma tarefa está concluída quando seus critérios de aceitação forem atendidos; registrar a evidência no arquivo.

## Operações

Publicar uma spec ou tarefa significa criar o arquivo local correspondente. Buscar uma tarefa significa ler o arquivo indicado pelo caminho ou número dentro da funcionalidade. Antes de implementar, verificar suas dependências e marcar `in-progress`.

Não há etiquetas de triage configuradas. A migração para outro rastreador depende de uma decisão explícita do usuário.
