# Revisão dos modelos CAD — 29/10/2026

Base: `66533f9863e40893afed33a78b8ba6319d038478`. Implementação inicial: `9fc3e8d`. Dois agentes independentes pela skill code-review; correções aplicadas em seguida.

## Standards

1. P2: buffers de InstancedMesh não eram liberados na remoção. Corrigido com dispose do objeto, além da geometria/material.
2. P2: carregamento assíncrono podia trocar a seleção durante arraste. Corrigido preservando a seleção enquanto há arraste ativo.
3. Julgamento: possível duplicação dos nomes de pinos entre catálogo e alvos. Corrigido com UNO_HEADERS como fonte compartilhada.

Nenhuma violação rígida das convenções documentadas foi encontrada.

## Spec

1. P1: alvos do Uno não coincidiam com os contatos da geometria. Inspeção independente dos vértices mostrou headers 10+8 e 8+6. Corrigidos centros e ordem dos 32 terminais, incluindo SCL, SDA, IOREF e NC; catálogo deriva dos mesmos metadados.

Todos os oito tipos usam malhas importadas. Licenças registradas e firmware continua identificado como indisponível nesta prévia.

Resumo: 3 achados em Standards (maior: buffers não descartados); 1 em Spec (maior: identificação de terminais); todos tratados.

## Verificação

- Build de produção e verificação de sintaxe aprovados; permanece aviso de bundle JS maior que 500 kB.
- Navegador: oito tipos adicionados; Uno arrastado de X=-3,6/Z=0 para aproximadamente X=-2,36/Z=-0,30; segunda protoboard removida sem remover a original.
- Sem novos testes automatizados nesta alteração visual; não foi alegada aplicação de TDD.
- Geometrias importadas e materiais adaptados não equivalem a validação dimensional para fabricação ou simulação física. Mapeamento elétrico funcional será validado nas tarefas de circuito.
