# Caminho até a V1 do GhostLab

Plano atualizado em 05/11/2026. [Todas as issues no GitHub](https://github.com/RLrafael01/ghostlab/issues/8) · [Tickets locais e dependências](../.scratch/v1-completion/README.md).

## Próximas implementações

1. [Compilar e executar firmware real](https://github.com/RLrafael01/ghostlab/issues/9): provar C++ do Uno no navegador.
2. [Blink na bancada 3D](https://github.com/RLrafael01/ghostlab/issues/10): ligar/desligar e piscar LED conforme código e fios.
3. [Fade e dimmer por PWM](https://github.com/RLrafael01/ghostlab/issues/11): variar suavemente o brilho pelo programa.
4. [Botão](https://github.com/RLrafael01/ghostlab/issues/12), [serial](https://github.com/RLrafael01/ghostlab/issues/13) e [potenciômetro](https://github.com/RLrafael01/ghostlab/issues/14): completar os básicos programáveis.
5. [Compilação na prévia](https://github.com/RLrafael01/ghostlab/issues/15): testar código editado pelo link, sem instalação.

## Completar a versão final

- [Servo](https://github.com/RLrafael01/ghostlab/issues/16) e [sensor de distância](https://github.com/RLrafael01/ghostlab/issues/17).
- [Falhas de ligação e curto](https://github.com/RLrafael01/ghostlab/issues/18) e [dano virtual/recuperação](https://github.com/RLrafael01/ghostlab/issues/19).
- [Salvar projetos](https://github.com/RLrafael01/ghostlab/issues/20), [importar/exportar](https://github.com/RLrafael01/ghostlab/issues/21) e [guia de montagem física](https://github.com/RLrafael01/ghostlab/issues/22).
- [Exemplos editáveis e cancela automática](https://github.com/RLrafael01/ghostlab/issues/23).
- [Integração, regressões e apresentação da V1](https://github.com/RLrafael01/ghostlab/issues/24).

A bancada já existe; o LED com fonte fixa está no PR #6 e os ajustes de interação no PR #7. O editor ainda não executa firmware. A issue #3 existente foi mantida, com suas dependências, sem duplicar o trabalho do Enzo.

“Versão final” significa a [V1 aprovada](../.scratch/initial-lab/spec.md), acrescida do detalhamento explícito de PWM solicitado agora. Outras placas, nuvem/contas e simulação elétrica geral ficam fora.

O [plano por datas de 28/10](task-proposals/deadline-plan/README.md) é histórico. A meta original de 06/11 está em risco enquanto compilação e emulação não forem provadas; não há novo prazo prometido. Critérios, bloqueios e mapeamento das tarefas antigas estão no plano atual.
