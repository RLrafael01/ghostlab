# Botão, potenciômetro, serial e servo

O Uno executa o HEX produzido pelo Arduino CLI. As conexões entregam entradas ao processador; o LED, o monitor serial e o servo respondem às saídas desse firmware. Não há interpretação de palavras do sketch para produzir animações.

## Experimentar os exemplos

No editor, escolha um exemplo e use **Montar circuito do exemplo** para substituir a bancada pela montagem correspondente. O primeiro clique avisa sobre a substituição; o segundo confirma. Depois clique em **Compilar e executar**. Escolher um exemplo troca o código; a montagem só é substituída pelo botão próprio. Na tela cheia, abra **Código** pelo dock e **Inspetor** para interagir com a peça selecionada.

| Exemplo | Montagem | Resultado esperado |
| --- | --- | --- |
| Blink, Fade, LED ligado/desligado | D9 → barramento → resistor → ânodo do LED; cátodo → GND | Mesmo comportamento dos quatro exemplos anteriores. |
| Botão · entrada digital | D2 → terminal 1 do botão; terminal 2 → GND; LED em D9 | Segurar acende, soltar apaga; o monitor recebe a mudança de estado. |
| Potenciômetro · dimmer | VCC → 5V; GND → GND; Sinal → A0; LED em D9 | Posições de 0%, 50% e 100% produzem ADC 0, 512 e 1023, com PWM 0, 128 e 255. |
| Serial · contador e LED | LED em D9 | O contador cresce e alterna o LED a cada segundo, com mensagens reais de UART. |
| Servo · 0°, 90° e 180° | 5V → 5V; GND → GND; Sinal → D6 | O eixo alterna entre três posições a cada segundo; o monitor mostra o comando. O LED não é usado neste exemplo. |

As peças continuam editáveis e os fios podem ser removidos ou reconectados. Alterar o código identifica o exemplo como **Personalizado**; recompilar é necessário para executar a alteração. Os oito exemplos têm artefatos próprios verificados por SHA-256 para a prévia sem compilador. Editar pelo link público depende do [serviço de demonstração](PUBLIC-COMPILER.md).

Estas montagens são atalhos de demonstração. Não implementam salvamento, importação/exportação ou o projeto completo de cancela previstos nas issues #20–#23.

## Botão e entradas digitais

O botão tem dois pares permanentes: **1–3** e **2–4**. Solto, esses pares ficam separados; pressionado, os dois lados são unidos. Não há polo positivo ou negativo. No exemplo, `pinMode(2, INPUT_PULLUP)` mantém D2 em HIGH quando solto; pressionar fecha D2 para GND e `digitalRead(2)` retorna LOW. O código decide como isso afeta D9.

Pressione o topo do botão na cena; arraste a base para mover a peça. No inspetor, segure **Segure para pressionar**, com mouse, Espaço ou Enter. Soltar, cancelar o gesto, perder foco ou ocultar a página libera o botão. A cena e o inspetor mostram o mesmo estado.

O grafo resolve o pino realmente conectado, incluindo grupos da protoboard. Desconectar ou trocar o fio altera a entrada sem reiniciar o processador. `INPUT_PULLUP` solto retorna HIGH; **`INPUT` sem fonte externa retorna LOW deterministicamente neste modelo**. Isso é uma simplificação explícita: entrada flutuante física não tem nível confiável. Fontes conflitantes não produzem uma leitura válida de circuito; o painel identifica a ligação não suportada e o emulador recebe a entrada liberada. As falhas educativas retidas e o dano ainda pertencem às issues #18/#19.

## Potenciômetro e ADC

O componente usa **VCC, GND e Sinal** como divisor de tensão orientado entre 5 V e GND do Uno ativo. Sua posição `value`, de 0 a 1, é parâmetro do componente; o estado instantâneo do firmware é separado. A persistência desse parâmetro fica para #20/#21.

Arraste a haste para os lados na cena ou ajuste o controle deslizante, as setas e o campo numérico do inspetor. O intervalo completo do gesto tem 180 pixels; a animação da haste corresponde à posição ajustada. Escape/cancelamento restaura a posição inicial do gesto.

Com alimentação válida, Sinal fornece de 0 a 5 V ao pino analógico conectado. O ADC de 10 bits do ATmega328P executa `analogRead`; o exemplo transforma a leitura por divisão inteira por quatro e executa `analogWrite(9, brilho)`. O painel distingue **Tensão modelada** de **Última conversão ADC · firmware**: esta última só aparece após uma conversão real, com canal, valor e instante virtual. Não é inferida da posição do controle. A leitura e o PWM também aparecem nas mensagens do exemplo. Um canal sem conversões novas conserva sua última leitura com o instante antigo; uma nova execução limpa as leituras.

