# Sensor de distância HC-SR04

Escolha **Sensor · distância no serial**, monte o circuito do exemplo e compile. O Uno liga D7 a Trig e D6 a Echo. VCC e GND usam 5 V e GND do mesmo Uno. Abra o monitor serial e arraste o cubo amarelo ou use o controle de distância no painel elétrico. Compare 20 cm com 75 cm e altere o limiar de 30 cm no sketch.

O objeto se move em uma linha com escala visual de 50 cm por unidade da cena. Um pulso Trig de pelo menos 10 µs agenda Echo após 200 µs no relógio do AVR. O pulso dura 58 µs por centímetro entre 2 e 400 cm. Fora da faixa ou com alimentação ou sinal desconectado, o sketch chega ao timeout de 30 ms. O painel indica a distância configurada e a última distância representada pelo eco. O serial mostra o valor efetivamente lido por pulseIn. O modelo representa um único alvo por sensor, com distância ao longo da linha de teste.
