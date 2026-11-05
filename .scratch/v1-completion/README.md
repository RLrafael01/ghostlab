# GhostLab — implementação restante até a V1

Atualizado em 05/11/2026 a pedido de Rafael. [Acompanhar plano no GitHub](https://github.com/RLrafael01/ghostlab/issues/8).

A [especificação aprovada](../initial-lab/spec.md) continua sendo a fonte do escopo. Este plano detalha o trabalho restante e prioriza código real, Blink e controle suave de brilho por PWM, conforme a nova solicitação. O plano por datas anterior fica como histórico; a versão final aqui é a V1 já aprovada. Outras placas, contas, colaboração simultânea, bibliotecas arbitrárias e simulação analógica de propósito geral continuam fora.

## Estado verificado

- Auditoria em 05/11/2026 sobre a main `0db0ca1`: bancada 3D, montagem, jumpers, fullscreen/inspetor, redimensionamento e editor flutuante integrados. A auditoria conferiu código, histórico de merges e evidências existentes; não equivale a um novo ensaio completo da V1.
- Issues #2 e #3 concluídas: PRs #4 e #6 integrados, com conexões, grupos da protoboard e LED. O PR #7 também foi integrado, com conectores acessíveis e apoio do LED nas bordas.
- Issues #9–#11 concluídas e integradas pelo [PR #26](https://github.com/RLrafael01/ghostlab/pull/26), merge `6a1f31a`: compilação local, firmware real, Blink e PWM. Ver [revisão e testes](../../docs/FIRMWARE-REVIEW.md) e [uso e limites](../../docs/FIRMWARE.md).
- O [PR #27 do Enzo](https://github.com/RLrafael01/ghostlab/pull/27), revisão `212d3d5`, foi fechado sem merge. Seu trabalho parcial de entradas GPIO, falhas e esquema de projeto não está entregue na main e não encerra as issues correspondentes.
- Issues #12–#24 e acompanhamento #8 permanecem abertos. Botão, serial, potenciômetro, servo/sensor, compilação pública, falhas retidas/dano, persistência/exportação e cancela ainda não têm todos os critérios atendidos na main.

## Ordem recomendada

**Próximas entregas funcionais: #12, #13 e #14 — botão, serial e potenciômetro.** Piloto, Blink e PWM (#9–#11) já foram entregues. A #15 continua P0 e pode avançar em paralelo: editar e compilar pelo link de teste precisa de serviço próprio acessível; hospedagem estática sozinha não fornece esse serviço.

Os pré-requisitos de serial e persistência já foram atendidos pelo piloto e pela #3, respectivamente; essas entregas podem avançar sem esperar todos os componentes. Bloqueios são pré-requisitos técnicos, não datas nem uma fila totalmente serial. P0 indica prioridade imediata, P1 os básicos seguintes, e P2 os demais requisitos obrigatórios da V1. Conferir o responsável e assumir a issue antes de iniciar.

| Ordem | Prioridade | Entrega e espelho local | GitHub | Bloqueada por |
| --- | --- | --- | --- | --- |
| 01 | P0 | [Compilar e executar um sketch real do Uno no navegador](issues/01-piloto-firmware.md) | [#9](https://github.com/RLrafael01/ghostlab/issues/9) | none |
| 02 | P0 | [Executar Blink e ligar/desligar o LED pelas ligações da bancada 3D](issues/02-blink-na-bancada.md) | [#10](https://github.com/RLrafael01/ghostlab/issues/10) | v1-completion/01 (GitHub #9), GitHub #3 |
| 03 | P0 | [Controlar brilho do LED por PWM e executar fade suave pelo código](issues/03-pwm-fade-led.md) | [#11](https://github.com/RLrafael01/ghostlab/issues/11) | v1-completion/02 (GitHub #10) |
| 04 | P1 | [Acionar botão virtual e controlar LED com digitalRead](issues/04-botao-digital.md) | [#12](https://github.com/RLrafael01/ghostlab/issues/12) | v1-completion/02 (GitHub #10) |
| 05 | P1 | [Ler mensagens reais do firmware no monitor serial](issues/05-monitor-serial.md) | [#13](https://github.com/RLrafael01/ghostlab/issues/13) | v1-completion/01 (GitHub #9) |
| 06 | P1 | [Girar potenciômetro e regular o LED com analogRead e PWM](issues/06-potenciometro-dimmer.md) | [#14](https://github.com/RLrafael01/ghostlab/issues/14) | v1-completion/03 (GitHub #11) |
| 07 | P0 | [Compilar e executar código pelo link de teste e na apresentação](issues/07-compilacao-na-previa.md) | [#15](https://github.com/RLrafael01/ghostlab/issues/15) | v1-completion/02 (GitHub #10) |
| 08 | P2 | [Mover servo 3D a partir dos pulsos gerados pelo firmware](issues/08-servo-firmware.md) | [#16](https://github.com/RLrafael01/ghostlab/issues/16) | v1-completion/02 (GitHub #10) |
| 09 | P2 | [Medir distância de objeto virtual com sensor e firmware](issues/09-sensor-distancia.md) | [#17](https://github.com/RLrafael01/ghostlab/issues/17) | v1-completion/02 (GitHub #10), v1-completion/05 (GitHub #13) |
| 10 | P2 | [Experimentar falta de alimentação, fio solto e curto com explicação](issues/10-falhas-curto.md) | [#18](https://github.com/RLrafael01/ghostlab/issues/18) | v1-completion/02 (GitHub #10) |
| 11 | P2 | [Simular dano no LED e permitir substituição ou restauração](issues/11-dano-restauracao.md) | [#19](https://github.com/RLrafael01/ghostlab/issues/19) | v1-completion/03 (GitHub #11), v1-completion/10 (GitHub #18) |
| 12 | P2 | [Criar bancada vazia, salvar e reabrir projetos no navegador](issues/12-salvar-reabrir.md) | [#20](https://github.com/RLrafael01/ghostlab/issues/20) | GitHub #3 |
| 13 | P2 | [Compartilhar projeto por exportação e importação de arquivo](issues/13-importar-exportar.md) | [#21](https://github.com/RLrafael01/ghostlab/issues/21) | v1-completion/12 (GitHub #20) |
| 14 | P2 | [Exportar sketch e guia de componentes e ligações para montagem física](issues/14-guia-montagem.md) | [#22](https://github.com/RLrafael01/ghostlab/issues/22) | v1-completion/12 (GitHub #20) |
| 15 | P2 | [Oferecer exemplos editáveis e cancela automática com firmware real](issues/15-exemplos-cancela.md) | [#23](https://github.com/RLrafael01/ghostlab/issues/23) | v1-completion/04 (GitHub #12), v1-completion/05 (GitHub #13), v1-completion/06 (GitHub #14), v1-completion/08 (GitHub #16), v1-completion/09 (GitHub #17), v1-completion/12 (GitHub #20) |
| 16 | P2 | [Validar e entregar a V1 completa com roteiro de apresentação](issues/16-validar-entregar-v1.md) | [#24](https://github.com/RLrafael01/ghostlab/issues/24) | v1-completion/07 (GitHub #15), v1-completion/11 (GitHub #19), v1-completion/13 (GitHub #21), v1-completion/14 (GitHub #22), v1-completion/15 (GitHub #23) |

## Marcos

- [Código funcionando — Blink, PWM e entradas básicas](https://github.com/RLrafael01/ghostlab/milestone/1)
- [V1 completa — componentes, projetos e falhas](https://github.com/RLrafael01/ghostlab/milestone/2)
- [V1 final — validação e apresentação](https://github.com/RLrafael01/ghostlab/milestone/3)

Na publicação inicial do plano em 05/11/2026, o prazo original de 06/11/2026 foi registrado em risco porque o piloto ainda não havia sido comprovado. A prova de compilação/emulação e as entregas Blink/PWM foram concluídas depois, no PR #26. O risco do prazo permanece pelas issues #12–#24 ainda abertas; não foi estimado um novo prazo nem reduzido o escopo. Os marcos organizam a entrega por resultados. Não apresentar animação, leitura de palavras-chave no sketch ou firmware antigo como execução do código atual.

## Cobertura e plano anterior

| Tarefa de initial-lab | Tratamento no plano atual |
| --- | --- |
| 01–02 | Definição e bancada concluídas; conservar evidências anteriores. |
| 03 | Jumpers e modelo elétrico entregues em #2/#3; tarefa antiga continua parcial pelo formato completo de projeto pendente em #20. |
| 04 | Prévia demonstrativa histórica; o exemplo passa diretamente a firmware real em #23, sem implementar novo controlador fictício. |
| 05 | Piloto #9 concluído; tarefa antiga continua parcial por botão #12 e serial #13. |
| 06 | Bancada #10 e PWM #11 concluídos; faltam botão #12, serial #13 e compilação na prévia #15. |
| 07 | Potenciômetro/dimmer #14. |
| 08 | Servo #16 e sensor #17. |
| 09 | Falhas e curto #18. |
| 10 | Dano e recuperação #19. |
| 11 | Salvar #20, compartilhar #21 e guia físico #22. |
| 12 | Exemplos #23, compilação acessível #15 e validação final #24. |

As histórias 1–34 estão rastreadas nas issues. A história 4 (navegação) já é atendida pela bancada e é verificada novamente na entrega final. A validação final cobre a combinação de componentes, persistência, falhas e execução, não apenas a soma de testes isolados.

Os arquivos antigos conservam o histórico e não foram encerrados automaticamente. Para novas implementações, usar esta decomposição e referenciar a tarefa antiga correspondente; não executar ambos os conjuntos como trabalho duplicado. A prévia demonstrativa de cancela foi substituída no plano pela cancela com execução real, preservando o resultado final aprovado.

## Atualização e entrega

As tarefas continuam versionadas em Markdown conforme o rastreador local; GitHub ganha espelhos e relações nativas para facilitar a colaboração. IDs locais 01–16 pertencem a v1-completion; números do GitHub são identificadores diferentes. Atualizar estado e evidência local e no GitHub no PR de cada implementação. Não há sincronização automática dos corpos.

Antes de implementar, conferir bloqueios e assumir a issue. Entregar em branch/PR, com LINK TESTE no início da descrição, testes pertinentes e roteiro reproduzível. Registrar as skills efetivamente utilizadas e o responsável em [SKILL-USAGE](../../docs/SKILL-USAGE.md), com totais atualizados. Uma aprovação de outra pessoa e checks verdes continuam necessários; não dar merge automático por terminar código.

Contrato de conclusão: critérios observáveis atendidos, teste de firmware real quando aplicável, comportamento em tela cheia e reduzida, limitações descritas e revisão. Tickets 01–03 (#9–#11) estão `done`; tickets 04–16 (#12–#24) permanecem `open`. Uma entrega parcial ou um PR fechado sem merge não comprova conclusão na main.

## Base técnica

- [AVR8js](https://github.com/wokwi/avr8js): emulador validado no piloto para CPU, GPIO e timers; recebe código de máquina compilado e exige integração dos demais componentes. [Versões e limites verificados](../../docs/FIRMWARE.md).
- [Fade do Arduino](https://docs.arduino.cc/built-in-examples/basics/Fade/): referência para o exemplo educativo de PWM.
