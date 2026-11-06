# 15 — Oferecer exemplos editáveis e cancela automática com firmware real

Status: done
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/04 (GitHub #12), v1-completion/05 (GitHub #13), v1-completion/06 (GitHub #14), v1-completion/08 (GitHub #16), v1-completion/09 (GitHub #17), v1-completion/12 (GitHub #20)
GitHub: https://github.com/RLrafael01/ghostlab/issues/23

## What to build

Escolher bancada vazia, Blink, Fade, botão, dimmer com potenciômetro ou cancela pronta e aprender alterando código e montagem.

## Acceptance criteria

- [ ] Cada exemplo abre como projeto editável com ligações reais e sketch comentado compatível com o serviço, sem controlar saídas por animação demonstrativa.
- [ ] Cancela inclui sensor, servo, LED e botão; objeto muda distância, firmware decide pelo limiar e servo move a cancela.
- [ ] Alterar limiar/ângulo no código muda comportamento; desconectar sinal/alimentação produz os efeitos definidos nos contratos.
- [ ] Painel e serial mostram leituras, estado do botão, servo e execução; não sobrepõem editor/controles em tela cheia.
- [ ] Trocar exemplo preserva opção de salvar trabalho e inicia estado de execução conhecido; permite salvar como projeto próprio.
- [ ] Testes compilados e roteiro de navegador cobrem ao menos a cancela e mudanças de código/fios; demais exemplos já possuem testes nas respectivas issues.

## Verificação

Abrir cancela, aproximar objeto, mudar limiar e recompilar; abrir Fade e modificar velocidade; salvar edição como projeto.

## Rastreabilidade

Tarefas em initial-lab: 04 (substituída por exemplo real), 12. Histórias da [especificação original](../../initial-lab/spec.md): 2, 3, 9, 13, 14, 15, 16, 17, 18, 19.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Parcial**. Blink, Fade, LED ligado e desligado já são presets executáveis. Faltam exemplos como projetos completos, botão/dimmer, cancela sensor→firmware→servo, painel/serial e proteção/salvamento ao trocar exemplo. Nenhum critério integral está concluído. Evidência: `src/firmware/examples.js`, `tests/firmware-circuit.test.js`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.

- 05/11/2026 — contribuição parcial na branch `codex/inputs-serial-servo`: oito sketches e montagem explícita dos demos (botão, serial, potenciômetro e servo, além dos quatro originais), com confirmação de substituição da bancada e testes reais de firmware. Isso não entrega projetos persistidos nem cancela; #17/#20 e os critérios completos desta issue continuam pendentes. Nenhum novo critério integral marcado.

- 05/11/2026 (Enzo): implementação no PR #34. CI 42143541418 passou com código compilado original e editado. Roteiro manual em docs/GATE-EXAMPLE.md; fechamento no merge.
