# 07 — Compilar e executar código pelo link de teste e na apresentação

Status: in-progress
Priority: P0
Milestone: Código funcionando — Blink, PWM e entradas básicas
Blocked by: none
GitHub: https://github.com/RLrafael01/ghostlab/issues/15

## What to build

Outra pessoa abre a prévia do PR no navegador, edita Blink e o executa sem instalar compilador ou possuir uma placa.

## Acceptance criteria

- [ ] Prévia usa serviço de compilação próprio de demonstração acessível por HTTPS e configurável; documentar execução local equivalente e ciclo de disponibilidade.
- [ ] Fluxo mantém toolchain fixa e limites do piloto, credenciais somente no servidor, origens permitidas e limites de uso adequados ao link público.
- [ ] Código inválido, limite excedido, timeout e serviço fora do ar mostram mensagens recuperáveis, sem perder edição ou executar silenciosamente firmware antigo.
- [x] Identificar compilação/execução atual; resposta de uma requisição substituída não sobrescreve a nova.
- [ ] Validar em navegador de outra sessão e nas pastas de PR/main, respeitando a configuração de base dos assets.
- [ ] Não pressupor que hospedagem estática compile C++; documentar endpoint, custos/limites e configuração de segredos. Serviço comercial em produção permanece fora do escopo.
- [ ] Caso a infraestrutura não esteja disponível, registrar bloqueio real; uma animação ou apenas um firmware pré-compilado não satisfaz editar→compilar→executar.

## Verificação

Abrir link de teste em sessão limpa, alterar Blink, compilar e observar resultado; repetir com C++ inválido e serviço indisponível.

## Rastreabilidade

Tarefas em initial-lab: 05, 06, 12. Histórias da [especificação original](../../initial-lab/spec.md): 1, 9, 10, 11, 12, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Parcial**. Identificação da revisão e descarte de respostas substituídas já funcionam; critério correspondente marcado, com três testes de sessão aprovados. Faltam endpoint público HTTPS configurável, disponibilidade/limites públicos e validação em outra sessão. A prévia estática executa somente exemplos originais pré-compilados; código editado ainda exige o servidor local. Evidência: `src/firmware/session.js`, `tests/firmware-session.test.js`, `src/firmware/compiler-client.js`, `docs/FIRMWARE.md`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.

- 05/11/2026 — entrega em andamento na branch `codex/inputs-serial-servo`, base main `3137cad`: Em implementação: serviço próprio de demonstração isolado, configuração HTTPS por pasta e túnel temporário operado pelo responsável. Orientações em docs/PUBLIC-COMPILER.md. O serviço depende do computador/túnel ativos; não é produção. A validação por navegador/HTTPS nas pastas PR/main, erros e disponibilidade será registrada antes de concluir. O critério de revisão executada já comprovado continua marcado. Critérios marcados correspondem às evidências já observadas na branch; issue permanece aberta e `in-progress` até validação e revisão finais. Não é conclusão na main.
