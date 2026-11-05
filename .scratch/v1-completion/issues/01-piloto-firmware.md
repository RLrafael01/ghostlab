# 01 — Compilar e executar um sketch real do Uno no navegador

Status: open
Priority: P0
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/9

## What to build

Em uma página mínima, editar um sketch C++ do Uno, compilar em serviço próprio e ver uma saída mudar pela execução do firmware. Esta é a primeira implementação a iniciar.

## Acceptance criteria

- [ ] O serviço próprio gera um artefato real para Uno/ATmega328P, com toolchain/core fixados; o navegador o executa em emulador. AVR8js continua candidato até esta prova.
- [ ] Um programa com pinMode, digitalWrite e delay alterna uma saída observável. Trocar 1000 ms por 250 ms no código e recompilar altera a temporização medida.
- [ ] Iniciar, parar e reiniciar funcionam sem travar a interface, inclusive com loop infinito no sketch; o relógio virtual é verificável sem depender do FPS da cena.
- [ ] Erro de C++ e serviço indisponível preservam o texto e mostram diagnóstico; artefato anterior nunca aparece como resultado do código novo.
- [ ] Compilação tem limite de tamanho, tempo, recursos e concorrência; não executa comandos arbitrários recebidos do cliente nem depende de endpoint de demonstração de terceiros.
- [ ] Registrar comando reproduzível, versões, licença, limites e evidência com firmware compilado. Não usar parser de palavras-chave ou animação fixa como execução.

## Verificação

Compilar dois períodos de Blink e um sketch inválido; observar transições em tempo virtual, parar/reiniciar e simular falha do serviço.

## Rastreabilidade

Tarefas em initial-lab: 05. Histórias da [especificação original](../../initial-lab/spec.md): 9, 10, 11, 12, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.
