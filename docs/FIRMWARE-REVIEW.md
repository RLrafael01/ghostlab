# Revisão das issues #9, #10 e #11

Base fixa: `72fe5a4b193ccccdf1523899294d953ee33d7282` (bases de circuito, conectores e planejamento reunidas). Implementação inicial: `b10ab29`. Revisão independente em dois agentes conforme a skill `code-review`; correção posterior verificada pelos mesmos revisores.

## Standards

Nenhuma violação de padrão documentado encontrada. Um defeito P2: se o construtor do Worker lançasse sincronamente, o estado poderia permanecer executando sem worker; reiniciar deixaria a exceção escapar. A correção captura a falha na inicialização, limpa saídas e publica erro. Teste de regressão falhou antes (`running` em vez de `error`) e passou após corrigir, incluindo reiniciar. Revisor confirmou resolução.

Resultado: 0 violações documentadas; 1 defeito funcional corrigido; nenhuma pendência.

## Spec

O mesmo P2 afetava o critério da issue #10 de controles refletirem o estado de execução. Firmware real, ligação GPIO/LED, separação de 5 V e PWM coerentes com o recorte. A limitação da prévia estática aos exemplos originais está explícita; compilação pública permanece na issue #15. Revisor confirmou a correção e a documentação de versões e limites.

Resultado: 1 achado corrigido; nenhuma pendência.

## Evidências finais

- `npm test`: 45 testes aprovados, incluindo regressões da bancada e worker real.
- `npm run test:firmware`: 3 testes aprovados compilando C++ pela toolchain fixada; Blink 1000/250 ms, níveis PWM 0/64/128/192/255 nos seis pinos, fallback digital e erros/recuperação do compilador.
- `npm run build` e `git diff --check` aprovados. Permanece o aviso anterior de chunk 3D acima de 500 kB.
- Navegador local: código compilado na bancada, Fade, PWM constante em ~50%, parada/reinício, retirada de GND apagando LED, C++ inválido com diagnóstico e texto preservado. Dock abriu editor em fullscreen preservando o sketch e os controles.
- [PWM no servidor local](evidence/firmware-pwm-local.png) e [editor em tela cheia](evidence/firmware-fullscreen.png).

Não equivale a simulação analógica geral, execução de todos os periféricos do Uno nem conclusão de outras issues da V1.