Trocar A0 por A1 no código sem mover o fio deixa o novo canal sem entrada. Sinal solto, falta de 5 V/GND ou ligações conflitantes não recebem tensão válida do potenciômetro. O emulador usa **0 V como fallback de canal analógico liberado**, sem ruído ou memória de carga; o painel informa a falta de alimentação/conexão. Não há solver analógico geral, impedância, variação de referência ou simulação de um potenciômetro com qualquer topologia.

## Monitor serial

Abra **Monitor serial** no editor, em qualquer modo de tela. O texto vem de `Serial.begin`, `Serial.print`, `Serial.println` e `Serial.write` na UART emulada. Os exemplos usam 9600 baud; o painel mostra a taxa efetiva configurada pelos registradores, que pode diferir ligeiramente da solicitada pelo divisor do Uno. Não é a velocidade de uma conexão física nem exige cabo USB.

- O worker mantém os últimos **4096 bytes** entre envios; ao exceder o limite, descarta os mais antigos e informa a perda.
- A sessão mantém os últimos **8192 caracteres** para exibição; o excesso antigo também é descartado. O monitor informa separadamente os bytes descartados pela UART e os caracteres descartados pela interface, pois são unidades distintas, especialmente em UTF-8.
- Recolher/reabrir o monitor preserva a execução e o código. **Limpar monitor serial** limpa o histórico visível sem reiniciar o firmware.
- Parar preserva o histórico da sessão encerrada. Reiniciar ou executar novamente cria uma sessão identificada e limpa o histórico; mensagens tardias de workers encerrados são ignoradas.
- A rolagem acompanha o fim quando o usuário já está no final; subir para ler mensagens não é desfeito a cada atualização.

A execução continua em worker mesmo com muitas mensagens. A interface recebe lotes em vez de atualizar por byte. Entrada de texto pelo usuário para `Serial.read` e bibliotecas arbitrárias não fazem parte desta entrega.

## Servo e temporização

Biblioteca fixada: **Servo 1.3.0**, instalada por `npm run setup:compiler`. `attach` e `write` geram pulsos no firmware compilado; o modelo mede as bordas pelos ciclos da CPU, não pela média PWM nem pelo conteúdo textual do programa.

O contrato aceita alimentação 5 V/GND do Uno ativo, sinal de saída com largura **544–2400 µs** e período **18–25 ms**. A largura mapeia de 0° a 180°, com tolerância de 2 µs nos extremos para o ajuste de temporização da biblioteca. Pulsos com idade superior a **60 ms de tempo virtual**, fora dessas faixas ou com fontes conflitantes ficam inativos. PWM comum de `analogWrite` não é tratado como comando de servo.

Ao retirar sinal ou alimentação, a peça fica inativa e conserva a última pose visual; reconectar recupera o controle se pulsos válidos continuarem chegando. A animação aproxima o eixo do ângulo medido a até 300° por segundo de renderização: uma mudança de 180° leva aproximadamente 0,6 s, além da latência de atualização. Essa escolha visual não prevê torque, inércia, corrente, velocidade ou posição física de um servo desenergizado. Mover a peça preserva as referências dos fios.

**Servo usa Timer1 no Uno e interfere no PWM de D9/D10 enquanto está ativo**, mesmo com o sinal do servo em D6. Não se produz PWM artificial nesses pinos para esconder essa limitação. Para combinar servo e dimmer, use outro pino PWM, como D3/D11 do Timer2, e altere também o fio do LED. O exemplo do servo mantém o LED sem uso para tornar essa separação explícita.

GPIO/PWM, ADC, UART e pulsos usam tempo virtual de CPU a 16 MHz. O worker avança em blocos de até 20 ms e entrega estados aproximadamente a cada 30 ms de tempo de parede; o navegador desenha no próximo quadro. Carga da máquina, aba em segundo plano e compilação podem aumentar a latência ou deixar o tempo virtual mais lento que o real. O instante das conversões ADC é virtual; não há promessa de latência física ou de tempo real.

## Evidências e pendências

Os testes `tests/firmware/peripherals-runtime.test.js` compilam C++ real para GPIO, ADC, UART e Servo. `tests/firmware/demo-circuits.test.js` usa os artefatos dos exemplos com verificação de hash, monta o grafo correspondente e observa LED, leituras seriais e posição do servo; quatro cenários passaram durante a implementação. Os testes de circuito verificam desconexão, fontes conflitantes e pares do botão.

Os [tickets #12–#16](../.scratch/v1-completion/README.md) estão concluídos na branch do [PR #30](https://github.com/RLrafael01/ghostlab/pull/30), aguardando merge. Validação: 119 testes aprovados, gestos nos dois modos, compilação pública de código editado e recuperação do serviço; [evidências e roteiro](PERIPHERALS-REVIEW.md). Isso não declara toda a V1 concluída: sensor, falhas educativas, persistência e cancela permanecem nas próximas entregas.
