# GhostLab V1 — laboratório eletrônico virtual 3D

Status: open
Readiness: ready-for-agent
Escopo e verificação aprovados pelo usuário em 28/10/2026. Divisão em tarefas aprovada e tickets publicados em 28/10/2026. Rastreador: Markdown local; sem etiquetas de triage configuradas.

## Problem Statement

Pessoas com algum conhecimento de programação que estão aprendendo eletrônica precisam experimentar sistemas embarcados mesmo sem possuir uma placa. Elas precisam entender como código e conexões produzem comportamentos corretos e falhas, antes de montar um projeto físico.

## Solution

Uma bancada livre em 3D no navegador de computador, com Arduino Uno virtual, editor C++ no estilo Arduino, compilação em serviço próprio e execução do firmware no navegador. O usuário monta circuitos, interage com sensores e botões, observa estados e mensagens seriais e pode errar, investigar e corrigir.

Um exemplo editável de cancela automática demonstra o ciclo completo. Projetos ficam no navegador e podem ser exportados/importados para compartilhar, sem contas. Falhas educativas têm efeitos funcionais e visuais com limites declarados. Dano virtual persiste durante a sessão até substituição ou restauração explícita.

## User Stories

1. Como estudante, quero abrir o laboratório sem hardware físico, para começar a experimentar.
2. Como estudante, quero criar uma bancada vazia, para inventar meu circuito.
3. Como estudante, quero abrir uma cancela pronta e editável, para aprender com um exemplo funcional.
4. Como estudante, quero navegar pela cena com teclado e mouse, para observar a montagem.
5. Como estudante, quero adicionar, posicionar e remover componentes, para organizar meu circuito.
6. Como estudante, quero identificar os pinos, para escolher as conexões.
7. Como estudante, quero criar e remover fios, para mudar a montagem.
8. Como estudante, quero que a protoboard respeite seus grupos internos de contatos, para compreender suas ligações.
9. Como estudante, quero escrever C++ e modificar exemplos comentados, para controlar a placa virtual.
10. Como estudante, quero compilar meu código pelo GhostLab, para gerar firmware compatível com o Uno.
11. Como estudante, quero ver erros de compilação sem perder meu código, para corrigi-los.
12. Como estudante, quero iniciar, parar e reiniciar a execução, para repetir um experimento.
13. Como estudante, quero que o firmware use os sinais definidos pelas conexões, para comparar montagens.
14. Como estudante, quero apertar um botão virtual, para fornecer uma entrada ao programa.
15. Como estudante, quero girar um potenciômetro, para variar uma entrada analógica.
16. Como estudante, quero aproximar um objeto do sensor, para variar a distância medida.
17. Como estudante, quero observar LEDs e o servo responderem ao firmware, para entender as saídas.
18. Como estudante, quero acompanhar leituras e estados em um painel, para investigar o funcionamento.
19. Como estudante, quero ler mensagens seriais, para depurar meu programa.
20. Como estudante, quero executar montagens incorretas, para aprender com os erros.
21. Como estudante, quero observar um componente sem alimentação ficar inativo, para entender a necessidade de alimentá-lo.
22. Como estudante, quero observar o efeito de desconectar um sinal, para entender o caminho da informação.
23. Como estudante, quero provocar um curto de alimentação e ver seus efeitos, para investigar uma falha simulada.
24. Como estudante, quero observar um LED sofrer dano virtual na condição educativa definida, para entender a necessidade de limitação de corrente.
25. Como estudante, quero localizar o componente ou caminho afetado na cena, para relacionar efeito e montagem.
26. Como estudante, quero solicitar a explicação por “Por que isso aconteceu?”, para investigar antes de receber uma resposta.
27. Como estudante, quero receber causa e sugestão de correção, para reconstruir o circuito.
28. Como estudante, quero que reiniciar preserve danos, para perceber que reiniciar o programa não conserta componentes.
29. Como estudante, quero substituir um componente danificado ou restaurar a simulação, para repetir o experimento.
30. Como estudante, quero salvar e reabrir meu projeto, para continuar depois.
31. Como estudante, quero exportar e importar um projeto, para compartilhar a montagem e o código.
32. Como estudante, quero exportar o código e uma lista de ligações e componentes, para orientar a montagem física dentro dos limites declarados.
33. Como estudante, quero conhecer as limitações dos componentes e falhas suportados, para interpretar corretamente os resultados.
34. Como estudante, quero ver uma mensagem quando a compilação ou o salvamento falhar, para saber como prosseguir sem perder o trabalho existente.

## Implementation Decisions

### Responsabilidades e interfaces

- **Projeto** representa código, componentes com identificadores estáveis, parâmetros, posições, conexões e versão do formato. O estado transitório da execução é separado do projeto.
- **Simulação** é a principal interface pública de verificação: recebe projeto e firmware, permite iniciar/parar/reiniciar, alterar entradas e consultar estados, saídas seriais e falhas. A execução deve permanecer responsiva a parar e reiniciar.
- **Compilação** recebe o código para o alvo Uno fixado e devolve um artefato compatível ou diagnósticos estruturados. Usar serviço próprio com limites de tempo, tamanho e recursos, toolchain e bibliotecas fixadas; indisponibilidade não pode produzir uma execução falsamente atualizada.
- **Emulação** executa firmware real. AVR8js é candidato inicial, sujeito à prova técnica. A integração deve observar GPIO, ADC, serial e temporização; bibliotecas arbitrárias não são prometidas.
- **Circuito e componentes** determinam conectividade, propagação dos sinais suportados, entradas e saídas. Cada componente deve ter contrato documentado de pinos, alimentação, comportamento, desconexão e limitações.
- **Bancada** mostra o estado da simulação e traduz interações do usuário em comandos. Animação de servo e LED precisa decorrer do firmware e do circuito.
- **Persistência** salva o projeto localmente e oferece importação/exportação versionada, com validação antes de substituir o projeto aberto.

