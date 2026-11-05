# 16 — Validar e entregar a V1 completa com roteiro de apresentação

Status: open
Priority: P2
Milestone: V1 final — validação e apresentação
Blocked by: v1-completion/07 (GitHub #15), v1-completion/11 (GitHub #19), v1-completion/13 (GitHub #21), v1-completion/14 (GitHub #22), v1-completion/15 (GitHub #23)
GitHub: https://github.com/RLrafael01/ghostlab/issues/24

## What to build

Disponibilizar uma versão estável e reproduzível que cumpra o escopo aprovado, com evidências e limites claros para a apresentação.

## Acceptance criteria

- [ ] Matriz liga todas as 34 histórias da especificação e o novo Fade/PWM a testes/evidências; lacunas são corrigidas e não marcadas como prontas por existir apenas interface.
- [ ] Verificar botão→firmware→LED→serial, dimmer analógico/PWM e objeto→sensor→firmware→servo com sketches realmente compilados.
- [ ] Cobrir montagem livre, todos os componentes, falhas, dano/reinício/restauração e round-trip incluindo parâmetros de sensor/servo/potenciômetro e protoboard variável.
- [ ] Regressões de arraste, cabos, altura nas bordas, redimensionamento, seleção, teclado, foco e tela cheia passam em navegadores de computador definidos a partir da medição.
- [ ] Medir responsividade com execução, serial e cena ativos; corrigir travamentos e documentar configuração/limites em vez de prometer FPS ou precisão não medidos.
- [ ] Prévia do PR usa revisão identificada e compilação própria; testes/build verdes, revisão de outra pessoa e merge aprovado precedem validação do link fixo da main.
- [ ] Documentar instalação local, serviço de compilação, exemplos, limites, roteiro, commit/tag estável e recuperação se a internet falhar sem apresentar demo como código novo executado.
- [ ] Consolidar evidências e registros de skills por responsável, reconciliar IDs/totais dos PRs e encerrar issues somente com critérios atendidos.

## Verificação

Ensaio completo em sessão limpa e outra máquina, incluindo erro de compilação, serviço indisponível, curto, dano e compartilhamento de projeto.

## Rastreabilidade

Tarefas em initial-lab: 12. Histórias da [especificação original](../../initial-lab/spec.md): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34.

Plano e regras de entrega: [README](../README.md). Relações de bloqueio também cadastradas no GitHub.

## Comments

- 05/11/2026: publicado a pedido de Rafael; prioridade imediata para execução real, Blink e dimmer/PWM. Critérios ainda não implementados por esta tarefa de planejamento.

- 05/11/2026 — auditoria da main `0db0ca1`: **Parcial**. CI, prévias identificadas, documentação e testes de bancada/Blink/PWM existem. Faltam matriz de evidências das 34 histórias, fluxos integrados, medição de responsividade, compilação pública, ensaio em outra máquina e versão final estável. As bases atuais não encerram a validação da V1. Evidência: `.github/workflows/pr.yml`, `docs/FIRMWARE-REVIEW.md`. Issue permanece aberta; PR #27 fechado sem merge não conta como entrega.
