# Issue tracker: Markdown e GitHub

Specs e tarefas vivem em `.scratch/` e são versionadas no Git. O plano vigente é `.scratch/v1-completion/README.md`, espelhado na issue #8 do GitHub. Os tickets desse plano apontam para suas issues; números locais e números do GitHub são identificadores diferentes. As tarefas de `.scratch/initial-lab/` preservam o histórico, com escopo mais amplo.

## Convenções

- Uma funcionalidade por diretório: `.scratch/<feature>/`.
- Spec: `.scratch/<feature>/spec.md`.
- Uma tarefa por arquivo: `.scratch/<feature>/issues/NN-<slug>.md`, numeradas a partir de `01`.
- Estado perto do início em `Status:`: `open`, `in-progress`, `blocked` ou `done`.
- Dependências em `Blocked by:`, com os números das tarefas ou `none`.
- Conversas e histórico ao final sob `## Comments`.
- Uma tarefa está concluída quando seus critérios de aceitação forem atendidos; registrar a evidência no arquivo.

## Fluxo obrigatório por entrega

1. **Antes de começar:** compare a solicitação com as issues abertas e encerradas e leia seus critérios. Reutilize a issue existente quando o escopo for o mesmo; crie issue e espelho local apenas para uma lacuna. Confira dependências, PRs e o estado da main; marque o ticket em execução como `in-progress`.
2. **Ao implementar ou corrigir:** marque somente os critérios efetivamente verificados, tanto no arquivo local quanto na descrição da issue. Registre comportamento, teste/evidência e commit/PR. Uma entrega parcial mantém a issue aberta e explicita o que falta.
3. **Ao publicar o PR:** liste todas as issues relacionadas. Use `Closes #N`, uma referência por issue, somente quando todos os critérios dela estiverem atendidos pelo PR ou pela main. Para contribuições parciais, use `Relacionado a #N` e os itens entregues. Mantenha LINK TESTE no início, roteiro de verificação e registro das skills.
4. **Quando a implementação estiver completa:** inclua `Status: done` e a evidência no ticket local dentro do próprio PR. Na branch, identifique que a entrega aguarda merge; na main, código e ticket passam a estar concluídos juntos. A issue no GitHub permanece aberta durante a revisão e fecha automaticamente quando o PR com `Closes #N` é integrado à main.
5. **Ao conferir um merge ou iniciar a próxima entrega:** verifique as issues fechadas, os espelhos locais e o acompanhamento #8. Atualize os estados/checklists defasados. Se uma entrega já integrada cumprir todos os critérios de uma issue ainda aberta, encerre-a como concluída com a evidência do merge. Se apenas parte estiver pronta, mantenha o restante pendente.

O fechamento automático é o [vínculo nativo do GitHub](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue), aplicado a PRs destinados à branch padrão `main`. Os corpos das issues e os arquivos locais precisam ser atualizados pelo responsável da tarefa; não há sincronização automática entre eles.

Rafael autorizou em 05/11/2026 a atualização e conclusão das issues durante as entregas. Isso inclui corrigir checklists e fechar trabalho já comprovadamente entregue; a revisão e as regras de merge da main continuam vigentes. PR fechado sem merge e interface sem comportamento funcional não comprovam conclusão. Correção ligada a uma issue já concluída registra a regressão e a evidência no histórico correspondente; o acompanhamento #8 só termina quando toda a V1 estiver validada.
