# Compilador público de demonstração

A prévia e a main continuam no GitHub Pages. Para compilar código editado, o navegador envia o sketch a um serviço próprio, que devolve HEX e SHA-256 da fonte atual. A execução do firmware acontece no navegador, pelo AVR8js. O Pages não executa Arduino CLI.

## Iniciar o serviço

O adaptador público atual usa `sandbox-exec` do macOS. Foi validado em macOS Apple Silicon com a toolchain instalada pelo projeto. Linux/WSL continuam oferecendo compilação **local**; o serviço público recusa iniciar nessas plataformas, pois não existe um adaptador de isolamento Linux nesta entrega.

Na raiz do repositório:

```sh
npm ci
npm run setup:compiler
GHOSTLAB_COMPILER_ORIGINS=https://rlrafael01.github.io GHOSTLAB_COMPILER_PORT=8787 node scripts/serve-public-compiler.mjs
```

O setup instala Arduino CLI 1.5.1, core `arduino:avr@1.8.6` e a biblioteca oficial `Servo@1.3.0` em `.tools/`, ignorado pelo Git. O serviço compila um sketch no sandbox antes de abrir a porta: toolchain ou isolamento indisponível impedem a inicialização. Ele escuta somente `127.0.0.1:8787` e atende apenas `/api/compile` e `/api/compiler`.

Em outro terminal, com o binário oficial do [cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/) instalado:

```sh
cloudflared tunnel --no-autoupdate --url http://127.0.0.1:8787
```

Se o binário estiver na instalação local usada nesta demonstração, substitua `cloudflared` por `.tools/cloudflared/cloudflared`. Exponha a porta **8787 deste serviço**, nunca a porta do Vite ou o compilador local comum.

O comando imprime uma URL HTTPS temporária. O [Quick Tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/) dispensa conta e domínio, permite acesso sem login e não oferece garantia de disponibilidade. Seu endereço muda ao reiniciar o túnel. Esta entrega não contrata hospedagem nem mantém um servidor permanente.

## Configurar a prévia e a main

Atualize `public/compiler-config.json` com a URL publicada, incluindo `/api/compile`:

```json
{
  "endpoint": "https://ENDERECO-DO-TUNEL.trycloudflare.com/api/compile",
  "availability": "Disponível enquanto o computador da demonstração e o túnel estiverem ligados."
}
```

O arquivo é público e pode ser versionado: contém endereço e aviso de disponibilidade, **nenhuma senha, token ou credencial**. Não coloque segredos nele. A configuração precisa chegar ao deploy do PR ou da main pelo fluxo normal de revisão/publicação.

`createConfiguredCompiler` busca a configuração ao compilar pela primeira vez, com `cache: no-store`, respeitando a base de cada publicação: `/ghostlab/compiler-config.json` ou `/ghostlab/pr-N/compiler-config.json`. Configuração válida fica em memória até recarregar a página; depois de trocar o endereço do túnel, recarregue a aplicação. Falha ao carregar a configuração permite uma nova tentativa. Desenvolvimento local usa `local: true`, preservando `/api/compile` do Vite.

A origem autorizada é `https://rlrafael01.github.io`, sem caminho: ela atende main e pastas de PR. Para outra hospedagem, declare as origens HTTPS exatas em `GHOSTLAB_COMPILER_ORIGINS`, separadas por vírgulas. Não há wildcard. CORS restringe navegadores, não autentica clientes; por isso o limite de uso é global e o compilador permanece isolado mesmo para requisições que declarem uma origem permitida.

## Disponibilidade e recuperação

Mantenha o computador acordado, conectado à internet, com os processos do serviço e do túnel ativos durante a apresentação. Ao encerrar um deles ou suspender o computador, compilar pelo link deixa de funcionar. Reinicie ambos, atualize a configuração se a URL mudou e recarregue a página. A instalação local continua sendo a alternativa de desenvolvimento sem o túnel.

Com endpoint configurado, falhas de rede, rate limit e erro de C++ mostram mensagem recuperável e preservam a edição. Não há troca silenciosa por um exemplo pré-compilado ou firmware antigo. Uma compilação bem-sucedida precisa devolver o hash do código enviado; a sessão também descarta respostas substituídas por edição, parada ou outra compilação.

Somente uma configuração ausente com HTTP **404** ativa o comportamento estático anterior: exemplos originais podem usar seus artefatos pré-compilados, com origem informada. HTTP 503, configuração inválida e falha de rede não ativam esse caminho. O cliente limita a espera pela configuração a 10 s e pela compilação a 35 s. Para ensaiar o exemplo original durante a indisponibilidade, use **Executar exemplo pré-compilado**. O botão confere o hash e identifica a origem da execução.

## Isolamento e limites

Cada trabalho tem uma pasta própria, removida ao terminar. O sandbox permite leitura da toolchain e de arquivos de runtime necessários, escrita apenas nessa pasta e nega rede. Os subprocessos herdam as regras. Includes absolutos ou relativos para arquivos privados fora desses caminhos são negados pelo sistema operacional; não dependemos de filtrar `#include` no texto.

| Recurso                 | Limite aplicado                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Fonte / envelope HTTP   | 32 KiB / 40000 bytes                                                                 |
| Compilações simultâneas | 1 por processo; concorrência retorna 429                                             |
| Admissão pública        | 12 POSTs/minuto, globais para todas as pessoas; 429 com `Retry-After`                |
| Tempo                   | 30 s de parede; cancelamento encerra o grupo de processos                            |
| CPU                     | 30 s por processo, herdado pelos filhos                                              |
| Memória residente       | 512 MiB somados no grupo, monitorados a cada 250 ms; não é uma cota rígida do kernel |
| Arquivo individual      | No máximo 32 MiB, limite herdado do sistema operacional                              |
| Diagnósticos            | 64 KiB; diretórios internos substituídos por identificadores                         |
| Conexões HTTP           | Máximo 16; limites para recebimento de cabeçalhos/corpo                              |

O monitor de memória pode observar excesso entre amostras; ele encerra o trabalho e retorna erro, e sua falha também interrompe a compilação. O isolamento é separado desses limites operacionais. O serviço nunca aceita comandos, flags de compilador, alvo ou bibliotecas a instalar enviados pelo navegador.

## Verificação reproduzível

```sh
node --test tests/compiler-client.test.js tests/compiler-http.test.js tests/public-compiler-http.test.js
GHOSTLAB_TEST_SANDBOX=1 node --test tests/public-compiler-isolation.test.js
```

O segundo comando exige o macOS e a toolchain acima. Executa compilação real, inclui arquivos de teste fora do sandbox para confirmar bloqueio sem vazamento, verifica rede negada, toolchain somente leitura, escrita no job, limite de arquivo, timeout/recuperação e resposta HTTP com hash da edição. Sem a variável, essa suíte fica explicitamente ignorada: os testes HTTP portáveis não provam isolamento no Linux.

Na apresentação, teste também pelo link publicado em uma sessão limpa: editar o delay do Blink, compilar e observar o novo ritmo; provocar erro de C++; verificar botão, potenciômetro, monitor serial e servo; interromper o serviço, confirmar erro recuperável e retomar. Os testes locais não substituem essa verificação do endereço HTTPS e do deploy atual.
