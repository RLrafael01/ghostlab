# 05 — Ler mensagens reais do firmware no monitor serial

Status: open
Priority: P1
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/13

## What to build

Abrir o monitor serial enquanto o firmware executa e acompanhar mensagens enviadas pelo programa, nos dois modos de tela.

## Acceptance criteria

- [ ] Serial.begin, Serial.print e Serial.println geram texto a partir da UART emulada, com baud configurado/documentado e quebras de linha corretas.
- [ ] Abrir/recolher o painel não reinicia firmware nem perde o código; limpar o terminal não reseta a simulação.
- [ ] Buffer tem limite e comportamento de descarte explícito; sketch com muitas mensagens não congela a bancada.
- [ ] Parar/reiniciar e nova execução identificam sessões e não misturam mensagens tardias de uma execução encerrada.
- [ ] Exemplo compilado imprime contador e estado; a integração posterior com botão/sensor usa o mesmo caminho UART.
- [ ] Documentar que entrada de texto serial pelo usuário e bibliotecas arbitrárias não são requisitos desta issue.

## Verificação

Executar contador compilado, conferir sequência/linhas, limpar, reiniciar e testar fluxo contínuo sem congelamento.

## Rastreabilidade

Tarefas em initial-lab: 05, 06. Histórias da [especificação original](../../initial-lab/spec.md): 18, 19.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. O firmware já tem controle de sessões, mas ainda não há UART integrada, transporte das mensagens, buffer limitado ou monitor serial. Evidência: `src/firmware/uno-simulation.js`, `src/firmware/panel.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.
