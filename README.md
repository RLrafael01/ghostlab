# GhostLab — laboratório eletrônico virtual 3D

Monte circuitos, programe um microcontrolador e experimente seu funcionamento no navegador antes de construir no mundo físico.

## Estado do projeto

Repositório inicial de planejamento. Ainda não existe aplicativo executável. Stack, microcontrolador e estratégia de execução de firmware serão definidos após uma prova de viabilidade.

## Experiência proposta

1. Abrir uma bancada 3D e adicionar componentes.
2. Conectar os pinos e escrever o programa.
3. Executar a simulação e interagir com botões, sensores e objetos.
4. Observar saídas e mensagens no terminal serial.
5. Salvar o projeto e exportar código e ligações para orientar a montagem física.

## Primeira entrega proposta

Uma cancela automática: um objeto se aproxima do sensor, o firmware decide quando abrir e um servo movimenta a cancela na cena. LEDs e um botão permitem ampliar o projeto.

- [Escopo e decisões em aberto](docs/PROJECT-BRIEF.md)
- [Etapas propostas](docs/ROADMAP.md)
- [Rascunho do setup das skills](docs/SKILL-SETUP-DRAFT.md)
- [Origem e licença das skills](THIRD_PARTY_NOTICES.md)

## Desenvolvimento com as skills do Matt Pocock

As skills estão instaladas neste projeto em `.agents/skills/`. São arquivos locais versionados, com atualização manual. Ficarão disponíveis para o Codex no próximo turno.

Fluxo proposto: `setup-matt-pocock-skills` → `grill-with-docs` → `to-spec` → `to-tickets` → `implement` (com TDD e revisão).

Setup concluído: tarefas em Markdown local em `.scratch/`, instruções em `AGENTS.md` e regras em `docs/agents/`. Nenhum framework GSD foi instalado.

Primeira tarefa em andamento: [definir a primeira versão](.scratch/initial-lab/issues/01-refinar-primeira-versao.md).
