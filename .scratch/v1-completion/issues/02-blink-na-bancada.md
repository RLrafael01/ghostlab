# 02 — Executar Blink e ligar/desligar o LED pelas ligações da bancada 3D

Status: done
Priority: P0
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: v1-completion/01 (GitHub #9), GitHub #3
GitHub: https://github.com/RLrafael01/ghostlab/issues/10

## What to build

Editar o código na bancada, compilar/executar e ver o LED externo piscar pelo pino digital conectado, com controles de execução nos modos normal e tela cheia.

## Acceptance criteria

- [x] Um exemplo editável liga GPIO → resistor → LED → GND e pisca usando firmware real; HIGH e LOW também permitem manter o LED ligado ou desligado.
- [x] A saída chega pelo grafo de jumpers e grupos da protoboard da issue #3. LED ligado ao 5 V fixo não passa a piscar por estar perto de um pino digital.
- [x] Mudar o período no código muda a cena; mudar o pino exige ligação correspondente. Desconectar GND ou sinal apaga/interrompe o comportamento e reconectar o recupera.
- [x] Botões Compilar/Executar, Parar e Reiniciar mostram estado e revisão de código executada. Edição durante compilação e respostas fora de ordem não carregam firmware obsoleto como atual.
- [x] Parar libera execução e define saídas sem sinal ativo; reiniciar zera o estado do firmware. Dano virtual, quando existir, permanece separado.
- [x] Editor, controles e seleção funcionam em tela cheia e reduzida; sinais observados atualizam o LED, sem temporizador de animação independente.
- [x] Teste de integração com firmware compilado cobre alteração de código e fios, mantendo regressões de montagem e movimento dos cabos.

## Verificação

Na bancada, demonstrar Blink 1000→250 ms, HIGH constante, LOW constante, troca de GPIO e retirada/reconexão do retorno.

## Rastreabilidade

Tarefas em initial-lab: 06. Histórias da [especificação original](../../initial-lab/spec.md): 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026: implementação e aceitação verificadas na branch `codex/firmware-blink-pwm`; integração na main depende de revisão/merge do PR. Evidência: [revisão e testes](../../../docs/FIRMWARE-REVIEW.md), [uso e limites](../../../docs/FIRMWARE.md). 45 testes de aplicação + 3 com compilação real aprovados; navegador confirmou PWM, execução, recuperação e controles nos dois modos.

- 05/11/2026 (Rafael, auditoria): integração confirmada na main pelo [PR #26](https://github.com/RLrafael01/ghostlab/pull/26), commit de merge `6a1f31a`, presente na revisão auditada `0db0ca1`. A [issue #10](https://github.com/RLrafael01/ghostlab/issues/10) está encerrada e o estado local `done` permanece correto. Este registro atualiza a pendência de merge do comentário anterior; a auditoria reutiliza as evidências de aceitação citadas acima, sem alegar uma nova execução de testes. As issues #12–#24 continuam abertas e não são concluídas por esta entrega.
