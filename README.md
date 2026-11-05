# GhostLab — laboratório eletrônico virtual 3D

Monte circuitos, programe um microcontrolador e experimente seu funcionamento no navegador antes de construir no mundo físico.

## Estado do projeto

A bancada executa firmware real do Uno, com Blink e fade/PWM seguindo as ligações. Compilação própria está disponível no servidor local; a prévia estática executa os quatro exemplos originais pré-compilados. [Como executar, testar e limites](docs/FIRMWARE.md). O restante da V1 permanece no [plano de implementação](.scratch/v1-completion/README.md).

Metas originais: **30/10/2026**, interface interativa; **06/11/2026**, V1 funcional. O plano atualizado em 05/11 registra o risco do prazo e organiza a entrega por resultados verificáveis.

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
- [Plano vigente, prioridades e dependências](.scratch/v1-completion/README.md)
- [Plano original por prazo — histórico](docs/task-proposals/deadline-plan/README.md)
- [Issues de implementação restantes](.scratch/v1-completion/issues/)
- [Tickets iniciais — histórico](.scratch/initial-lab/issues/)
- [Etapas propostas](docs/ROADMAP.md)
- [Revisão final da primeira versão](docs/V1-REVIEW.md)
- [Rascunho do setup das skills](docs/SKILL-SETUP-DRAFT.md)
- [Origem e licença das skills](THIRD_PARTY_NOTICES.md)
- [Histórico de uso das skills](docs/SKILL-USAGE.md)

## Desenvolvimento com as skills do Matt Pocock

As skills estão disponíveis neste projeto em `.agents/skills/`. São arquivos locais versionados, com atualização manual. Cada aplicação deve ser registrada em `docs/SKILL-USAGE.md`.

Fluxo proposto: `setup-matt-pocock-skills` → `grill-with-docs` → `to-spec` → `to-tickets` → `implement` (com TDD e revisão).

Setup concluído: tarefas em Markdown local em `.scratch/`, instruções em `AGENTS.md` e regras em `docs/agents/`. Nenhum framework GSD foi instalado.

Planejamento concluído: [definir a primeira versão](.scratch/initial-lab/issues/01-refinar-primeira-versao.md). A divisão inicial foi atualizada em 05/11: [plano restante até a V1](.scratch/v1-completion/README.md), com 16 issues e dependências. A prioridade agora é firmware real → Blink → fade/PWM; a bancada já está implementada.

## Executar a bancada

Requer Node.js 22.12+ (ou 20.19+) e navegador com WebGL.

