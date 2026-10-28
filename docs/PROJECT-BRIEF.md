# Proposta inicial

Status: rascunho para refinamento, baseado na conversa de 28/10/2026.

## Problema e público

Pessoas que querem aprender e experimentar sistemas embarcados podem não ter microcontroladores e componentes em casa. Quem possui hardware também precisa explorar comportamentos antes de montar um protótipo.

## Objetivo

Permitir montar, programar e experimentar circuitos com um microcontrolador virtual em um ambiente 3D no navegador. O objetivo de longo prazo inclui sistemas complexos; a primeira versão precisa demonstrar um circuito completo funcionando.

## Decisões confirmadas em 28/10/2026

- Público inicial: pessoas com algum conhecimento de programação que estão aprendendo eletrônica.
- Bancada livre para montar projetos do zero e um exemplo pronto com circuito e código editáveis.
- O tema do primeiro exemplo ainda está em aberto; a proposta de cancela precisa ser esclarecida ao usuário antes da escolha.

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

## Fora da primeira entrega proposta

Simulação analógica de propósito geral, projeto de PCB, múltiplas famílias de placas, instrumentos avançados, colaboração ao vivo e serviços pagos. São possibilidades futuras, sujeitas a validação.

## Decisões pendentes

1. Tema do primeiro exemplo completo, considerando o público iniciante em eletrônica já confirmado.
2. Microcontrolador e linguagem da primeira versão.
3. Motor de execução: avaliar emulação existente, licenças, compilação e custo de integração.
4. Fidelidade elétrica necessária para o primeiro circuito.
5. Bibliotecas de 3D, editor e persistência.

## Maior risco

A integração entre firmware, conexões e componentes é o risco central. Validar esse caminho antes de investir em modelos 3D detalhados. A interface 3D deve representar o estado da simulação, não definir suas regras.
