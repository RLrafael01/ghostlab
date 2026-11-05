# 02 — Executar Blink e ligar/desligar o LED pelas ligações da bancada 3D

Status: in-progress
Priority: P0
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: v1-completion/01 (GitHub #9), GitHub #3
GitHub: https://github.com/RLrafael01/ghostlab/issues/10

## What to build

Editar o código na bancada, compilar/executar e ver o LED externo piscar pelo pino digital conectado, com controles de execução nos modos normal e tela cheia.

## Acceptance criteria

- [ ] Um exemplo editável liga GPIO → resistor → LED → GND e pisca usando firmware real; HIGH e LOW também permitem manter o LED ligado ou desligado.
- [ ] A saída chega pelo grafo de jumpers e grupos da protoboard da issue #3. LED ligado ao 5 V fixo não passa a piscar por estar perto de um pino digital.
- [ ] Mudar o período no código muda a cena; mudar o pino exige ligação correspondente. Desconectar GND ou sinal apaga/interrompe o comportamento e reconectar o recupera.
- [ ] Botões Compilar/Executar, Parar e Reiniciar mostram estado e revisão de código executada. Edição durante compilação e respostas fora de ordem não carregam firmware obsoleto como atual.
- [ ] Parar libera execução e define saídas sem sinal ativo; reiniciar zera o estado do firmware. Dano virtual, quando existir, permanece separado.
- [ ] Editor, controles e seleção funcionam em tela cheia e reduzida; sinais observados atualizam o LED, sem temporizador de animação independente.
- [ ] Teste de integração com firmware compilado cobre alteração de código e fios, mantendo regressões de montagem e movimento dos cabos.

## Verificação

Na bancada, demonstrar Blink 1000→250 ms, HIGH constante, LOW constante, troca de GPIO e retirada/reconexão do retorno.

## Rastreabilidade

Tarefas em initial-lab: 06. Histórias da [especificação original](../../initial-lab/spec.md): 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
