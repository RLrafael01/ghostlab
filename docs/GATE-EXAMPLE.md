# Exemplo de cancela automática

1. No editor, escolha **Cancela automática** e clique em **Montar circuito do exemplo**. Confirme a substituição. Se houver edições pendentes, cancele para salvar o projeto atual.
2. Clique em **Compilar e executar**. O objeto amarelo começa a 50 cm. Arraste-o para perto do sensor ou use o controle de distância. A 20 cm o braço sobe e o LED acende. Pressionar o botão abre a cancela mesmo com o objeto longe.
3. Abra o monitor serial para ver distância, botão e ângulo comandado. O painel elétrico mostra os estados dos componentes.
4. Mude LIMIAR_CM de 30 para 60 e ABERTA de 90 para 120. Recompile e teste a 50 cm. Editar e compilar exige um serviço de compilação disponível.
5. Retire o fio D5 do servo ou sua alimentação. O braço mantém a posição enquanto não houver pulsos válidos. Reconecte para voltar a responder ao programa.
6. Salve em **Projeto local**. A montagem reabre com o braço, o código e os fios. A execução fica parada até compilar ou executar o exemplo original.

D7 envia Trig, D6 recebe Echo, D5 comanda o servo, D2 lê o botão com INPUT_PULLUP e D9 comanda o LED com resistor. O braço acompanha o ângulo derivado dos pulsos gerados pelo firmware. A visualização usa a velocidade declarada para o servo e não calcula torque, colisão ou esforço.
