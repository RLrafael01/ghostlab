# Revisão do acabamento visual — 29/10/2026

Base: `5de36b8`. Implementação revisada: `e90b29a`. Revisores independentes usando a skill code-review.

## Standards

- P2: a inicialização poderia criar fios para uma peça removida durante o carregamento das demais. Corrigido: referências conferidas na lista ativa antes de ligar as pontas.
- Julgamento: possível duplicação de medidas de contatos, serigrafia e encaixe. Corrigido com BREADBOARD compartilhado.

## Spec

- Limitação menor: perto das extremidades, o terminal de referência podia ser arredondado para coluna inexistente. Corrigido com limite das 63 colunas.
- Sem bloqueios encontrados. Aparência, materiais, sombras, fios, encaixe aproximado e indicação de montagem apenas visual correspondem à solicitação e ao limite de M1.

Resumo: Standards 2 achados (maior: fios órfãos no carregamento); Spec 1 achado menor (encaixe nas extremidades). Todos tratados.

## Evidências

- Build aprovado; permanece aviso sobre bundle JS acima de 500 kB.
- Dois testes automatizados aprovados: pontas acompanham translação/rotação, remoção do fio preserva outras peças e terminal ausente não gera conexão fictícia. Testes escritos após implementação; não se registra aplicação de TDD.
- Navegador: montagem de quatro peças carregada; ajuste da protoboard de X=1,7 para X=2 levou o LED de X≈1,2825 para X≈1,5825. Remover a protoboard deixou as outras três peças disponíveis. Montagem reiniciada depois da verificação.
- Encaixe e fios não validam eletricidade, colisões nem compatibilidade mecânica de todos os terminais; a indicação visual e o README explicam esses limites.
