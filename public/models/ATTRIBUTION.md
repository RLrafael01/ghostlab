# Modelos 3D do GhostLab

- **Arduino Uno**: “Arduino uno micro-controller”, benjamino, [Cad Crowd](https://www.cadcrowd.com/3d-models/arduino-uno), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Geometria glTF do visualizador STEP; cores adicionadas pelo GhostLab, orientação e escala ajustadas. O arquivo não identifica revisão exata da placa; não o apresentamos como CAD oficial do Uno R3.
- **Protoboard 830 contatos**: Innerscene, [modelo original](https://www.innerscene.com/tools/library/3d-parts/830-point-breadboard-3c211feb), [CC0](https://creativecommons.org/publicdomain/zero/1.0/). GLB original, escala ajustada na cena.
- **Servo SG51R, botão tátil de 6 mm e potenciômetro 10 kΩ**: Adafruit Industries, [Adafruit CAD Parts](https://github.com/adafruit/Adafruit_CAD_Parts), MIT, texto completo em ADAFRUIT-LICENSE.txt. STEP triangulado para GLB com OpenCascade.
- **LED 5 mm e resistor 220 Ω**: berserkdesign, via [FreeCAD-library](https://github.com/FreeCAD/FreeCAD-library), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). STEP triangulado; LED recebe material vermelho.
- **HC-SR04**: Charles Fox, via [FreeCAD-library](https://github.com/FreeCAD/FreeCAD-library), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). STEP triangulado para GLB.

A biblioteca FreeCAD declara CC BY 3.0 para suas peças no README. Autores identificados pelo histórico dos arquivos. Fontes fixadas em commits, arquivos e SHA-256 em manifest.json. Nenhum endosso dos autores ou fabricantes é sugerido.

Conversão: `node scripts/convert-cad.mjs`. STEP de origem em assets/cad. Malhas de visualização não estabelecem tolerâncias de fabricação. Materiais adicionados e alvos de interação são aproximações visuais; não simulam eletricidade. O catálogo funcional ainda será conectado aos contratos da simulação.
