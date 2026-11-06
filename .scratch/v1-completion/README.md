# GhostLab — implementação restante até a V1

Status: in-progress
GitHub: https://github.com/RLrafael01/ghostlab/issues/8

Atualizado em 05/11/2026 a pedido de Rafael. [Acompanhar plano no GitHub](https://github.com/RLrafael01/ghostlab/issues/8).

A [especificação aprovada](../initial-lab/spec.md) continua sendo a fonte do escopo. Este plano detalha o trabalho restante e prioriza código real, Blink e controle suave de brilho por PWM, conforme a nova solicitação. O plano por datas anterior fica como histórico; a versão final aqui é a V1 já aprovada. Outras placas, contas, colaboração simultânea, bibliotecas arbitrárias e simulação analógica de propósito geral continuam fora.

## Estado verificado

Main `8a6aa3d`: PRs #30–#35 integrados. Issues #9–#23 encerradas; #24 e #8 permanecem abertas pela validação final. O PR #35 corrigiu sessão serial, remontagem, cancelamento e objeto do sensor. Os resultados antigos abaixo não são o estado vigente.

Pendências atuais: renovar a configuração HTTPS expirada pelo fluxo de PR, testar código editado na prévia e em outro computador, concluir os ensaios manuais e validar a publicação da main após o merge. [Matriz e evidências](../../docs/V1-FINAL-VALIDATION.md).

## Ordem recomendada

**Entrega pronta para revisão/merge: #12–#16 — botão, serial, potenciômetro, compilação pública e servo.** Piloto, Blink e PWM (#9–#11) já estão integrados. Após integrar o PR #30, avançar com sensor #17, falhas #18 e projetos #20; depois, cancela, recuperação, compartilhamento e entrega final. Editar e compilar pelo link exige o serviço de demonstração ativo; hospedagem estática sozinha não fornece compilação.

| Frente restante | Issues | Resultado para considerar pronto |
| --- | --- | --- |
| Código editado pelo link | #15 | Alterar um sketch em outra máquina, compilar e executar a nova versão sem instalação. |
| Entradas e depuração | #12, #13, #14 | Botão → LED/serial; potenciômetro → analogRead → brilho PWM. |
| Servo, sensor e cancela | #16, #17, #23 | Objeto muda a distância; firmware decide e move a cancela, com exemplo editável. |
| Erros experimentáveis | #18, #19 | Curto, falta de sinal/alimentação, dano e recuperação com causa explicável. |
| Projetos e montagem física | #20, #21, #22 | Salvar/reabrir, compartilhar arquivo e exportar sketch/lista de ligações. |
| Entrega final | #24 | Ensaio integrado, evidências, documentação, histórico de skills e versão estável da main. |

A tabela abaixo preserva a ordem e as dependências originais. As entregas 01–15 foram integradas. A entrega 16 concentra o ensaio final; os pré-requisitos técnicos não são bloqueios abertos.

| Ordem | Prioridade | Entrega e espelho local | GitHub | Pré-requisitos (inclui concluídos) |
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

O prazo original foi 06/11/2026. O fechamento depende das evidências da #24, não da quantidade de issues encerradas. Não apresentar firmware antigo como execução de código editado.
