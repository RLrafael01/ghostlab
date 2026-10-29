# GhostLab — laboratório eletrônico virtual 3D

Monte circuitos, programe um microcontrolador e experimente seu funcionamento no navegador antes de construir no mundo físico.

## Estado do projeto

Escopo da V1 aprovado e especificação publicada no rastreador local. A primeira bancada interativa já pode ser executada localmente. Arduino Uno, C++ e compilação em serviço próprio estão definidos; a integração e a escolha das bibliotecas serão validadas na prova técnica. A divisão por prazo foi aprovada e os tickets locais foram publicados.

Metas: **30/10/2026**, interface 3D interativa com prévia identificada; **06/11/2026**, V1 funcional com firmware real. O piloto técnico começa cedo sem bloquear a primeira apresentação.

## Experiência proposta

1. Abrir uma bancada 3D e adicionar componentes.
2. Conectar os pinos e escrever o programa.
3. Executar a simulação e interagir com botões, sensores e objetos.
4. Observar saídas e mensagens no terminal serial.
5. Salvar o projeto e exportar código e ligações para orientar a montagem física.

## Primeira entrega proposta

Uma cancela automática: um objeto se aproxima do sensor, o firmware decide quando abrir e um servo movimenta a cancela na cena. LEDs e um botão permitem ampliar o projeto.

- [Escopo e decisões em aberto](docs/PROJECT-BRIEF.md)
- [Especificação da V1](.scratch/initial-lab/spec.md)
- [Plano por prazo e dependências](docs/task-proposals/deadline-plan/README.md)
- [Tickets de implementação](.scratch/initial-lab/issues/)
- [Etapas propostas](docs/ROADMAP.md)
- [Revisão final da primeira versão](docs/V1-REVIEW.md)
- [Rascunho do setup das skills](docs/SKILL-SETUP-DRAFT.md)
- [Origem e licença das skills](THIRD_PARTY_NOTICES.md)
- [Histórico de uso das skills](docs/SKILL-USAGE.md)

## Desenvolvimento com as skills do Matt Pocock

As skills estão disponíveis neste projeto em `.agents/skills/`. São arquivos locais versionados, com atualização manual. Cada aplicação deve ser registrada em `docs/SKILL-USAGE.md`.

Fluxo proposto: `setup-matt-pocock-skills` → `grill-with-docs` → `to-spec` → `to-tickets` → `implement` (com TDD e revisão).

Setup concluído: tarefas em Markdown local em `.scratch/`, instruções em `AGENTS.md` e regras em `docs/agents/`. Nenhum framework GSD foi instalado.

Planejamento concluído: [definir a primeira versão](.scratch/initial-lab/issues/01-refinar-primeira-versao.md). Divisão aprovada e tickets publicados; as tarefas 02 (bancada) e 05 (piloto de firmware) podem começar sem bloqueios.

## Executar a bancada

Requer Node.js 22.12+ (ou 20.19+) e navegador com WebGL.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://127.0.0.1:5173). Para gerar a versão de apresentação: `npm run build` e `npm run preview`.

Clique no catálogo para adicionar; selecione na cena ou lista; ajuste X/Z no inspetor ou use as setas com a bancada em foco. Delete remove a seleção. Arraste o fundo para orbitar e use o scroll para zoom; “Visão inicial” restaura a câmera. Código ainda não é executado; conexões são a tarefa 03.
