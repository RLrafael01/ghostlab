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

Clique no catálogo para adicionar; arraste diretamente as peças sobre a bancada para mover. Selecione na cena ou lista; ajuste X/Z no inspetor para posicionar a peça. Clique na bancada e mantenha WASD ou as setas pressionadas para navegar com a câmera sobre sua superfície; essas teclas não movem as peças. Delete remove a seleção. Arraste o fundo para orbitar e use o scroll para zoom; “Visão inicial” restaura a câmera. Código ainda não é executado; conexões são a tarefa 03.

Os oito componentes usam modelos 3D importados, incluindo geometrias CAD convertidas de STEP. Escala comum: 1 mm = 0,0445 unidade da cena. Materiais e alvos de interação são adaptações visuais; não há validação de tolerâncias para fabricação. Fontes, autores e licenças: [atribuições dos modelos](public/models/ATTRIBUTION.md). Para reproduzir as conversões: `node scripts/convert-cad.mjs`.


## Acabamento e montagem de apresentação

A bancada abre com Uno, protoboard, LED, resistor e quatro jumpers **visuais**. Fios curvos acompanham os terminais ao mover as peças e desaparecem quando uma ponta é removida. Essa composição não é um circuito validado e ainda não executa firmware; criar/remover conexões livremente continua na tarefa 03.

“Encaixe visual” aproxima LED, resistor e botão dos contatos da protoboard; é uma ajuda de posicionamento, não valida passo de todos os terminais, polaridade, colisões ou conectividade. Componentes apoiados acompanham a protoboard; removê-la os devolve à bancada. Desative a opção para posicionamento livre. No inspetor, “Focar peça” aproxima a câmera para examinar inscrições e materiais.

Iluminação de estúdio, sombras de contato, materiais de plástico/metal/encapsulamento e serigrafia autoral melhoram a leitura. Inscrições do GhostLab não reproduzem o layout de fabricação do fabricante. A referência visual orienta o acabamento; a placa permanece Uno, sem adicionar Pico ou display OLED ao escopo.

Verificação de fios: `node --test tests/*.test.js`.


## Tela cheia e catálogo

“Tela cheia” usa a API nativa do navegador: catálogo lateral, inspetor e barras somem. Escape ou “Sair da tela cheia” retorna ao layout normal. Se o navegador não permitir, o app informa a falha e permanece no modo normal; não há substituição por uma janela expandida.

Na tela cheia, um dock circular mantém componentes, Código e Visão inicial acessíveis. Arraste horizontalmente, use a roda/trackpad, as setas laterais ou as teclas esquerda/direita para percorrer. O item central aumenta; os laterais diminuem e desaparecem. Clique num item lateral para centralizá-lo e no centro para adicionar/ativar. Arraste uma peça para cima e solte na bancada para posicioná-la; soltar sobre o dock, editor ou fora da cena cancela.

O catálogo e o dock usam ilustrações SVG autorais, sem renderização WebGL para as miniaturas. As peças da bancada continuam usando os modelos CAD. O editor abre como painel sobre a bancada, preservando o código ao recolher ou sair da tela cheia. A animação respeita a preferência de movimento reduzido.

Mudanças passam por branch e Pull Request; não enviar trabalho compartilhado diretamente à main.

## Colaboração e prévias dos PRs

A `main` exige PR, uma aprovação de outra pessoa, conversas resolvidas e o check **Build and tests** passando com a branch atualizada. Novos commits invalidam aprovações anteriores. A regra inclui administradores; force-push e exclusão da main estão bloqueados.

1. Atualize a main e crie uma branch para sua tarefa.
2. Envie os commits e abra um PR para main.
3. Em **Checks → Publish preview**, abra o link da prévia no resumo da execução ou em **View deployment**. O endereço é `https://rlrafael01.github.io/ghostlab/pr-N/`, substituindo N pelo número do PR.
4. A outra pessoa testa, revisa Files changed e aprova. Então faça merge e atualize a main local.

O workflow `.github/workflows/pr.yml` instala dependências, roda `npm test`, faz o build e publica cada PR do próprio repositório em uma pasta independente. A etapa de publicação não executa o código do PR. Forks recebem testes/build, sem publicação automática com permissões de escrita. As prévias são públicas e visuais; não coloque segredos no frontend. A branch `preview-pages` guarda somente arquivos gerados e nunca deve ser mesclada na main. As prévias permanecem disponíveis após fechar o PR; a limpeza é manual nesta versão. Publicações são serializadas em uma fila de até 100 execuções; execuções de commits ultrapassados ou PRs fechados são interrompidas antes de alterar os arquivos publicados. `revision.txt` na pasta da prévia identifica o commit publicado.

Os workflows passam a acompanhar as novas branches criadas da main depois que este PR de configuração for aprovado e mesclado. A prévia do Sites criada anteriormente é uma cópia manual separada.

Fora da tela cheia, o editor permanece aberto na parte inferior da bancada. Em tela cheia começa recolhido e pode ser aberto pelo dock; sair restaura o editor sem perder texto.
