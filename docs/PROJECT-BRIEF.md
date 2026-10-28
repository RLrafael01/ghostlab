# Proposta inicial

Status: rascunho para refinamento, baseado na conversa de 28/10/2026.

## Problema e público

Pessoas que querem aprender e experimentar sistemas embarcados podem não ter microcontroladores e componentes em casa. Quem possui hardware também precisa explorar comportamentos antes de montar um protótipo.

## Objetivo

Permitir montar, programar e experimentar circuitos com um microcontrolador virtual em um ambiente 3D no navegador. O objetivo de longo prazo inclui sistemas complexos; a primeira versão precisa demonstrar um circuito completo funcionando.

## Decisões confirmadas em 28/10/2026

- Público inicial: pessoas com algum conhecimento de programação que estão aprendendo eletrônica.
- Bancada livre para montar projetos do zero e um exemplo pronto com circuito e código editáveis.
- Primeiro exemplo: cancela automática com sensor de distância e servo, com circuito e código editáveis.
- Programação em editor de código textual, com exemplos comentados.
- Painel com leituras dos sensores e estados dos componentes, além do terminal serial.
- Aprender com erros: permitir executar montagens incorretas, observar consequências simuladas e receber explicações. Avisos de montagem não devem impedir a experimentação.
- Quando a falha representar dano, o componente permanece marcado como danificado e sem funcionar até substituição ou restauração da simulação.
- Explicação sob demanda pelo botão “Por que isso aconteceu?”, revelando causa e sugestão de correção após o efeito observável.
- Primeira versão para navegador de computador, com teclado e mouse.
- Projetos salvos localmente no navegador, com exportação/importação de arquivo para compartilhar; sem contas na primeira versão.

## Recorte inicial proposto

- Um modelo de microcontrolador, a escolher após investigação técnica.
- Bancada 3D com navegação, seleção de componentes e conexões entre pinos.
- Catálogo pequeno: LED, resistor, botão, potenciômetro, sensor de distância e servo.
- Editor de código, execução com início/parada/reset e terminal serial.
- Entradas interativas: botão, potenciômetro e posição de objeto diante do sensor.
- Salvamento e reabertura local; exportação de código e ligações.
- Um projeto demonstrativo de cancela automática.

## Critério para a demonstração funcionar

O usuário conecta o sensor e o servo a pinos compatíveis, executa firmware suportado, aproxima um objeto e vê a cancela abrir pela decisão do programa. Alterar o limiar no código muda o comportamento. Desconectar o sinal do sensor produz o resultado documentado pelo modelo. O projeto reaberto preserva código, componentes e conexões.

## Fidelidade da simulação

As ligações precisam influenciar os sinais usados pelo firmware. Cada componente terá um contrato explícito de comportamento e limitações. Não apresentar animações predefinidas como execução de firmware nem afirmar precisão elétrica sem validação.

As falhas simuladas fazem parte da experiência: um possível curto deve poder ser experimentado e ter efeitos observáveis e explicáveis, em vez de apenas bloquear a execução. O usuário deve conseguir comparar montagens corretas e incorretas. O catálogo inicial e os efeitos de cada falha ainda precisam ser definidos; representar dano não implica prever com precisão danos físicos reais. Nos casos que representam dano, a recuperação exige substituição ou restauração, conforme confirmado acima.

## Fora da primeira entrega proposta

Simulação analógica de propósito geral, projeto de PCB, múltiplas famílias de placas, instrumentos avançados, colaboração ao vivo e serviços pagos. São possibilidades futuras, sujeitas a validação.

## Decisões pendentes

1. Catálogo inicial de falhas simuladas e critérios para representar dano.
2. Microcontrolador e linguagem da primeira versão.
3. Motor de execução: avaliar emulação existente, licenças, compilação e custo de integração.
4. Fidelidade elétrica necessária para o primeiro circuito.
5. Bibliotecas de 3D, editor e mecanismo de persistência local.

Investigação inicial: `docs/TECHNICAL-FEASIBILITY.md`. Arduino Uno com AVR8js e compilação em serviço próprio é uma recomendação ainda sujeita à decisão e prova de viabilidade.

## Maior risco

A integração entre firmware, conexões e componentes é o risco central. Validar esse caminho antes de investir em modelos 3D detalhados. A interface 3D deve representar o estado da simulação, não definir suas regras.
