# 10 — Experimentar falta de alimentação, fio solto e curto com explicação

Status: open
Priority: P2
Milestone: V1 completa — componentes, projetos e falhas
Blocked by: v1-completion/02 (GitHub #10)
GitHub: https://github.com/RLrafael01/ghostlab/issues/18

## What to build

Executar uma montagem incorreta, observar o efeito no circuito e pedir uma explicação que ajude a corrigir o problema.

## Acceptance criteria

- [ ] No circuito GPIO/LED, alimentação ausente e sinal desconectado produzem efeitos e motivos diferenciados; reconectar recupera falhas reversíveis.
- [ ] Curto direto entre alimentação e GND entra em falha retida na fonte virtual, inativa saídas dependentes e destaca o caminho envolvido.
- [ ] Retirar curto sozinho não recupera a fonte: remover a condição e reiniciar recupera; reiniciar com curto reaplica a falha.
- [ ] Conexão através de resistor não é classificada automaticamente como curto direto; circuitos não suportados são distinguíveis de falhas modeladas.
- [ ] Montagem incorreta continua permitida. Explicação detalhada só aparece em “Por que isso aconteceu?”, com causa e sugestão ligada aos elementos afetados.
- [ ] Contratos de botão, potenciômetro, sensor e servo usam as mesmas regras conforme forem integrados; validação final cobre todos.
- [ ] Testes exercitam causar, explicar, corrigir e reiniciar; não alegar previsão física de aquecimento/corrente.

## Verificação

Retirar alimentação, soltar sinal e fechar curto em três casos separados; observar efeito, pedir explicação e recuperar pelo procedimento correto.

## Rastreabilidade

Tarefas em initial-lab: 09. Histórias da [especificação original](../../initial-lab/spec.md): 20, 21, 22, 23, 25, 26, 27, 33.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
