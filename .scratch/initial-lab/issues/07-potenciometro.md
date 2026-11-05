# 07 — Ler o potenciômetro no programa

Status: done
Milestone: M2
Target: 03/11/2026
Blocked by: none

Divisão aprovada pelo usuário em 28/10/2026. Ticket publicado no rastreador local. Datas são metas de planejamento, não evidência de conclusão.

## What to build

Montar um potenciômetro e observar seu valor afetar a entrada analógica lida pelo firmware.

## Acceptance criteria

- [x] Adicionar e conectar componente; manipular valor na cena e observar painel ou serial.
- [x] Leitura corresponde ao pino conectado e varia entre valores distintos.
- [x] Contrato registra alimentação, pinos, faixa e limites do modelo.
- [x] Testes observáveis e dados do projeto preservam seu parâmetro; integrar persistência quando disponível.

## Comments

- 28/10/2026: divisão revisada com `to-tickets` para apresentações em 30/10 e 06/11.
- 28/10/2026: divisão e dependências aprovadas pelo usuário; ticket publicado com estado open.

- 05/11/2026 — critérios funcionais concluídos na branch do [PR #30](https://github.com/RLrafael01/ghostlab/pull/30), aguardando merge. Entrada digital, ADC, UART e execução de código editado foram comprovados com firmware real e na bancada pelo link público. O plano v1-completion substitui a sequência do piloto isolado por provas integradas; não replica a bancada em pilot.html. [Contratos](../../../docs/PERIPHERALS.md), [119 testes e roteiro](../../../docs/PERIPHERALS-REVIEW.md). O parâmetro do potenciômetro pertence ao componente; salvamento continua nas #20/#21.
