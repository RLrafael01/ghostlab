# GhostLab — laboratório eletrônico virtual 3D

Monte circuitos, programe um microcontrolador e experimente seu funcionamento no navegador antes de construir no mundo físico.

## Estado do projeto

Escopo da V1 aprovado e especificação publicada no rastreador local. Ainda não existe aplicativo executável. Arduino Uno, C++ e compilação em serviço próprio estão definidos; a integração e a escolha das bibliotecas serão validadas na primeira entrega técnica. A divisão em tarefas aguarda revisão.

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
- [10 propostas de tarefas e dependências](docs/task-proposals/initial-lab/README.md)
- [Etapas propostas](docs/ROADMAP.md)
- [Revisão final da primeira versão](docs/V1-REVIEW.md)
- [Rascunho do setup das skills](docs/SKILL-SETUP-DRAFT.md)
- [Origem e licença das skills](THIRD_PARTY_NOTICES.md)
- [Histórico de uso das skills](docs/SKILL-USAGE.md)

## Desenvolvimento com as skills do Matt Pocock

As skills estão disponíveis neste projeto em `.agents/skills/`. São arquivos locais versionados, com atualização manual. Cada aplicação deve ser registrada em `docs/SKILL-USAGE.md`.

Fluxo proposto: `setup-matt-pocock-skills` → `grill-with-docs` → `to-spec` → `to-tickets` → `implement` (com TDD e revisão).

Setup concluído: tarefas em Markdown local em `.scratch/`, instruções em `AGENTS.md` e regras em `docs/agents/`. Nenhum framework GSD foi instalado.

Planejamento concluído: [definir a primeira versão](.scratch/initial-lab/issues/01-refinar-primeira-versao.md). Próximo passo: revisar a divisão proposta para publicar os tickets de implementação.
