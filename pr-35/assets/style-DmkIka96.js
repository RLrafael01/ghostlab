(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={blink:{name:`Blink · 1 segundo`,source:`// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(1000);
  digitalWrite(LED, LOW);
  delay(1000);
}
`},fade:{name:`Fade · brilho suave`,source:`// LED no pino PWM D9, com resistor e retorno ao GND.
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int brilho = 0; brilho <= 255; brilho += 5) {
    analogWrite(LED, brilho);
    delay(30);
  }
  for (int brilho = 255; brilho >= 0; brilho -= 5) {
    analogWrite(LED, brilho);
    delay(30);
  }
}
`},on:{name:`LED ligado`,source:`const int LED = 9;
void setup() {
  pinMode(LED, OUTPUT);
  digitalWrite(LED, HIGH);
}
void loop() {}
`},off:{name:`LED desligado`,source:`const int LED = 9;
void setup() {
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
}
void loop() {}
`},button:{name:`Botão · entrada digital`,source:`// Botão: terminal 1 → D2; terminal 2 → GND.
// INPUT_PULLUP mantém D2 alto ao soltar; pressionar liga D2 ao GND.
// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
const int BOTAO = 2;
const int LED = 9;
int ultimoEstado = -1;

void setup() {
  pinMode(BOTAO, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int pressionado = digitalRead(BOTAO) == LOW;
  digitalWrite(LED, pressionado ? HIGH : LOW);
  if (pressionado != ultimoEstado) {
    Serial.print("Botao: ");
    Serial.println(pressionado ? "pressionado" : "solto");
    ultimoEstado = pressionado;
  }
  delay(10);
}
`},pot:{name:`Potenciômetro · dimmer`,source:`// Potenciômetro: VCC → 5V; GND → GND; Sinal → A0.
// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
// Gire o controle no inspetor para variar a entrada de 0 a 5 V.
const int POT = A0;
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int leitura = analogRead(POT);
  int brilho = leitura / 4; // ADC 0–1023 → PWM 0–255.
  analogWrite(LED, brilho);
  Serial.print("ADC: ");
  Serial.print(leitura);
  Serial.print(" | PWM: ");
  Serial.println(brilho);
  delay(100);
}
`},serial:{name:`Serial · contador e LED`,source:`// LED: D9 → resistor → ânodo (+); cátodo (−) → GND.
// Abra o monitor serial para acompanhar o contador real do programa.
const int LED = 9;
unsigned long contador = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool ligado = contador % 2 == 0;
  digitalWrite(LED, ligado ? HIGH : LOW);
  Serial.print("Contador: ");
  Serial.print(contador);
  Serial.print(" | LED: ");
  Serial.println(ligado ? "ligado" : "desligado");
  contador++;
  delay(1000); // Altere este intervalo para mudar o ritmo.
}
`},gate:{name:`Cancela automática`,source:`#include <Servo.h>
// Trig D7, Echo D6, servo D5, botão D2 com INPUT_PULLUP e LED D9 com resistor.
const int LIMIAR_CM = 30;
const int ABERTA = 90;
const int FECHADA = 0;
Servo cancela;

void setup() {
  pinMode(7, OUTPUT);
  pinMode(6, INPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(9, OUTPUT);
  cancela.attach(5);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(7, HIGH);
  delayMicroseconds(12);
  digitalWrite(7, LOW);
  unsigned long eco = pulseIn(6, HIGH, 30000);
  bool botao = digitalRead(2) == LOW;
  bool abrir = botao || (eco && eco < LIMIAR_CM * 58UL);
  int angulo = abrir ? ABERTA : FECHADA;
  cancela.write(angulo);
  digitalWrite(9, abrir);
  Serial.print("Distancia: ");
  if (eco) {
    Serial.print(eco / 58.0, 1);
    Serial.print(" cm");
  } else {
    Serial.print("sem eco");
  }
  Serial.print(" | Botao: ");
  Serial.print(botao ? "pressionado" : "solto");
  Serial.print(" | Angulo: ");
  Serial.println(angulo);
  delay(80);
}
`},distance:{name:`Sensor · distância no serial`,source:`const int TRIG = 7, ECHO = 6, LED = 9;
void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(12);
  digitalWrite(TRIG, LOW);
  unsigned long echo = pulseIn(ECHO, HIGH, 30000);
  if (echo) {
    Serial.print(echo / 58.0, 1);
    Serial.println(" cm");
  } else {
    Serial.println("Sem eco");
  }
  digitalWrite(LED, echo && echo < 30UL * 58);
  delay(80);
}
`},servo:{name:`Servo · 0°, 90° e 180°`,source:`#include <Servo.h>
// Servo: 5V → 5V; GND → GND; Sinal → D6.
// Servo.h gera pulsos reais; não é o PWM comum de analogWrite.
// O LED da bancada não é utilizado neste exemplo.
Servo motor;
const int angulos[] = {0, 90, 180};

void setup() {
  motor.attach(6);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 3; i++) {
    motor.write(angulos[i]);
    Serial.print("Angulo: ");
    Serial.println(angulos[i]);
    delay(1000); // Altere os ângulos ou a pausa para experimentar.
  }
}
`}};function t({base:e=`./`,request:t=fetch,local:r=!1}={}){if(r)return n({base:e,request:t});let a;async function o(r){let a;try{a=await t(`${e}compiler-config.json`,{cache:`no-store`,signal:i(r,1e4)})}catch(e){throw r?.aborted?e:Error(`Configuração do compilador indisponível. Tente novamente; seu código foi preservado.`)}if(a.status===404)return n({base:e,request:t});if(!a.ok)throw Error(`Configuração do compilador indisponível. Tente novamente; seu código foi preservado.`);let o;try{o=await a.json()}catch{throw Error(`Configuração do compilador inválida. Seu código foi preservado.`)}if(!o||typeof o.endpoint!=`string`||!o.endpoint)throw Error(`Configuração do compilador inválida: informe um endpoint HTTPS.`);return n({base:e,request:t,endpoint:o.endpoint})}return async(e,t={})=>(a??=o(t.signal).catch(e=>{throw a=void 0,e}),(await a)(e,t))}function n({base:t=`./`,request:n=fetch,endpoint:r}={}){if(r){let e=new URL(r);if(e.protocol!==`https:`||e.username||e.password||e.hash)throw Error(`O serviço de compilação público deve usar HTTPS, sem credenciais na URL.`)}return async function(o,{signal:s}={}){let c;try{c=await n(r||`/api/compile`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({source:o}),signal:i(s,35e3)})}catch(e){if(s?.aborted)throw e}if(c?.headers.get(`content-type`)?.includes(`application/json`)){let e=await c.json();if(!c.ok){let t=Error(e.message||`Falha na compilação.`);throw t.diagnostics=e.diagnostics,t}let t=await a(o);if(e.sourceHash!==t||typeof e.hex!=`string`)throw Error(`O firmware recebido não corresponde ao código atual.`);return{...e,origin:r?`remote-compiler`:`compiler`}}if(r)throw Error(`Serviço de compilação de demonstração indisponível. O computador que o hospeda precisa estar ligado; tente novamente mais tarde. Seu código foi preservado.`);let l=Object.entries(e).find(([,e])=>e.source===o);if(l){let e=await n(`${t}firmware/${l[0]}.json`,{signal:s});if(e.ok){let t=await e.json();if(t.sourceHash===await a(o))return{...t,origin:`example`}}}throw Error(`Compilador indisponível. No link público, execute os exemplos originais. Para compilar suas alterações, abra o servidor local com npm run dev (veja o README).`)}}async function r(t,{base:n=`./`,request:r=fetch,signal:o}={}){let s=Object.entries(e).find(([,e])=>e.source===t);if(!s)throw Error(`O código editado precisa ser compilado.`);let c=await r(`${n}firmware/${s[0]}.json`,{signal:i(o,1e4)});if(!c.ok)throw Error(`Artefato do exemplo indisponível.`);let l=await c.json();if(l.sourceHash!==await a(t)||typeof l.hex!=`string`)throw Error(`O firmware do exemplo não corresponde ao sketch.`);return{...l,origin:`example`}}function i(e,t){let n=AbortSignal.timeout(t);return e?AbortSignal.any([e,n]):n}async function a(e){let t=await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(e));return Array.from(new Uint8Array(t),e=>e.toString(16).padStart(2,`0`)).join(``)}function o({compile:e,loadExample:t=e,createRunner:n,onChange:r=()=>{}}){let i=0,a,o,s,c,l={},u=`{}`,d={phase:`idle`,source:``,revision:0,executedRevision:null,output:null,message:`Pronto para executar.`,diagnostics:[],origin:null,serial:{text:``,dropped:0,droppedBytes:0,baud:null,session:0}},f=()=>r({...d});function p(){i++,a?.abort(),a=null,o?.terminate(),o=null,d.output=null}function m(e,t){let r=++i;d.phase=`running`,d.executedRevision=t,d.origin=e.origin,d.serial={text:``,dropped:0,droppedBytes:0,baud:null,session:d.serial.session+1},d.message=e.origin===`example`?`Executando firmware pré-compilado deste exemplo.`:e.origin===`remote-compiler`?`Executando código compilado no serviço de demonstração.`:`Executando código compilado no servidor local.`;let a=e=>{i===r&&(p(),d.phase=`error`,d.message=String(e),f())};try{o=n(e.hex,e=>{if(i===r){let t=d.serial.text+(e.serial?.text??``),n=Math.max(0,t.length-8192);d.serial={...d.serial,text:t.slice(-8192),dropped:d.serial.dropped+n,droppedBytes:d.serial.droppedBytes+(e.serial?.dropped??0),baud:e.serial?.baud??d.serial.baud},d.output=e,f()}},a,l),f()}catch(e){a(e)}}return{snapshot:()=>({...d}),setInputs(e){let t=JSON.stringify(e);t!==u&&(l=JSON.parse(t),u=t,o?.setInputs?.(l))},reset(e){p(),s=c=null,d.source=e,d.revision++,d.executedRevision=null,d.origin=null,d.diagnostics=[],d.phase=`idle`,d.message=`Projeto pronto para compilar.`,d.serial={text:``,dropped:0,droppedBytes:0,baud:null},f()},clearSerial(){d.serial={...d.serial,text:``,dropped:0,droppedBytes:0},f()},edit(e){e!==d.source&&(d.source=e,d.revision++,d.phase===`compiling`&&(p(),d.phase=`idle`,d.message=`Código alterado; compile novamente.`),f())},async execute({example:n=!1}={}){p(),d.phase=`compiling`,d.diagnostics=[],d.message=n?`Carregando firmware pré-compilado…`:`Compilando o código…`,f();let r=i,o=d.source,l=d.revision;a=new AbortController;try{let u=await(n?t:e)(o,{signal:a.signal});if(r!==i||o!==d.source)return;s=u,c=o,a=null,m(u,l)}catch(e){if(r!==i)return;d.phase=`error`,d.message=e.message,d.diagnostics=e.diagnostics??[],f()}},stop(){p(),d.phase=`stopped`,d.message=`Execução parada · GPIO sem sinal ativo.`,f()},restart(){!s||c!==d.source?(d.message=`Compile o código atual antes de reiniciar.`,f()):(p(),d.diagnostics=[],m(s,d.revision))}}}function s(e,t){let n=e.ownerDocument.createElement(`details`);n.className=`serial-monitor`,n.innerHTML=`<summary>Monitor serial</summary><div class="serial-toolbar"><span></span><button type="button">Limpar monitor serial</button></div><pre tabindex="0" aria-label="Saída do monitor serial"></pre>`,e.append(n);let r=n.querySelector(`pre`),i=n.querySelector(`span`),a=!1;return n.addEventListener(`toggle`,()=>{n.open&&(r.scrollTop=r.scrollHeight)}),n.querySelector(`button`).addEventListener(`click`,t),{update({text:e,baud:t,dropped:o,droppedBytes:s=0,session:c}){let l=n.open&&r.clientHeight>0,u=!a||r.scrollTop+r.clientHeight>=r.scrollHeight-12;a=l,r.textContent!==e&&(r.textContent=e),i.textContent=`Sessão ${c} · ${t?Math.round(t)+` baud`:`UART aguardando Serial.begin`} · últimos 8192 caracteres${o?` · `+o+` caracteres descartados`:``}${s?` · `+s+` bytes descartados na UART`:``}`,u&&(r.scrollTop=r.scrollHeight)}}}function c({editor:n,container:i,status:a,getTarget:c=()=>null,onRestart:l=()=>{},onOutput:u=()=>{},onAssemble:d,base:f=`./`}){let p=i.ownerDocument;i.innerHTML=`<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(e).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join(``)}<option value="custom" disabled>Personalizado</option></select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="example">Executar exemplo pré-compilado</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">Escolha um exemplo e monte seu circuito. Botão: segure o topo. Potenciômetro: arraste o eixo ou ajuste no inspetor. A compilação pública depende do serviço de demonstração estar online.</p>`;let m=i.querySelector(`select`),h=i.querySelector(`[data-action="run"]`),g=i.querySelector(`[data-action="example"]`),_=i.querySelector(`[data-action="stop"]`),v=i.querySelector(`[data-action="restart"]`),y=i.querySelector(`.firmware-state`),b=i.querySelector(`details`),x,S,C=!1,w=!1,T=s(i,()=>E.clearSerial()),E=o({compile:t({base:f,local:!1}),loadExample:(e,t)=>r(e,{...t,base:f}),createRunner(e,t,n,r){let i=new Worker(new URL(`/ghostlab/pr-35/assets/worker-n5V9eHxj.js`,``+import.meta.url),{type:`module`});return i.onmessage=({data:e})=>e.error?n(e.error):t(e.output),i.onerror=()=>n(`Falha ao executar firmware. Pare e tente novamente.`),i.postMessage({hex:e,inputs:r}),{terminate:()=>i.terminate(),setInputs:e=>i.postMessage({type:`inputs`,inputs:e})}},onChange(t){let n=t.executedRevision!==null&&t.revision!==t.executedRevision;y.textContent=t.message+(t.phase===`running`?` Rev. ${t.executedRevision}${n?` · código editado, compile para aplicar`:``}`:``),a.textContent=t.phase===`running`?`UNO · executando${n?` versão anterior`:``}`:t.phase===`compiling`?`UNO · compilando`:`UNO · parado`,_.disabled=![`running`,`compiling`].includes(t.phase),h.disabled=w||t.phase===`compiling`,g.disabled=h.disabled||!Object.values(e).some(({source:e})=>e===t.source),v.disabled=t.executedRevision===null||n||t.phase===`compiling`,b.hidden=t.diagnostics.length===0,b.open=t.diagnostics.length>0,b.querySelector(`pre`).textContent=t.diagnostics.join(`
`),T.update(t.serial),u(t.output?{...t.output,unoId:x}:null)}});d&&(S=p.createElement(`button`),S.type=`button`,S.textContent=`Montar circuito do exemplo`,i.querySelector(`.firmware-actions`).append(S),S.addEventListener(`click`,async()=>{if(e[m.value]){if(!C)C=!0,S.textContent=`Confirmar: substituir montagem`,y.textContent=`A montagem atual será substituída. Clique novamente no botão para confirmar.`;else{w=!0,S.disabled=!0,h.disabled=!0,g.disabled=!0,v.disabled=!0,m.disabled=!0;try{let t=e[m.value];await d(m.value)!==!1&&n.value!==t.source&&(n.value=t.source,O())}catch{y.textContent=`Não foi possível montar o exemplo. Tente novamente.`}finally{w=!1,m.disabled=!1,h.disabled=!1,g.disabled=!Object.values(e).some(({source:e})=>e===n.value),D()}}}}));function D(){C=!1,S&&(S.textContent=`Montar circuito do exemplo`,S.disabled=w||m.value===`custom`)}function O(){let t=Object.entries(e).find(([,e])=>e.source===n.value);m.value=t?.[0]??`custom`,D(),E.edit(n.value)}n.value=e.blink.source,O(),n.addEventListener(`input`,O),m.addEventListener(`change`,()=>{let t=e[m.value];t?d?(D(),y.textContent=`Monte o exemplo para carregar seu sketch e circuito.`):(E.stop(),n.value=t.source,O()):O()});function k(){return x=c(),x!=null||(y.textContent=`Adicione um Arduino Uno à bancada antes de executar.`,!1)}return h.addEventListener(`click`,()=>{k()&&E.execute()}),g.addEventListener(`click`,()=>{k()&&E.execute({example:!0})}),_.addEventListener(`click`,()=>E.stop()),v.addEventListener(`click`,()=>{k()&&(l(),E.restart())}),window.addEventListener(`pagehide`,()=>E.stop()),E}export{e as n,c as t};