# Etapas propostas

Escopo aprovado; especificação em `.scratch/initial-lab/spec.md`. Divisão vigente por prazo em `docs/task-proposals/deadline-plan/README.md`, aprovada e com tickets publicados em `.scratch/initial-lab/issues/`. A divisão anterior foi preservada como histórico.

## Marcos solicitados

- **30/10/2026:** interface 3D interativa com bancada, componentes, fios, editor e prévia da cancela identificada; demonstração independente da compilação.
- **06/11/2026:** V1 funcional com execução real do programa, catálogo aprovado, falhas, dano/recuperação e projetos locais.
- **05/11/2026:** meta para integração e ensaio antes da apresentação final.

A prova de compilação e emulação começa cedo, sem depender da entrega da interface. O prazo final é uma meta ambiciosa e será reavaliado pelos resultados técnicos; não há implementação concluída até aqui.

## Caminho funcional

1. **Alinhar o produto:** concluído; revisão final aprovada e spec publicada. Tickets aprovados e publicados; iniciar pelas tarefas sem bloqueios.
2. **Provar a execução:** com Uno e C++ já aprovados, demonstrar firmware compilado controlando um LED a partir de um botão na cena 3D, com terminal serial; registrar licença e limitações da solução.
3. **Integrar uma cena mínima:** refletir o estado da saída em um objeto 3D e enviar uma interação da cena ao simulador.
4. **Adicionar montagem:** componentes com pinos identificados, fios e topologia que determine os sinais efetivamente recebidos.
5. **Completar a cancela:** editor, sensor, servo, terminal e exemplo pronto para experimentar.
6. **Persistir e exportar:** salvar/reabrir projeto e exportar programa e ligações.
7. **Validar a experiência:** observar usuários executando o projeto e corrigir os obstáculos encontrados.

Cada etapa deve entregar um comportamento observável. Instrumentos virtuais e projetos mais complexos dependem da estabilidade desse primeiro caminho completo.