### Catálogo e interação

- Uno único, protoboard, fios, LED, resistor, botão, potenciômetro, sensor de distância e servo.
- Bancada livre e exemplo de cancela com circuito e código editáveis; editor com comentários e terminal serial.
- Painel inclui leitura do sensor, estado do botão, posição do servo e estados funcionais pertinentes.
- A montagem orienta o firmware: desconectar ou reconectar um fio precisa alterar o comportamento correspondente.
- O exemplo usa uma distância configurada no código para comandar a abertura; alterações no limiar devem modificar a resposta.

### Falhas e recuperação

| Condição suportada | Efeito educativo | Recuperação |
| --- | --- | --- |
| Alimentação ausente | Componente inativo, indicado no painel. | Corrigir alimentação. |
| Sinal desconectado | Ausência de resposta válida segundo o contrato do componente. | Corrigir conexão. |
| Curto direto entre alimentação e terra | Fonte virtual em falha; componentes dependentes inativos; caminho destacado. | Remover curto e reiniciar. |
| LED ligado diretamente à alimentação sem limitação de corrente no caminho | LED marcado com dano virtual e sem emissão de luz. | Corrigir montagem e substituir LED ou restaurar. |

- A regra de dano é educativa; não representa cálculo preciso de corrente, aquecimento ou tempo até dano. Um resistor qualquer não implica que a montagem seria segura no mundo físico; a V1 não valida genericamente todos os valores e circuitos.
- Avisos de montagem não impedem experimentar falhas. Erros de compilação continuam impedindo gerar novo firmware válido e são apresentados como diagnósticos de código, sem serem confundidos com falhas simuladas.
- A explicação detalhada fica sob demanda; a cena e o painel mostram os efeitos e os elementos afetados.
- Reiniciar execução preserva dano. Restaurar limpa dano e falhas retidas e reinicia o estado da execução, mantendo código e montagem. Uma condição incorreta remanescente pode provocar nova falha.
- Substituir componente danificado exige nova peça funcional e reconexões correspondentes. A operação deve permitir experimentar novamente sem reconstruir todo o projeto.
- Salvar e reabrir preserva o projeto, não o instante da execução nem danos de uma sessão anterior.

## Testing Decisions

Pontos de verificação aprovados na revisão final: comportamentos observáveis pela interface pública da simulação e pelo fluxo do usuário no navegador, incluindo firmware realmente compilado. Não há código ou testes prévios no repositório.

- Priorizar testes de comportamento na interface da simulação para código, conectividade, entradas/saídas, falhas, dano e recuperação; evitar acoplar testes à organização interna dos módulos.
- Validar a fronteira de compilação com geração real de firmware e diagnóstico de programa inválido; simular indisponibilidade para exercitar a recuperação da interface.
- Cobrir persistência por round-trip de projetos e rejeição de importação inválida sem substituir o projeto existente.
- No navegador, verificar o ciclo botão → firmware → LED → serial e depois o ciclo objeto → sensor → firmware → servo na cancela.
- Verificar que mudar código ou fios altera o funcionamento; falhas produzem seus efeitos; a explicação aparece sob demanda; reiniciar preserva dano; restaurar permite repetir.
- Registrar evidência e limitações da prova técnica. Metas numéricas de desempenho e ferramentas de teste serão escolhidas na implementação, a partir de medição, sem alegar precisão já validada.

## Out of Scope

Outras placas, celular como alvo prioritário, simulação elétrica de propósito geral, previsão física precisa de dano, instrumentos avançados, PCB, bibliotecas arbitrárias, execução totalmente offline, contas, nuvem, colaboração simultânea dentro do produto e publicação de serviço em produção.

## Further Notes

### Apresentações e marcos de entrega

Em 28/10/2026, o usuário definiu dois prazos: interface interativa na sexta-feira 30/10/2026 e V1 funcional na sexta-feira 06/11/2026, no fuso America/Sao_Paulo. O escopo funcional final permanece o aprovado acima.

O primeiro marco permite uma prévia interativa: bancada, montagem visual, fios, área de código e cancela com comportamento demonstrativo claramente identificado. Nesse marco, editar código não equivale a executá-lo; a interface deve informar essa limitação. A verificação do primeiro marco observa as interações da prévia, sem usá-las como evidência de execução de firmware.

O segundo marco deve cumprir os comportamentos funcionais e os testes definidos nesta especificação. O piloto de firmware será iniciado cedo e não bloqueará a interface. Sua integração substituirá o comportamento demonstrativo, mantendo os dados do projeto. Reservar 05/11 para integração, correções e ensaio; datas são metas que ainda exigem validação da velocidade de implementação.

O escopo foi confirmado em 28/10/2026. A primeira entrega técnica é um sketch compilado controlando LED por botão na bancada 3D e emitindo serial. A implementação completa amplia esse caminho até montagem livre, componentes, falhas, persistência e exemplo da cancela.

A ordem e a granularidade das tarefas por prazo foram aprovadas pelo usuário; tickets publicados no rastreador local. A escolha das bibliotecas de interface, 3D e persistência é uma decisão de implementação; não há aplicativo executável nem prova técnica realizada até aqui.
