# 05 — Ler mensagens reais do firmware no monitor serial

Status: done
Priority: P1
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/13

## What to build

Abrir o monitor serial enquanto o firmware executa e acompanhar mensagens enviadas pelo programa, nos dois modos de tela.

## Acceptance criteria

- [x] Serial.begin, Serial.print e Serial.println geram texto a partir da UART emulada, com baud configurado/documentado e quebras de linha corretas.
- [x] Abrir/recolher o painel não reinicia firmware nem perde o código; limpar o terminal não reseta a simulação.
- [x] Buffer tem limite e comportamento de descarte explícito; sketch com muitas mensagens não congela a bancada.
- [x] Parar/reiniciar e nova execução identificam sessões e não misturam mensagens tardias de uma execução encerrada.
- [x] Exemplo compilado imprime contador e estado; a integração posterior com botão/sensor usa o mesmo caminho UART.
- [x] Documentar que entrada de texto serial pelo usuário e bibliotecas arbitrárias não são requisitos desta issue.

## Verificação

Executar contador compilado, conferir sequência/linhas, limpar, reiniciar e testar fluxo contínuo sem congelamento.

## Rastreabilidade

Tarefas em initial-lab: 05, 06. Histórias da [especificação original](../../initial-lab/spec.md): 18, 19.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. O firmware já tem controle de sessões, mas ainda não há UART integrada, transporte das mensagens, buffer limitado ou monitor serial. Evidência: `src/firmware/uno-simulation.js`, `src/firmware/panel.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.

- 05/11/2026 — entrega em andamento na branch `codex/inputs-serial-servo`, base main `3137cad`: UART real e exemplo de contador/estado implementados; o exemplo do botão usa o mesmo caminho de UART. Os limites de 4096 bytes no worker e 8192 caracteres na interface, sessões e escopo somente de saída estão em docs/PERIPHERALS.md. Conferência final do monitor, descarte sob carga e tela cheia ainda pendente. Critérios marcados correspondem às evidências já observadas na branch; issue permanece aberta e `in-progress` até validação e revisão finais. Não é conclusão na main.

- 05/11/2026 — **Concluída na branch, aguardando merge do [PR #30](https://github.com/RLrafael01/ghostlab/pull/30)**, implementação/correções `63f83fc`, base `3137cad`. UART real, contador/estado e monitor nos dois modos; buffer de 4096 bytes no worker e 8192 caracteres na sessão, descarte por unidade, limpeza sem reset, sessões e rejeição de mensagens antigas verificados. Testes de worker real, interface e fluxo de mensagens aprovados; escopo somente de saída documentado. Suítes finais: 98 testes da aplicação aprovados (3 de isolamento macOS ignorados nessa suíte portável) e 18/18 de firmware aprovados. Revisão Standards/Spec sem bloqueadores após correções. [Evidência e roteiro](../../../docs/PERIPHERALS-REVIEW.md). A issue do GitHub permanece aberta até o merge; não é conclusão já presente na main.
