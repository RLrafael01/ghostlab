# 08 — Mover servo 3D a partir dos pulsos gerados pelo firmware

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/16

## What to build

Escrever comandos de servo no sketch e observar o eixo virtual acompanhar a posição determinada pelos pulsos e pelas ligações.

## Acceptance criteria

- [ ] Componente tem alimentação, GND e sinal com contrato de pulsos, faixa e limites documentado.
- [ ] Biblioteca Servo em versão fixada compila no serviço; attach/write geram pulsos que o modelo interpreta, sem ler comandos diretamente do texto.
- [ ] Programa alterna ao menos três posições distintas e a cena/painel acompanham, com tempo de resposta explicitado.
- [ ] Retirar alimentação ou sinal provoca o estado definido no contrato; mover a peça preserva conexões.
- [ ] Validar interação dos timers com PWM já suportado; incompatibilidades reais têm limites visíveis, não são mascaradas por animação.
- [ ] Testes com firmware compilado e montagem modificada; parâmetros são integráveis ao formato de projeto.

## Verificação

Executar varredura de posições, editar limites no sketch e retirar/reconectar o sinal.

## Rastreabilidade

Tarefas em initial-lab: 08. Histórias da [especificação original](../../initial-lab/spec.md): 13, 17, 18.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Pendente**. Modelo 3D e pinos existem; faltam interpretação dos pulsos, posição do eixo, contrato de alimentação/sinal e biblioteca Servo fixada com testes compilados. Implementar medição pelos ciclos/eventos do emulador: snapshots de GPIO/PWM a cada 20 ms não preservam a largura dos pulsos. Evidência: `src/firmware/uno-simulation.js`, `scripts/setup-compiler.mjs`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.
