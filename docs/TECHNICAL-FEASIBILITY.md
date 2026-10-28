# Viabilidade técnica inicial

Data: 28/10/2026. Investigação documental, sem implementação ou testes. Recomendação para decisão durante `grill-with-docs`, não uma arquitetura aprovada.

## Firmware da primeira placa

Recomendação: iniciar a prova com Arduino Uno (ATmega328P) e AVR8js. O projeto é MIT e oferece emulação AVR em JavaScript para navegador e Node.js. Exige firmware compilado e integração dos componentes externos; modelos de circuito e falhas não vêm prontos. [Fonte: AVR8js](https://github.com/wokwi/avr8js).

O demo separa compilação de execução e usa um endpoint remoto para gerar o firmware. Isso não autoriza o GhostLab a usar esse endpoint como infraestrutura de produção. [Fonte: compilador do demo](https://github.com/wokwi/avr8js/blob/main/demo/src/compile.ts).

Proposta: serviço próprio de compilação com Arduino CLI, ferramenta oficial que oferece compilação de sketches e gestão de placas e bibliotecas. Fixar versões e limitar tempo, recursos e bibliotecas aceitas. A proposta requer conexão para compilar e ainda precisa ser validada; não há compromisso de funcionamento totalmente offline. [Fonte: Arduino CLI](https://docs.arduino.cc/arduino-cli/).

## Falhas elétricas

Conclusão de engenharia: emulação do microcontrolador e simulação elétrica são responsabilidades distintas. A montagem deve determinar os sinais efetivamente recebidos pelo firmware; o estado resultante deve determinar a resposta visual.

Um caminho condutor entre alimentação e terra pode ser identificado pela conectividade do circuito, mas estimar correntes, aquecimento, qual componente seria danificado e em quanto tempo exige um modelo elétrico definido e validado.

Proposta ainda não aprovada: catálogo pequeno de falhas com regras educativas explícitas, incluindo curto de alimentação, falta de alimentação e ausência de conexão de sinal. Nem toda falha implica dano. Nos casos definidos como dano virtual, aplicar a persistência e recuperação já confirmadas pelo usuário. Declarar os limites; não apresentar as regras como previsão física precisa.

## Prova de viabilidade proposta

1. Compilar um sketch e executar o firmware no emulador.
2. Acionar LED por saída digital e ler um botão virtual pela entrada do emulador.
3. Exibir mensagens seriais e avaliar entradas analógicas e temporização.
4. Validar integração do servo e do sensor de distância.
5. Ligar o estado funcional a uma cena 3D e à montagem editável.
6. Introduzir e observar falhas previstas, corrigir a montagem e restaurar componentes.

Desempenho, bibliotecas suportadas, estabilidade da compilação e fidelidade dos modelos permanecem sem validação prática. A placa única será um recorte da primeira entrega, mantendo a visão do produto voltada a sistemas embarcados.
