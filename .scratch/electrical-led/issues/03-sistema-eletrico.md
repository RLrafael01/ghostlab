# GitHub #3 — Iniciar o sistema elétrico com conectividade, alimentação e LED

Status: done
Blocked by: none
Source: https://github.com/RLrafael01/ghostlab/issues/3
PR: https://github.com/RLrafael01/ghostlab/pull/6

## Critérios de aceitação

- [x] Representar os grupos internos de contatos da protoboard e as ligações criadas pelos jumpers, inclusive pontas desconectadas.
- [x] No circuito 5 V do Uno → resistor → LED → GND, o LED acende. Retirar o retorno ao GND apaga o LED e reconectá-lo volta a acendê-lo.
- [x] Mover uma peça sem alterar as ligações preserva o estado elétrico. A decisão depende dos terminais ligados, independentemente da posição na cena.
- [x] Cobrir circuito fechado e aberto com testes e documentar os limites do modelo digital simplificado.

Firmware, cálculo analógico e simulação de dano ficam para tarefas seguintes. Este recorte prepara a integração prevista na tarefa local 06.

## Comments

- 05/11/2026 (Enzo): main atualizada por pull até a49f84e; PR #4 dos fios já integrado. PR #6 aberto antes da implementação. Histórico consolidado mantido em docs/SKILL-USAGE.md.
- 05/11/2026 (Enzo): implementação c5fbeba, 32 testes e build aprovados; navegador verificou luz/painel ao desconectar, reconectar e remover GND, mover o LED e abrir tela cheia. Ver docs/ELECTRICAL-MODEL.md e capturas em docs/evidence/. Revisão Spec: 0 achados; Standards: sem bloqueios, sugestão de compartilhar serialização das pontas incorporada. Entrega no PR #6, sem merge; GitHub #3 fecha somente com a integração.
