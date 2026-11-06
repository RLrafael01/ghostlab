# Validação final da V1

Base funcional integrada em 05/11/2026: `3077c98` (PR #34). A revisão em teste está em [PR #35](https://github.com/RLrafael01/ghostlab/pull/35). O arquivo [revision.txt da prévia](https://rlrafael01.github.io/ghostlab/pr-35/revision.txt) identifica o código servido. Após a aprovação e o merge, compare o SHA do merge com [revision.txt da main](https://rlrafael01.github.io/ghostlab/main/revision.txt) e repita o ensaio antes de declarar a versão estável.

## Matriz de evidências

Os números são os da [especificação](../.scratch/initial-lab/spec.md). Os caminhos de teste são relativos ao diretório `tests/`. “Ensaio” indica verificação visual ou manual, com o resultado desta rodada registrado abaixo.

| História | Comportamento | Evidência ou verificação restante |
| --- | --- | --- |
| 1 | Abrir o laboratório | CI publica a prévia; carregamento e montagem observados na prévia do PR #34. |
| 2 | Começar em bancada vazia | `projects.test.js` cobre o formato vazio; ensaio do botão Nova bancada. |
| 3 | Abrir cancela editável | `firmware/compile-runtime.test.js` compila a cancela; `firmware-panel.test.js` cobre troca cancelada. |
| 4 | Navegar por teclado e mouse | Ensaio de WASD, setas, rotação, zoom e Visão inicial. |
| 5 | Adicionar, mover, remover peças | `catalog-drag.test.js`, `component-support.test.js`, `visual-wires.test.js`. Ensaio do catálogo completo. |
| 6 | Identificar pinos | `led-connectors.test.js`, `projects.test.js`. Conferir tooltip e inspetor na cena. |
| 7 | Criar e remover fios | `visual-wires.test.js`, `jumper-interaction.test.js`. |
| 8 | Grupos de contatos da protoboard | `electrical-simulation.test.js`, `board-resize.test.js`. |
| 9 | Editar C++ e exemplos | `firmware-panel.test.js`; a cancela editada é recompilada em `firmware/compile-runtime.test.js`. |
| 10 | Compilar para o Uno | `firmware/compile-runtime.test.js` com toolchain real no CI. Compilação HTTPS na prévia depende do serviço ativo. |
| 11 | Corrigir erro preservando código | `firmware-session.test.js`, `compiler-client.test.js`, `firmware/compile-runtime.test.js`. |
| 12 | Iniciar, parar e reiniciar | `firmware-session.test.js`, `firmware/session-peripherals.test.js`. |
| 13 | Sinais seguem a montagem | `firmware/demo-circuits.test.js`, `jumper-firmware-reconnect.test.js`. |
| 14 | Apertar botão virtual | `peripheral-controls.test.js`, `firmware/demo-circuits.test.js`. |
| 15 | Girar potenciômetro | `peripheral-controls.test.js`, `firmware/demo-circuits.test.js`. |
| 16 | Mover objeto e alterar distância | `firmware/compile-runtime.test.js` verifica 20 cm, 75 cm e timeout; ensaio do arraste e controle de distância. |
| 17 | LEDs e servo respondem | `firmware/compile-runtime.test.js`, `firmware/demo-circuits.test.js`, `peripheral-visuals.test.js`. |
| 18 | Painel de leituras e estados | `electrical-peripherals.test.js`, `electrical-panel.test.js`; ensaio de leitura do sensor e servo. |
| 19 | Mensagens seriais | `serial-monitor.test.js`, `firmware/session-peripherals.test.js`, `firmware/demo-circuits.test.js`. |
| 20 | Montagens incorretas permitidas | `circuit-faults.test.js`, `jumper-interaction.test.js`. |
| 21 | Falta de alimentação inativa | `peripheral-circuit.test.js`, `circuit-faults.test.js`. |
| 22 | Retirar sinal altera efeito | `circuit-faults.test.js`, `firmware/demo-circuits.test.js`, teste da cancela compilada. |
| 23 | Curto de alimentação | `circuit-faults.test.js` verifica retenção, caminho e recuperação. |
| 24 | Dano virtual do LED | `circuit-faults.test.js` verifica 5 V e GPIO/PWM energizado. |
| 25 | Localizar caminho ou peça | `circuit-faults.test.js` verifica IDs do curto; ensaio confirma destaque e peça na cena. |
| 26 | Explicação sob demanda | Painel elétrico; ensaio com “Por que isso aconteceu?”. |
| 27 | Causa e correção | Painel elétrico e [modelo elétrico](ELECTRICAL-MODEL.md); conferir instruções após falha. |
| 28 | Reiniciar preserva dano | `circuit-faults.test.js`. |
| 29 | Substituir ou restaurar | `circuit-faults.test.js` verifica novo ID e restauração; ensaio da reconexão manual. |
| 30 | Salvar e reabrir | `projects.test.js`; ensaio com recarga no mesmo navegador. |
| 31 | Exportar e importar | `projects.test.js` cobre arquivo e cancelamento; ensaio em outra sessão de navegador. |
| 32 | Exportar código e guia | `projects.test.js` verifica sketch, GND físico, furos, pontas e ausência de valor validado em ohms. |
| 33 | Limites dos componentes | [Firmware](FIRMWARE.md), [periféricos](PERIPHERALS.md), [sensor](DISTANCE-SENSOR.md), [cancela](GATE-EXAMPLE.md) e guia exportado. |
| 34 | Recuperar de falha sem perder trabalho | `compiler-client.test.js`, `firmware-session.test.js`, `projects.test.js`. Compilador indisponível observado na prévia #34 com sketch preservado. |
| Fade/PWM | Brilho e mudança de ritmo | `firmware-circuit.test.js`, `firmware/compile-runtime.test.js`, `firmware/peripherals-runtime.test.js`. |

## Instalação e ensaio

- Use Node 22.12+ e um navegador de computador com WebGL. Na raiz, execute `npm ci` e `npm run dev`. Para compilar no servidor local, configure primeiro a [toolchain](FIRMWARE.md). O setup automatizado roda em Linux x64 ou macOS Apple Silicon. No Windows, use Linux em WSL2 para a compilação local.
- Rode `npm test`, `npm run test:firmware` e `npm run build`. O CI instala a toolchain e compila sketches reais. Os testes de isolamento do compilador público exigem macOS e a variável documentada no [manual](PUBLIC-COMPILER.md).
- Em uma sessão limpa, monte **Botão** e teste solto/pressionado no LED e no serial. Monte **Potenciômetro** e compare brilho em 0%, 50% e 100%. Monte **Cancela automática** e siga o [roteiro](GATE-EXAMPLE.md).
- Com o serviço HTTPS disponível, altere o limiar da cancela e recompile. Provoque um erro de sintaxe e confira o diagnóstico com o texto preservado. Na indisponibilidade use **Executar exemplo pré-compilado** para o sketch original. O painel informa a origem. Para alterações, restaure o serviço ou use o compilador local.
- Em bancada vazia, adicione os componentes pelo catálogo, confira pinos, redimensione a protoboard e teste fios, foco, teclado e tela cheia. Faça um curto direto, solicite a explicação, corrija e reinicie. Teste dano no LED, reinício, substituição e restauração.
- Salve a montagem, recarregue e abra o projeto salvo. Exporte e importe em uma segunda sessão, compare parâmetros e cabos, e tente importar arquivo inválido. Baixe o sketch e o guia.
- Para medir intervalos de quadros, abra a prévia com `?diagnostico=1`, execute a cancela, abra o monitor serial e clique **Medir quadros (5 s)** no painel elétrico. Mantenha a aba visível e registre mediana, p95, máximo, resolução e navegador. Compare modo normal e tela cheia. O dado mede intervalo entre quadros da bancada com a carga do ensaio, sem prometer desempenho em outros computadores.

## Ensaio de 05/11/2026

| Ambiente | Exercício | Resultado |
| --- | --- | --- |
| Prévia #34, navegador integrado Chromium no Windows | Montar cancela e pedir compilação HTTPS | 7 componentes e 14 fios montados. Serviço indisponível com mensagem recuperável e sketch preservado. |
| Build local do PR #35, Chromium no Windows, 1280 × 720, DPR 1 | Executar artefato publicado pelo CI com o serial aberto | Origem informada como pré-compilada. Em 50 cm, serial mostrou cerca de 49,7 cm e ângulo 0°. A 20 cm, LED aceso e alvo de servo 90°. |
| Mesmo build, modo normal, cena + execução + serial | Medidor de quadros por 5 s, após corrigir o objeto do sensor | 376 intervalos. Mediana 11,2 ms, p95 26,9 ms, máximo 39,0 ms. Amostra única deste computador; não representa taxa garantida. |
| Mesmo navegador, tela cheia | Entrar com cancela em execução | Painel do sensor e medidor permaneceram acessíveis. Repetir a medição com editor e serial abertos na próxima rodada. |

A primeira inspeção revelou que o objeto e o controle de distância só eram atualizados pelo gesto de outro periférico. A atualização passou para o ciclo da cena. O ensaio de 20 cm verificou o controle depois da correção. Os testes de execução da cancela e do sketch alterado passaram no [CI da #23](https://github.com/RLrafael01/ghostlab/actions/runs/42143541418).

## Condições para fechar a #24

- Repetir a compilação de um sketch editado pelo link publicado com o serviço HTTPS ativo. No ensaio de 05/11, o endpoint configurado estava indisponível. O botão explícito de firmware pré-compilado permite ensaiar o exemplo original.
- Repetir o roteiro em outro computador e registrar navegador, configuração, resultados e medição. As evidências locais e de CI não substituem esse ensaio.
- Obter aprovação de outra pessoa, integrar o PR e validar a revisão publicada na main. Só então registrar a revisão estável e encerrar #24 e a issue de acompanhamento #8.

## Revalidação do PR #35

- **Ensaio externo informado pelo solicitante, 4bc075f:** sensor visível; a 20 cm LED ligado e servo a 90°, a 75 cm LED apagado e servo a 0°. UART acompanhou a leitura. Execução pré-compilada funcionou e ficou indisponível após editar. Não foi registrado o navegador/SO dessa máquina nem confirmada compilação remota.
- **Windows, Chromium integrado, build local 8cc85c6:** a montagem com firmware pré-compilado apresentou sessões 1, 2 e 3 após executar, reiniciar e remontar. Cancelamento preservou a bancada. Salvar, reabrir, exportar e reimportar mantiveram 7 componentes e 14 fios. Após reabrir, UART aguardava Serial.begin. Tela cheia mostrou sensor e inspetor; abri o editor flutuante pelo dock, observei Restaurar janela e retornei ao modo normal. Nenhum erro de console capturado nesses fluxos.
- **Diagnóstico:** antes da correção, o teste mostrou NaN no lugar de 1 após reset. No navegador, a confirmação de remontagem duplicada coincidiu com timeout da automação. O fluxo continha uma chamada nativa a confirm depois da confirmação no painel. Com a confirmação única, a automação completou remontagem e cancelamento; o timeout original isoladamente não demonstrou travamento da cena.
- **Testes locais:** 114 passaram, 3 ignorados, build aprovado. Os três casos são de isolamento do compilador público e exigem macOS compatível e GHOSTLAB_TEST_SANDBOX=1. Os testes de sessão cobrem parada, reinício, recompilação, pré-compilado, limpeza e descarte de saída atrasada. Curto, dano/restauração, cabos, apoio, redimensionamento e round-trip foram exercitados na suíte; o ensaio manual de todos esses fluxos segue no roteiro.
- **Compilador público:** o hostname configurado no PR falhou na resolução DNS, antes de qualquer resposta HTTP. A máquina Windows não fornece o adaptador público isolado. Recuperação e teste de erro/recompilação estão em [Compilador público](PUBLIC-COMPILER.md#ensaio-de-recuperação-pelo-link-rafael).

### Roteiro curto para Rafael

1. Confira revision.txt, anote navegador/SO e abra sessão limpa em outro computador. Monte a cancela duas vezes, cancele uma tentativa e confirme outra. Pare, reinicie e limpe o serial; confira número inteiro e ausência de saída antiga.
2. Use o Mac hospedeiro para restaurar o HTTPS conforme o manual. Altere limiar para 60 e ângulo para 120, compile a 50 cm e confira a origem remota e o serial. Introduza erro C++, confira diagnóstico e edição preservada, corrija e compile novamente.
3. Teste botão e dimmer, entrada/saída de tela cheia, posição/tamanho da janela flutuante e inspetor. Meça quadros com serial ativo. Em bancada livre, mova peças e cabos nas bordas e redimensione a protoboard; provoque curto/dano e verifique reinício/restauração.
4. Salve, recarregue e reabra; exporte e importe em sessão limpa e tente um arquivo inválido. Registre diferenças, console e resultados. Após aprovação e merge, compare o SHA na main e repita o ensaio na publicação final.


## Recuperação e ensaio de Rafael — PR #36

Base integrada: main `8a6aa3d1c67ecf8a6ea1bc78b5ed45b90f8e276c`, confirmada no `main/revision.txt` após merge aprovado do PR #35. Configuração recuperada e publicada na prévia #36, revisão funcional `2f89f19fab29727464830233dfd36efe83b1d1de`. Ambiente local: macOS 26.6.2, navegador integrado Chromium, viewport observado 1280 × 720.

| Verificação executada | Evidência observada |
| --- | --- |
| Suíte completa da base integrada | `GHOSTLAB_TEST_SANDBOX=1 npm test`: 117 aprovados, zero ignorados. `npm run test:firmware`: 20 aprovados. Build aprovado. |
| Serviço público próprio | Novo túnel HTTPS encaminha para o compilador isolado em loopback. Metadados: CLI 1.5.1, AVR 1.8.6, Servo 1.3.0. |
| Compilação HTTP e execução | Blink de 1000 ms e 250 ms compilados via HTTPS; SHA-256 conferido e transições HIGH/LOW/HIGH verificadas no AVR. C++ inválido: HTTP 422 `compile-error`. |
| Sketch alterado na prévia | Cancela: LIMIAR_CM=60 e ABERTA=120. A 50 cm, painel mostrou brilho 100%, eco 50 cm e alvo 120°. Origem: “Executando código compilado no serviço de demonstração”, revisão 4. |
| Erro e recuperação pelo navegador | Acrescentado erro C++; diagnóstico exibido e fonte preservada. Após correção e recompilação, revisão 6, sessão 3, servo a 120° e LED aceso. |
| Outro computador | Rafael confirmou na conversa que o roteiro da cancela editada, erro C++ e recuperação deu certo no computador do Enzo, usando Chrome. Sistema operacional e versão do navegador não foram informados; não foram inferidos. Evidência relatada pelo usuário, distinta do ensaio observado diretamente. |
| Main após PR #35 | Cancela original a 20 cm: LED 100%, alvo 90°, sessão 1. Parar apagou LED e mostrou UNO parado. |
| Responsividade na main | Tela cheia com cancela, editor e serial abertos: 300 intervalos em 5 s, mediana 16,7 ms, p95 17,6 ms, máximo 17,8 ms. Amostra única; não garante desempenho em outros equipamentos. |
| Projeto e falha retida | Cancela editada exportada pelo navegador. Arquivo de teste derivado adicionou fio direto 5V→GND. Ao importar, fonte em falha; retirar o fio não limpou a falha. “Reiniciar fonte virtual” recuperou a fonte. |
| Dano e restauração | Arquivo de teste derivado ligou 5V diretamente ao ânodo. Dano identificado, sem emissão. Remover fio e recompilar manteve dano; “Restaurar simulação” recuperou LED 100% com resistor e sketch editado. |
| Console | Nenhum erro capturado nos ensaios da prévia. |

Os arquivos de falha usados no ensaio foram derivados do projeto exportado, preservando IDs e conexões e acrescentando um único jumper. São testes de regras educativas, não previsões físicas de corrente/aquecimento.

### Pendência para encerramento

A recuperação está na prévia #36, não na main até merge. Após revisão de outra pessoa e merge aprovado, conferir `main/revision.txt` e a URL em `main/compiler-config.json`, repetir compilação do sketch editado, erro e recuperação na main. Registrar o SHA final antes de encerrar #24 e #8. Os ensaios manuais históricos da matriz continuam identificados como tais; não afirmar uma nova execução manual de cada gesto a partir de testes automatizados.

O túnel é temporário: manter o Mac, o compilador e o processo cloudflared ativos durante a apresentação. Não contratar hospedagem nem prometer permanência deste endereço. Se reiniciar o túnel, seguir o procedimento de recuperação e publicar a nova configuração por PR.
