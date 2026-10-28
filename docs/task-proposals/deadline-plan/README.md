# Entregas por prazo — GhostLab

Status: divisão aprovada pelo usuário em 28/10/2026. Os 11 tickets foram publicados em `.scratch/initial-lab/issues/`; os arquivos desta pasta preservam as propostas revisadas.

Timezone: America/Sao_Paulo. Primeira apresentação: sexta-feira, **30/10/2026**. Apresentação funcional: sexta-feira, **06/11/2026**. Substitui a divisão anterior de 10 propostas, preservada apenas como histórico.

## M1 — interface interativa em 30/10

Bancada 3D com navegação, componentes manipuláveis, pinos e fios, área de código editável, exemplo de cancela e controles para explorar seu comportamento visual. É uma prévia claramente identificada; não promete compilar ou interpretar o código do editor. Deve funcionar localmente sem depender do serviço de compilação.

## M2 — V1 funcional em 06/11

Substituir o comportamento demonstrativo por execução real de firmware, com Uno/C++, editor e compilação própria, conectividade, catálogo aprovado, leituras, serial, falhas educativas, dano/recuperação e persistência local. Integrar e ensaiar até 05/11, reservando 06/11 para apresentação e ajustes essenciais.

## Propostas individuais

| ID | Marco | Meta | Entrega | Bloqueada por |
| --- | --- | --- | --- | --- |
| 02 | M1 | 29/10 | [Explorar e organizar a bancada 3D](02-bancada-interativa.md) | nenhuma |
| 03 | M1 | 29/10 | [Montar e alterar ligações na prévia](03-fios-interativos.md) | 02 |
| 04 | M1 | 30/10 | [Apresentar a cancela como prévia interativa](04-previa-cancela.md) | 03 |
| 05 | M2 | 30/10 | [Validar compilação e execução real em um piloto](05-prova-firmware.md) | nenhuma |
| 06 | M2 | 02/11 | [Executar o código do usuário no circuito 3D](06-firmware-na-bancada.md) | 03, 05 |
| 07 | M2 | 03/11 | [Ler o potenciômetro no programa](07-potenciometro.md) | 06 |
| 08 | M2 | 03/11 | [Controlar a cancela pelo firmware e sensor](08-sensor-servo.md) | 06 |
| 09 | M2 | 04/11 | [Investigar falhas de ligação e curto](09-falhas-curto.md) | 06 |
| 10 | M2 | 04/11 | [Experimentar dano virtual e restauração](10-dano-recuperacao.md) | 09 |
| 11 | M2 | 03/11 | [Salvar e compartilhar código e montagem](11-projetos-locais.md) | 03 |
| 12 | M2 | 05/11 | [Apresentar o ciclo completo da V1](12-apresentacao-funcional.md) | 04, 07, 08, 10, 11 |

## Sequência e pontos de controle

- **28–29/10:** bancada e fios (02–03); iniciar o piloto real (05), que não depende da interface. São frentes independentes, sem presumir equipe ou disponibilidade simultânea.
- **30/10:** prévia da cancela e ensaio M1 (04). O piloto (05) tem a mesma meta para expor cedo riscos do segundo marco, mas não bloqueia a primeira apresentação.
- **02/11:** integrar firmware, editor e circuito (06).
- **03/11:** entradas analógicas (07), sensor/servo (08) e projetos locais (11). Persistência pode começar antes, após 03.
- **04/11:** falhas (09) e dano/recuperação (10).
- **05/11:** exemplo completo, verificação dos encontros entre funcionalidades, correções e cópia estável (12).
- **06/11:** ensaio e apresentação da V1 funcional.

02/11 é feriado nacional; a meta nesse dia pressupõe disponibilidade e deve ser antecipada se não houver trabalho. O cronograma é ambicioso e ainda não há velocidade medida. Se o piloto não demonstrar firmware real até 30/10, sinalizar risco para M2 e renegociar a sequência/escopo com o usuário; não apresentar a prévia como implementação funcional nem reduzir silenciosamente a V1.

## Dependências e revisão

As datas não criam bloqueios artificiais: 05 pode começar imediatamente; 11 depende apenas de 03. 06 reutiliza montagem e sinais do projeto e a integração do piloto. 12 depende da prévia e de todas as funcionalidades finais, diretamente ou por suas dependências transitivas.

A prévia deve compartilhar os dados da montagem com a implementação funcional, mas manter seu comportamento demonstrativo separado e identificado. A ordem prioriza uma apresentação observável, sem transformar artefatos visuais em evidência de execução de firmware.

Cada tarefa é uma entrega demonstrável, com critérios no próprio arquivo. Tamanho, dependências e divisão aprovados pelo usuário; tickets locais publicados. Nenhuma automação ou lembrete foi criado; as datas são apenas o plano de entrega.
