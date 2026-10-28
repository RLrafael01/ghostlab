# Divisão proposta — GhostLab V1

> Versão substituída em 28/10/2026 pela [divisão por prazo](../deadline-plan/README.md). Preservada como histórico; não usar para publicar tickets.

Status: aguardando aprovação da granularidade e dependências. Cada proposta tem seu próprio arquivo; ainda não são tickets publicados no rastreador.

A numeração começa em 02 porque a tarefa 01 de planejamento já foi concluída. Dependências abaixo são somente os bloqueios diretos; as dependências transitivas não são repetidas.

| ID | Proposta | Bloqueada por | Entrega observável |
| --- | --- | --- | --- |
| 02 | [Executar firmware real com botão, LED 3D e serial](02-firmware-botao-led.md) | nenhuma | Em uma montagem fixa mínima, apertar um botão virtual muda a saída de um LED pela execução de um sketch compilado, com mensagens no terminal. |
| 03 | [Editar e executar o próprio programa](03-editar-compilar.md) | 02 | O usuário altera um exemplo comentado no editor, compila e observa seu programa mudar a resposta do LED e do terminal. |
| 04 | [Montar e modificar um circuito digital em 3D](04-montagem-livre.md) | 02 | O usuário cria uma montagem com Uno, protoboard, fios, resistor, botão e LED e observa o resultado no firmware. |
| 05 | [Controlar uma entrada analógica por potenciômetro](05-potenciometro.md) | 04 | O usuário monta um potenciômetro, varia seu valor e observa o firmware e o painel responderem. |
| 06 | [Controlar um servo por sensor de distância](06-sensor-servo.md) | 03, 04 | O usuário conecta sensor e servo, aproxima um objeto na cena e vê o programa comandar o movimento. |
| 07 | [Experimentar falta de alimentação e sinal desconectado](07-falhas-reversiveis.md) | 04 | O usuário executa uma montagem incompleta, observa a falha e solicita uma explicação antes de corrigi-la. |
| 08 | [Provocar e recuperar um curto na alimentação](08-curto.md) | 07 | O usuário liga alimentação a terra, observa a fonte virtual em falha e investiga o caminho do curto. |
| 09 | [Experimentar dano virtual e restaurar componentes](09-dano-led.md) | 07 | O usuário liga um LED sem limitação de corrente no caminho, observa dano persistente e aprende a substituir ou restaurar a peça. |
| 10 | [Salvar, reabrir e compartilhar projetos sem conta](10-salvar-compartilhar.md) | 04 | O usuário salva a montagem e o código no navegador e exporta um arquivo que outra pessoa pode importar. |
| 11 | [Entregar a cancela editável com o ciclo completo](11-exemplo-cancela.md) | 05, 06, 08, 09, 10 | O usuário abre a cancela pronta, modifica código e circuito, experimenta falhas e compartilha o projeto; também pode começar uma bancada vazia. |

## Por que esta divisão

Cada tarefa cruza as camadas necessárias para produzir um comportamento observável. Não há tickets isolados para “fazer backend”, “fazer 3D” ou “escrever todos os testes”. A primeira tarefa valida o caminho técnico completo mais estreito; as demais ampliam esse caminho.

03 e 04 dependem da mesma base, mas editar código não é pré-requisito de criar conexões. 05, 07 e 10 podem ser trabalhadas após 04. 08 e 09 compartilham o tratamento básico de falhas, mas dano de LED não depende da implementação de curto. O arquivo versionado deve admitir todos os tipos; componentes posteriores precisam integrar seus parâmetros à persistência. 11 verifica esses encontros no fluxo completo.

São relações de dependência, não autorização automática para usar subagentes ou modificar os mesmos arquivos simultaneamente. Com duas pessoas, combinar ownership antes de trabalhar nas tarefas disponíveis.

## Revisão solicitada

- As entregas estão no tamanho adequado ou alguma deve ser dividida/agrupada?
- As dependências representam pré-requisitos reais?
- Alguma entrega deve ser reorganizada antes de publicar os tickets?

Após aprovação, publicar um arquivo por ticket em `.scratch/initial-lab/issues/`, mantendo os IDs, critérios e dependências, e usando o estado `open` conforme a convenção local. A tarefa 01 de planejamento permanece concluída e não será modificada pela publicação dos tickets.
