# GhostLab V1 — revisão final do recorte

Status: aprovado pelo usuário em 28/10/2026, incluindo catálogo de falhas, recuperação e comportamentos de verificação. Documento histórico da entrevista; a especificação vigente está em `.scratch/initial-lab/spec.md`.

## Experiência já confirmada

Laboratório no navegador de computador, para quem conhece um pouco de programação e está aprendendo eletrônica. A pessoa monta livremente em 3D ou abre um exemplo de cancela automática, altera circuito e código C++ para Arduino Uno, executa o firmware e interage com os componentes.

O editor terá exemplos comentados. Um painel mostrará leituras e estados, além do terminal serial. A compilação utilizará um serviço próprio e exigirá internet; o usuário não precisa possuir a placa. Projetos serão salvos localmente, com exportação/importação para compartilhar, sem contas.

Erros de montagem poderão ser experimentados. Falhas terão efeitos funcionais e visuais segundo regras educativas declaradas. Quando houver dano virtual, o componente permanece sem funcionar até substituição ou restauração. O botão “Por que isso aconteceu?” revela causa e sugestão de correção.

## Catálogo proposto para fechar a V1

Componentes: Uno, protoboard e fios, LED, resistor, botão, potenciômetro, sensor de distância e servo. A protoboard deve representar suas conexões internas no circuito.

| Condição | Efeito proposto | Recuperação proposta |
| --- | --- | --- |
| Componente sem alimentação | Componente inativo, identificado no painel. | Corrigir a ligação. |
| Sinal desconectado | Ausência de resposta válida, conforme o contrato documentado do componente. | Reconectar o sinal. |
| Curto direto entre alimentação e terra | Fonte virtual entra em falha e os componentes alimentados por ela ficam inativos; o caminho do curto é destacado. | Remover o curto e reiniciar a execução. |
| LED com ligação direta à alimentação, sem limitação de corrente no caminho | Dano virtual no LED, indicado visualmente e com interrupção de sua emissão de luz. | Corrigir o circuito e substituir o LED ou restaurar a simulação. |

A última regra é uma simplificação educativa a validar, não um cálculo de corrente nem uma previsão de tempo até dano. Reiniciar a execução preserva danos; a ação explícita de restaurar recupera os componentes e mantém código e montagem. Se o circuito continuar incorreto, a falha poderá reaparecer. Semântica final e mensagens serão especificadas nos contratos dos componentes.

## Comportamentos propostos para verificação

1. Modificar o programa muda a resposta dos componentes; a cena representa o resultado da execução do firmware.
2. Alterar os fios muda os sinais efetivamente recebidos e, portanto, o comportamento observado.
3. Aproximar um objeto do sensor muda sua leitura e a cancela responde ao limiar definido no código.
4. Introduzir uma falha produz o efeito documentado; a explicação é revelada apenas quando solicitada.
5. Corrigir uma ligação recupera falhas reversíveis; dano virtual continua até substituição ou restauração explícita.
6. Salvar, fechar e reabrir preserva código, componentes e conexões; exportar e importar reproduz o projeto. A V1 salva o projeto, sem retomar o instante da execução ou danos de uma execução anterior.

Os testes devem observar esses comportamentos pelas interfaces públicas da simulação e pelo fluxo do usuário no navegador, incluindo uma integração com firmware realmente compilado. Não há código nem testes existentes a aproveitar.

## Primeiro resultado técnico proposto

Um programa compilado controla um LED virtual a partir de um botão na bancada 3D, com mensagens no terminal serial. Essa primeira entrega verifica o caminho completo antes da cancela, da montagem livre e das falhas.

## Expansões futuras

Outras placas, instrumentos avançados, simulação elétrica de maior precisão, colaboração ao vivo, contas e nuvem. O futuro colaborador do repositório não implica colaboração simultânea dentro do produto.