```sh
npm ci
npm run setup:compiler
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://127.0.0.1:5173). Para gerar a versão de apresentação: `npm run build` e `npm run preview`.

Clique no catálogo para adicionar; arraste diretamente as peças sobre a bancada para mover. Selecione na cena ou lista; ajuste X/Z no inspetor para posicionar a peça. Clique na bancada e mantenha WASD ou as setas pressionadas para navegar com a câmera sobre sua superfície; essas teclas não movem as peças. Delete remove a seleção. Arraste o fundo para orbitar e use o scroll para zoom; “Visão inicial” restaura a câmera. Código é compilado localmente e executado em um worker AVR; a conectividade e o LED usam o modelo elétrico simplificado. [Blink, PWM e prévia pública](docs/FIRMWARE.md).

Sete componentes usam modelos 3D importados, incluindo geometrias CAD convertidas de STEP. A protoboard usa geometria paramétrica com furos reais para permitir alterar a quantidade de colunas. Escala comum: 1 mm = 0,0445 unidade da cena. Materiais e alvos de interação são adaptações visuais; não há validação de tolerâncias para fabricação. Fontes, autores e licenças: [atribuições dos modelos](public/models/ATTRIBUTION.md). Para reproduzir as conversões: `node scripts/convert-cad.mjs`.


## Acabamento e montagem de apresentação

A bancada abre com Uno, protoboard, LED, resistor e cinco jumpers formando um circuito de referência: **D9 → resistor → LED → GND**. Execute Blink ou Fade no editor para controlar o LED pelo firmware e pelas ligações. Retirar o retorno apaga a luz; reconectar a GND volta a acendê-la. Fios curvos acompanham os terminais ao mover as peças. Novos fios podem ser adicionados pelo catálogo e removidos pela lista.

“Encaixe visual” aproxima LED, resistor e botão dos contatos da protoboard; é uma ajuda de posicionamento, não valida passo de todos os terminais, polaridade, colisões ou conectividade. Componentes apoiados acompanham a protoboard; removê-la os devolve à bancada. Desative a opção para posicionamento livre. O apoio na protoboard continua ativo: o LED mantém a altura sobre os barramentos e enquanto seu corpo ainda sobrepõe uma borda; só retorna à altura da mesa ao sair completamente da placa. Os alvos laterais dos cabos não contam como corpo apoiado. No inspetor, “Focar peça” aproxima a câmera para examinar inscrições e materiais.

Iluminação de estúdio, sombras de contato, materiais de plástico/metal/encapsulamento e serigrafia autoral melhoram a leitura. Inscrições do GhostLab não reproduzem o layout de fabricação do fabricante. A referência visual orienta o acabamento; a placa permanece Uno, sem adicionar Pico ou display OLED ao escopo.

Verificação de fios: `node --test tests/*.test.js`.

### Encaixar e desencaixar jumpers

Adicione **Fio jumper** pelo catálogo ou pelo dock em tela cheia: o novo cabo entra com duas pontas livres. Também é possível arrastar o item do catálogo para posicioná-lo na bancada. A lista **Fios jumper** permite focar e remover cada cabo e mostra os terminais conectados ou livres. Arraste um dos pequenos conectores coloridos nas pontas dos cabos. A ponta sai do contato e o cabo acompanha o cursor; a outra ponta continua presa. Aproxime a ponta de um pino ou furo da protoboard: o contato fica destacado e seu nome aparece no aviso sobre a cena. Solte para encaixar, ou solte longe dos contatos para deixar a ponta livre. Escape cancela e restaura o estado anterior, inclusive quando a ponta já estava desconectada. Para facilitar o gesto, selecione o Uno e use “Focar peça”.

No LED, os alvos + e − nas laterais permitem conectar sem esconder as pontas dentro do plástico. As linhas pontilhadas são guias visuais para os terminais, não furos extras da protoboard. Os conectores podem ser agarrados a até 12 pixels do centro; quando há mais de um próximo, vence o mais perto.

A retirada e o encaixe têm transição curta; a preferência de movimento reduzido usa posicionamento imediato. Ligações incorretas são permitidas: o gesto altera referências de terminais e atualiza o estado elétrico simplificado. Circuitos fora do modelo mantêm o LED apagado, sem simular dano. Os contatos GND fisicamente distintos do Uno mantêm referências separadas. Os testes cobrem reconexão, ponta solta, cancelamento, limpeza ao remover peças e movimento reduzido.


## Primeiro circuito elétrico

O painel **Estado elétrico** mostra o LED aceso ou apagado, seu brilho e o motivo. Use **Como testar e limites** na cena para consultar as instruções. Na lista, foque o fio #5 para retirar/reconectar sua ponta em GND; selecione o LED e use **Focar peça** para observar a luz de perto. Mover peças preserva suas ligações.

A protoboard liga a–e e f–j em grupos separados por coluna, além de quatro barramentos contínuos e independentes. Os grupos acompanham a quantidade de colunas ao redimensionar. O encaixe visual das peças não cria contatos elétricos: use fios nos terminais do LED e resistor.

O modelo de conectividade recebe GPIO/PWM do firmware real; o resistor precisa estar no caminho, mas seu valor não é calculado. Não há cálculo analógico geral ou dano; LEDs em série e fontes interligadas não são simulados. [Modelo inicial](docs/ELECTRICAL-MODEL.md) e [extensão para firmware](docs/FIRMWARE.md).

## Tela cheia e catálogo

“Tela cheia” usa a API nativa do navegador: o catálogo vira dock e o inspetor fica em um painel recolhível no canto direito. Escape ou “Sair da tela cheia” retorna ao layout normal. Se o navegador não permitir, o app informa a falha e permanece no modo normal; não há substituição por uma janela expandida.

Na tela cheia, um dock circular mantém componentes, Código e Visão inicial acessíveis. Arraste horizontalmente, use a roda/trackpad, as setas laterais ou as teclas esquerda/direita para percorrer. O item central aumenta; os laterais diminuem e desaparecem. Clique num item lateral para centralizá-lo e no centro para adicionar/ativar. Arraste uma peça para cima e solte na bancada para posicioná-la; soltar sobre o dock, editor ou fora da cena cancela.

O catálogo e o dock usam ilustrações SVG autorais, sem renderização WebGL para as miniaturas. As peças da bancada continuam usando os modelos CAD. O editor abre como painel sobre a bancada, preservando o código ao recolher ou sair da tela cheia. A animação respeita a preferência de movimento reduzido.

Mudanças passam por branch e Pull Request; não enviar trabalho compartilhado diretamente à main.

## Colaboração e prévias dos PRs

A `main` exige PR, uma aprovação de outra pessoa, conversas resolvidas e o check **Build and tests** passando com a branch atualizada. Novos commits invalidam aprovações anteriores. A regra inclui administradores; force-push e exclusão da main estão bloqueados.

1. Atualize a main e crie uma branch para sua tarefa.
2. Envie os commits e abra um PR para main.
3. Em **Checks → Publish site**, abra o link da prévia no resumo da execução ou em **View deployment**. O endereço é `https://rlrafael01.github.io/ghostlab/pr-N/`, substituindo N pelo número do PR.
4. A outra pessoa testa, revisa Files changed e aprova. Então faça merge e atualize a main local.

O workflow `.github/workflows/pr.yml` instala dependências, roda `npm test`, faz o build e publica cada PR do próprio repositório em uma pasta independente. A etapa de publicação não executa o código do PR. Forks recebem testes/build, sem publicação automática com permissões de escrita. As prévias são públicas e executam os exemplos de firmware pré-compilados. Compilar texto alterado requer o servidor local até a issue #15; não coloque segredos no frontend. A branch `preview-pages` guarda somente arquivos gerados e nunca deve ser mesclada na main. As prévias permanecem disponíveis após fechar o PR; a limpeza é manual nesta versão. Publicações são serializadas em uma fila de até 100 execuções; execuções de commits ultrapassados ou PRs fechados são interrompidas antes de alterar os arquivos publicados. `revision.txt` na pasta da prévia identifica o commit publicado.

Os workflows passam a acompanhar as novas branches criadas da main depois que este PR de configuração for aprovado e mesclado. A prévia do Sites criada anteriormente é uma cópia manual separada.

Fora da tela cheia, o editor permanece aberto na parte inferior da bancada. Em tela cheia começa recolhido e pode ser aberto pelo dock; sair restaura o editor sem perder texto.

## Site da main

Link fixo: https://rlrafael01.github.io/ghostlab/main/

Após o merge do PR que adiciona esta configuração, cada push na main (incluindo merges) roda testes e build e publica automaticamente neste endereço. Aguarde **Build and tests** e **Publish site** ficarem verdes no GitHub Actions. Não é necessário pull para testar pelo navegador; pull continua necessário para atualizar o código local.

Falha nos testes/build preserva o último site publicado. A main e os PRs compartilham uma fila de publicação, mas usam pastas independentes. Execuções ultrapassadas da main são rejeitadas antes de publicar. O arquivo `main/revision.txt` identifica o commit publicado. O site só muda após a publicação terminar; aprovar um PR sem fazer merge não atualiza a main.

## Inspetor e cores dos jumpers

Clique em uma peça ou no corpo de um jumper para selecioná-lo. O botão Inspetor mostra ou recolhe os detalhes nos dois modos. Em tela cheia, o painel ocupa o canto direito e permite remover a seleção. A cor do fio selecionado pode ser alterada ali; “Novo fio”, na barra superior, define a cor dos próximos jumpers adicionados pelo catálogo ou dock. Em tela cheia, “Novo fio” aparece quando Fio jumper está no centro do dock. As cores são visuais.

Ao entrar e sair da tela cheia, a escala aparente das peças é preservada. Pontas conectadas acompanham as peças no mesmo quadro, incluindo peças apoiadas na protoboard. Durante o arraste, as pontas seguem a superfície sob o cursor e voltam à altura da bancada quando soltas fora dos componentes. A seleção usa contornos espessos com margem, inclusive nas duas pontas do jumper, preservando a cor do cabo. Ao arrastar um jumper do catálogo ou dock sobre a protoboard, ele é colocado acima da superfície. Um gesto iniciado para o lado no dock pode continuar para cima para colocar a peça.

Clique no card de instruções dos jumpers para recolhê-lo em uma lâmpada; clique novamente para expandir. A transição respeita a preferência de movimento reduzido.

## Redimensionar a protoboard

Selecione a protoboard e arraste uma das duas alças verdes nas extremidades. O comprimento muda em passos de uma coluna, entre 10 e 126 colunas, mantendo o tamanho dos furos, o passo de 2,54 mm, a largura e a altura. O inspetor mostra a quantidade atual de colunas e furos. O padrão de 63 colunas tem 830 contatos.

Os terminais que continuam presentes conservam seus identificadores. Pontas ligadas a contatos removidos ficam soltas e peças apoiadas nessas colunas voltam para a bancada. Escape durante o arraste restaura o tamanho, as peças e as ligações do início do gesto. Aumentar depois de concluir uma redução deixa os fios retirados soltos para reconexão manual.
