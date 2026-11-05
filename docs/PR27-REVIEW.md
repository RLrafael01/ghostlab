# Revisão do PR #27 e auditoria das entregas

Data: 05/11/2026. Main: `0db0ca11b2b18660611bcd23fbe2f931588873da`. PR #27: `212d3d5c077dcb72822b67adbe35030b9d703ef0`.

O PR foi fechado por Enzo sem merge, ainda como rascunho. Os checks daquele commit passaram, mas a branch tem conflitos com a main. A revisão não altera nem reabre o trabalho dele.

## Standards

Três achados P2:

1. `src/electrical-view.js:32–35` limpa dano/falhas antes de solicitar o reinício. Quando o código foi editado, `src/firmware/session.js:113` recusa reiniciar e conserva o firmware anterior. A recuperação deve verificar a condição antes de modificar o estado ou garantir o reinício previsto no contrato.
2. `src/main.js:83` e `README.md:78,89` ainda negam simulação de dano, embora `src/electrical-simulation.js:173–175` introduza dano persistente. A ADR exige limites educativos explícitos.
3. `docs/SKILL-USAGE.md:106–110` usa IDs 069–073 para aplicações do Enzo, mas a main já atribui esses IDs a Rafael. Preservar ambos, renumerar as novas entradas e recalcular totais ao integrar.

## Spec

Dois achados P2, correspondentes aos itens 1 e 2 acima:

- A issue #19 exige que restaurar limpe dano/falhas e reinicie execução, preservando código e montagem. O caminho com editor alterado não cumpre esse contrato.
- As histórias de limites e a ADR exigem explicar o comportamento suportado; informar que dano não existe contradiz o efeito implementado.

Repro mínimo pela sessão pública: executar → editar código → restaurar. Resultado: `starts=1`, `stops=0`, fase `running`, revisão editada 2/executada 1, mensagem “Compile o código atual antes de reiniciar”. O dano já foi apagado apesar de não haver novo início da execução.

## Issues

As entregas #2, #3, #9, #10 e #11 estão integradas e já encerradas. Foram atualizados os critérios marcados e os textos antigos que ainda diziam aguardar merge. A issue de acompanhamento #8 e os espelhos locais agora mostram o estado atual.

Nenhuma outra issue aberta atende a todos os critérios na main. O PR #27 contém bases úteis para GPIO, falhas/dano e formato de projetos, mas não entrega integralmente #12–#24; essas lacunas são trabalho declarado em andamento, não achados adicionais de revisão. Interface/modelo 3D sem comportamento integrado não basta para encerrar uma feature.
