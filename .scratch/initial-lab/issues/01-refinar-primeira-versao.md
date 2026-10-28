# 01 — Definir público e experiência da primeira versão

Status: in-progress
Blocked by: none

## Objetivo

Aplicar `grill-with-docs` à proposta em `docs/PROJECT-BRIEF.md`, distinguindo o que já foi decidido pelo usuário das sugestões ainda abertas.

## Decisões já confirmadas

- Laboratório eletrônico virtual com montagem em 3D.
- Montagem de circuitos, programação e experimentação de microcontroladores antes da construção física.
- Utilizável por pessoas sem hardware em casa.
- Desenvolvimento com as skills do Matt Pocock e tarefas locais.
- Público inicial com algum conhecimento de programação e aprendendo eletrônica.
- Bancada livre e exemplo pronto, ambos editáveis.
- Primeiro exemplo: cancela automática, confirmado após explicação do fluxo.
- Editor textual com exemplos comentados e painel de leituras e estados junto ao terminal serial.
- Permitir erros de montagem e mostrar falhas simuladas, inclusive possível curto, com explicações educativas sem impedir a experimentação.

## Em aberto

- Profundidade de aprendizado esperada.
- Catálogo inicial de falhas simuladas e sua recuperação.
- Placa, linguagem e limites de fidelidade, a definir após alinhar a experiência e investigar a viabilidade técnica.

## Critérios de aceitação

- Público inicial e primeiro fluxo definidos com o usuário.
- Escopo e limites da primeira versão revisados com exemplos observáveis.
- Decisões técnicas pendentes explicitadas, com investigação necessária identificada.
- Entendimento final confirmado pelo usuário antes de publicar a spec e iniciar implementação.

## Comments

- 28/10/2026: setup aprovado; primeira rodada de definição iniciada. A cancela automática continua como proposta, não como escolha confirmada.
- 28/10/2026: entrevista retomada a pedido do usuário após publicar o GhostLab privado. Rodada sobre público, cancela e liberdade de montagem; aguardando respostas antes de fixar o escopo.
- 28/10/2026: usuário confirmou público e bancada livre com exemplo editável (itens 1 e 3). Pediu esclarecimento sobre o item 2; tema do exemplo permanece pendente.
- 28/10/2026: após esclarecimento, usuário aceitou a cancela automática como primeiro exemplo. Próxima rodada trata de código, erros de ligação e acompanhamento da execução.
- 28/10/2026: usuário aceitou editor textual e painel; esclareceu que erros devem poder acontecer e ter consequências observáveis. Termo “falha simulada” registrado em GLOSSARY.md. Recuperação e catálogo de falhas seguem em aberto.
