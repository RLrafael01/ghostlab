# Third-party notices

As skills em `.agents/skills/` são provenientes de https://github.com/mattpocock/skills, commit `59db609eb1e18aaf59b63284d0e52255aff0c63c`, obtidas em 28/10/2026. Cópias locais sem modificações, instaladas pelo helper oficial de skill-installer do Codex.

Licença upstream: MIT. Texto integral em `licenses/mattpocock-skills-LICENSE`.

Instalação inclui setup, planejamento, modelagem de domínio, implementação, TDD, revisão e suas dependências de entrevista e escrita. Consultar cada SKILL.md para condições de uso. A licença acima cobre as skills; a licença do aplicativo ainda será escolhida.

## Modelos 3D

O catálogo utiliza ativos sob CC BY 4.0, CC BY 3.0, CC0 e MIT. Ver [autores, alterações e licenças](public/models/ATTRIBUTION.md) e [manifesto de fontes](public/models/manifest.json). Essas licenças aplicam-se aos respectivos ativos.

## Emulação e toolchain de firmware

AVR8js 0.21.1, Uri Shaked e colaboradores, MIT: [licença integral](licenses/avr8js-LICENSE). A cópia também acompanha a distribuição web em `firmware/avr8js-LICENSE.txt`. Fonte do pacote: https://github.com/wokwi/avr8js, commit `bee6f0a94e0e27786f6bc21aee3c775849fb50fd`.

O setup baixa Arduino CLI 1.5.1 e Arduino AVR core 1.8.6 de suas distribuições oficiais. Binários, core e respectivas licenças ficam em `.tools/`, sem versionamento. Os exemplos HEX incluem código do Arduino AVR core (LGPL-2.1-or-later): fonte correspondente fixada em https://github.com/arduino/ArduinoCore-avr/tree/1.8.6; os sketches autorais ficam em `src/firmware/examples.js`. O comando `npm run build:firmware` recompila os exemplos com a toolchain documentada em `docs/FIRMWARE.md`, permitindo alterar e relincar o core localmente.
