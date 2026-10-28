# 01 — Definir público e experiência da primeira versão

Status: done
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
- Dano virtual persistente até substituição ou restauração; explicação sob demanda por “Por que isso aconteceu?”.
- Navegador de computador com teclado e mouse; persistência local e exportação/importação de projetos, sem contas na primeira versão.
- Uno com C++ e compilação em serviço próprio; falhas educativas com consequências funcionais e visuais e limites documentados.

## Em aberto

- Nenhuma decisão de produto pendente para publicar a spec; revisão final aprovada pelo usuário.
- Integração e desempenho da execução de firmware a validar na prova técnica.

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
- 28/10/2026: usuário confirmou dano virtual persistente e explicação sob demanda. Apuração técnica delegada conforme `grilling`: execução de firmware, placa inicial e limites do modelo elétrico.
- 28/10/2026: usuário confirmou computador primeiro e armazenamento local com exportação/importação. Investigação registrada em docs/TECHNICAL-FEASIBILITY.md; recomendação técnica aguarda decisão e validação prática.
- 28/10/2026: Uno/C++ com compilação em serviço próprio e falhas educativas aprovados. Decisão registrada em ADR-0001 e recorte consolidado em docs/V1-REVIEW.md para revisão final antes da spec.
- 28/10/2026: usuário confirmou o escopo final e autorizou especificação e divisão em tarefas. Critérios de planejamento atendidos: público, cancela, falhas, recuperação, persistência e verificação aprovados; riscos técnicos explicitados na investigação. Entrevista concluída.
