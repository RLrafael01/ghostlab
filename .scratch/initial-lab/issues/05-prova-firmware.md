# 05 — Validar compilação e execução real em um piloto

Status: open
Milestone: M2
Target: 30/10/2026
Blocked by: none

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Compilar um sketch de Uno em serviço próprio e verificar botão, LED e serial em uma página mínima independente da bancada final.

## Acceptance criteria

- [x] Toolchain e bibliotecas fixadas, com limites de tempo e recursos e instruções para execução local.
- [ ] Firmware realmente compilado executa no navegador; botão altera entrada e firmware controla saída e serial.
- [x] Erro de compilação ou indisponibilidade é visível e não apresenta sucesso falso.
- [ ] Registrar prova e limitações; confirmar viabilidade de entradas, saídas e temporização antes de ampliar o catálogo.
- [x] Não depender de endpoint de demonstração de terceiros; nenhuma conta ou implantação em produção é necessária.

## Comments

- 05/11/2026 (Rafael, auditoria): o piloto de saída do Uno foi entregue na [#9](https://github.com/RLrafael01/ghostlab/issues/9), integrado pelo PR #26 em `6a1f31a`. `pilot.html`, compilador próprio local e emulador executam firmware real; testes existentes cobrem Blink, temporização, erros e indisponibilidade. [Prova e revisão](../../../docs/FIRMWARE-REVIEW.md) e [toolchain/limites](../../../docs/FIRMWARE.md). Este ticket original também exige entrada por botão e serial, ainda pendentes nas [#12](https://github.com/RLrafael01/ghostlab/issues/12) e [#13](https://github.com/RLrafael01/ghostlab/issues/13); o critério de prova de entradas continua parcial. Por isso permanece `open`, sem reabrir ou repetir a #9 concluída.

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.
