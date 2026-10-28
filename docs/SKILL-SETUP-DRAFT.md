# Setup das skills — rascunho para revisão

Status: aprovado e aplicado em 28/10/2026. Este arquivo preserva a proposta revisada; a configuração vigente está em `AGENTS.md` e `docs/agents/`. Uma migração para GitHub Issues exigirá decisão posterior.

A skill `setup-matt-pocock-skills` pede a escolha do rastreador de tarefas, revisão dos arquivos e escolha do arquivo de instruções antes de escrever a configuração final. Esses arquivos ainda não foram criados.

## Proposta

- Rastreador: Markdown local, enquanto não houver repositório remoto; migrar para GitHub Issues quando houver acesso.
- Arquivo de instruções: `AGENTS.md`, adequado ao uso deste projeto com Codex.
- Documentação de domínio: contexto único, `GLOSSARY.md` na raiz e decisões em `docs/adr/`, criados quando houver definições reais.
- Triage não instalado: não configurar etiquetas agora.

## Rascunho de AGENTS.md

```markdown
# GhostLab

Laboratório eletrônico virtual 3D para montar, programar e experimentar sistemas embarcados no navegador.

Leia README.md e docs/PROJECT-BRIEF.md antes de alterar o projeto. O recorte inicial é proposto; decisões ainda abertas devem ser resolvidas antes da implementação correspondente.

## Agent skills

### Issue tracker

Specs e tarefas em Markdown local em .scratch/. Ver docs/agents/issue-tracker.md.

### Domain docs

Contexto único: GLOSSARY.md e docs/adr/. Ver docs/agents/domain.md.
```

## Rascunho de docs/agents/issue-tracker.md

```markdown
# Issue tracker: Local Markdown

Specs e tarefas vivem em .scratch/<feature>/.
- Spec: .scratch/<feature>/spec.md.
- Uma tarefa por arquivo: .scratch/<feature>/issues/NN-<slug>.md.
- Estado em Status:; dependências em Blocked by:.
- Histórico sob uma seção Comments.
- Publicar uma spec ou tarefa significa criar o arquivo local correspondente.
```

## Rascunho de docs/agents/domain.md

```markdown
# Domain Docs

Antes de explorar o código, ler GLOSSARY.md e as decisões relevantes de docs/adr/, quando existirem. Prosseguir se estiverem ausentes; criá-los conforme as definições forem resolvidas.

Usar os termos do glossário. Sinalizar conflitos com decisões anteriores antes de alterá-las.

Layout: contexto único, com GLOSSARY.md na raiz e docs/adr/ para decisões.
```
