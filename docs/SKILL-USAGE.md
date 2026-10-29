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
| 010 | 28/10/2026 | `to-tickets` | Dividir a especificação em entregas demonstráveis com dependências. | concluído | Divisão por prazo aprovada pelo usuário. Publicados [11 tickets individuais](../.scratch/initial-lab/issues/) com estado `open`, metas e dependências. Tarefas 02 e 05 sem bloqueios; propostas preservadas como histórico. |
| 011 | 28/10/2026 | `writing-for-agents` | Atualizar o ponto de entrada dos agentes para o escopo aprovado. | concluído | `AGENTS.md` aponta para a especificação vigente, com o brief reservado para contexto e riscos. |
| 012 | 28/10/2026 | `to-spec` | Registrar os marcos de apresentação solicitados sem alterar o escopo funcional final. | concluído | Spec atualizada com prévia identificada em 30/10, funcionamento completo em 06/11 e critérios distintos de verificação; execução real permanece requisito da V1. |

Skills de implementação, TDD e revisão ainda não foram aplicadas.

## Limite do registro

Este histórico é mantido por instrução aos agentes; não existe interceptação automática de chamadas. Aplicações feitas por outras ferramentas ou pessoas precisam ser registradas por quem as executar.

## Aplicações de 29/10/2026

| ID | Data | Skill | Objetivo | Estado | Resultado |
| --- | --- | --- | --- | --- | --- |
| 013 | 29/10/2026 | `implement` | Implementar tarefa 02 | concluído | Bancada Three.js/Vite, catálogo, seleção, posição, remoção, câmera e editor visual. Build aprovado; verificação no navegador realizada. |
| 014 | 29/10/2026 | `code-review` | Revisar tarefa 02 | concluído | Dois revisores: padrões e especificação. Corrigidos campos de posição, identificação de pinos por tooltip, instruções locais e licença indevida. Formatação aplicada; modularização futura permanece recomendação. |

A skill `tdd` foi lida, mas não aplicada em ciclo red/green nesta implementação; não há testes automatizados adicionados até este registro.

| 015 | 29/10/2026 | `implement` | Refinar modelos e permitir arraste direto | concluído | Modelos procedurais detalhados; arraste com captura de ponteiro e câmera desativada durante movimento. Arraste da Uno verificado no navegador. |
| 016 | 29/10/2026 | `code-review` | Revisar arraste e modelos | concluído | Dois eixos revisados: corrigida inércia da câmera durante arraste e associados nomes aos terminais reais dos modelos. |

| 017 | 29/10/2026 | `implement` | Substituir representações procedurais por modelos CAD importados | concluído | Oito modelos importados com fontes/licenças; conversão STEP→GLB reproduzível. Build e sintaxe aprovados; adição dos oito tipos, arraste do Uno e remoção de segunda protoboard verificados no navegador. |
| 018 | 29/10/2026 | `code-review` | Revisar integração de modelos CAD | concluído | Dois revisores contra 66533f9: corrigidos 32 alvos de pinos Uno, descarte de buffers instanciados e seleção durante arraste. Metadados dos headers compartilhados com catálogo. Ver CAD-REVIEW.md. |

| 019 | 29/10/2026 | `implement` | Navegar sobre a bancada com WASD e setas | concluído | Câmera e alvo movem-se no plano com WASD/setas enquanto a bancada tem foco. Build aprovado; W/setas, posição preservada da peça e digitação no editor verificados no navegador. |

| 020 | 29/10/2026 | `code-review` | Revisar navegação pelo teclado | concluído | Base 064922e, implementação d8633ff. Standards: 0 achados; Spec: 0 achados. Revisores independentes verificaram foco, liberação de teclas, movimento no plano e preservação do arraste. |

| 021 | 29/10/2026 | `implement` | Aproximar o acabamento visual da referência enviada | concluído | Serigrafia autoral, materiais, iluminação, fios curvos, foco de peça e encaixe visual. Build e 2 testes de fios aprovados; transporte do LED com a base e remoção da protoboard verificados no navegador. |

| 022 | 29/10/2026 | `code-review` | Revisar acabamento, fios e montagem visual | concluído | Dois eixos contra 5de36b8. Corrigidos criação de fios para peças removidas durante carregamento e encaixe fora das colunas válidas; medidas da protoboard centralizadas. Ver VISUAL-REVIEW.md. |

| 023 | 29/10/2026 | `implement` | Tela cheia, código recolhível e catálogo arrastável com miniaturas | concluído | Tela cheia com catálogo, editor recolhível, miniaturas CAD e arraste com animação. Build e testes existentes aprovados; navegador confirmou fullscreen, inserção por arraste e preservação do código. |
| 024 | 29/10/2026 | `code-review` | Revisar tela cheia, miniaturas e arraste do catálogo | concluído | Standards: 1 achado (cache de falha da miniatura), corrigido; Spec: 0 achados. Listeners de cancelamento limitados ao arraste ativo. |
| 025 | 29/10/2026 | `pr` | Preparar PR para colaboração no GhostLab | concluído | PR #1 aberto: https://github.com/RLrafael01/ghostlab/pull/1. Descrição com estrutura, evidências e impacto; sem merge na main. |

| 026 | 29/10/2026 | `implement` | Redesenhar fullscreen com dock circular e ilustrações | concluído | Fullscreen nativo verificado; carrossel horizontal, abertura de Código e inserção vertical de LED testados no navegador. SVGs autorais substituem os renders das miniaturas. |

| 027 | 29/10/2026 | `code-review` | Revisar dock circular e fullscreen nativo | concluído | Standards: 2 achados corrigidos (estilos da prévia arrastada e cancelamento de gesto no fundo). Spec: 0 achados. Base 9f639c1. |
| 028 | 29/10/2026 | `pr` | Atualizar PR #1 para o novo dock | concluído | PR #1 atualizado com fullscreen nativo, dock circular e SVGs. Título e descrição refletem o resultado; sem merge na main. |

| 029 | 29/10/2026 | `implement` | Fluxo de revisão, CI, prévias por PR e editor normal visível | concluído | Editor normal restaurado; 4 testes e build aprovados. Proteção da main aplicada; workflow de CI/prévias adicionado ao PR #1. |
| 030 | 29/10/2026 | `tdd` | Comportamento público do editor ao alternar fullscreen | concluído | Dois ciclos red/green: editor visível inicialmente; fullscreen recolhe e saída restaura sem perder texto. Fronteira: interação da interface aprovada no pedido e na spec. |
| 031 | 29/10/2026 | `code-review` | Revisar colaboração e comportamento do editor | concluído | Base 044de3e. Standards: 2 achados; Spec: 1 (sobreposto). Corrigidos cancelamento de fila e sobrescrita por commit obsoleto. |
| 032 | 29/10/2026 | `pr` | Atualizar PR #1 com editor e fluxo de colaboração | concluído | PR #1 atualizado com CI, prévias, proteção e editor; sem merge. |
