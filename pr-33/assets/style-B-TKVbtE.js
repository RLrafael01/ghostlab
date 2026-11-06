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
`}};function t({base:e=`./`,request:t=fetch,local:i=!1}={}){if(i)return n({base:e,request:t});let a;async function o(i){let a;try{a=await t(`${e}compiler-config.json`,{cache:`no-store`,signal:r(i,1e4)})}catch(e){throw i?.aborted?e:Error(`Configuração do compilador indisponível. Tente novamente; seu código foi preservado.`)}if(a.status===404)return n({base:e,request:t});if(!a.ok)throw Error(`Configuração do compilador indisponível. Tente novamente; seu código foi preservado.`);let o;try{o=await a.json()}catch{throw Error(`Configuração do compilador inválida. Seu código foi preservado.`)}if(!o||typeof o.endpoint!=`string`||!o.endpoint)throw Error(`Configuração do compilador inválida: informe um endpoint HTTPS.`);return n({base:e,request:t,endpoint:o.endpoint})}return async(e,t={})=>(a??=o(t.signal).catch(e=>{throw a=void 0,e}),(await a)(e,t))}function n({base:t=`./`,request:n=fetch,endpoint:a}={}){if(a){let e=new URL(a);if(e.protocol!==`https:`||e.username||e.password||e.hash)throw Error(`O serviço de compilação público deve usar HTTPS, sem credenciais na URL.`)}return async function(o,{signal:s}={}){let c;try{c=await n(a||`/api/compile`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({source:o}),signal:r(s,35e3)})}catch(e){if(s?.aborted)throw e}if(c?.headers.get(`content-type`)?.includes(`application/json`)){let e=await c.json();if(!c.ok){let t=Error(e.message||`Falha na compilação.`);throw t.diagnostics=e.diagnostics,t}let t=await i(o);if(e.sourceHash!==t||typeof e.hex!=`string`)throw Error(`O firmware recebido não corresponde ao código atual.`);return{...e,origin:a?`remote-compiler`:`compiler`}}if(a)throw Error(`Serviço de compilação de demonstração indisponível. O computador que o hospeda precisa estar ligado; tente novamente mais tarde. Seu código foi preservado.`);let l=Object.entries(e).find(([,e])=>e.source===o);if(l){let e=await n(`${t}firmware/${l[0]}.json`,{signal:s});if(e.ok){let t=await e.json();if(t.sourceHash===await i(o))return{...t,origin:`example`}}}throw Error(`Compilador indisponível. No link público, execute os exemplos originais. Para compilar suas alterações, abra o servidor local com npm run dev (veja o README).`)}}function r(e,t){let n=AbortSignal.timeout(t);return e?AbortSignal.any([e,n]):n}async function i(e){let t=await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(e));return Array.from(new Uint8Array(t),e=>e.toString(16).padStart(2,`0`)).join(``)}function a({compile:e,createRunner:t,onChange:n=()=>{}}){let r=0,i,a,o,s,c={},l=`{}`,u={phase:`idle`,source:``,revision:0,executedRevision:null,output:null,message:`Pronto para executar.`,diagnostics:[],origin:null,serial:{text:``,dropped:0,droppedBytes:0,baud:null,session:0}},d=()=>n({...u});function f(){r++,i?.abort(),i=null,a?.terminate(),a=null,u.output=null}function p(e,n){let i=++r;u.phase=`running`,u.executedRevision=n,u.origin=e.origin,u.serial={text:``,dropped:0,droppedBytes:0,baud:null,session:u.serial.session+1},u.message=e.origin===`example`?`Executando firmware pré-compilado deste exemplo.`:e.origin===`remote-compiler`?`Executando código compilado no serviço de demonstração.`:`Executando código compilado no servidor local.`;let o=e=>{r===i&&(f(),u.phase=`error`,u.message=String(e),d())};try{a=t(e.hex,e=>{if(r===i){let t=u.serial.text+(e.serial?.text??``),n=Math.max(0,t.length-8192);u.serial={...u.serial,text:t.slice(-8192),dropped:u.serial.dropped+n,droppedBytes:u.serial.droppedBytes+(e.serial?.dropped??0),baud:e.serial?.baud??u.serial.baud},u.output=e,d()}},o,c),d()}catch(e){o(e)}}return{snapshot:()=>({...u}),setInputs(e){let t=JSON.stringify(e);t!==l&&(c=JSON.parse(t),l=t,a?.setInputs?.(c))},reset(e){f(),o=s=null,u.source=e,u.revision++,u.executedRevision=null,u.origin=null,u.diagnostics=[],u.phase=`idle`,u.message=`Projeto pronto para compilar.`,u.serial={text:``,dropped:0,droppedBytes:0,baud:null},d()},clearSerial(){u.serial={...u.serial,text:``,dropped:0,droppedBytes:0},d()},edit(e){e!==u.source&&(u.source=e,u.revision++,u.phase===`compiling`&&(f(),u.phase=`idle`,u.message=`Código alterado; compile novamente.`),d())},async execute(){f(),u.phase=`compiling`,u.diagnostics=[],u.message=`Compilando o código…`,d();let t=r,n=u.source,a=u.revision;i=new AbortController;try{let c=await e(n,{signal:i.signal});if(t!==r||n!==u.source)return;o=c,s=n,i=null,p(c,a)}catch(e){if(t!==r)return;u.phase=`error`,u.message=e.message,u.diagnostics=e.diagnostics??[],d()}},stop(){f(),u.phase=`stopped`,u.message=`Execução parada · GPIO sem sinal ativo.`,d()},restart(){!o||s!==u.source?(u.message=`Compile o código atual antes de reiniciar.`,d()):(f(),u.diagnostics=[],p(o,u.revision))}}}function o(e,t){let n=e.ownerDocument.createElement(`details`);n.className=`serial-monitor`,n.innerHTML=`<summary>Monitor serial</summary><div class="serial-toolbar"><span></span><button type="button">Limpar monitor serial</button></div><pre tabindex="0" aria-label="Saída do monitor serial"></pre>`,e.append(n);let r=n.querySelector(`pre`),i=n.querySelector(`span`),a=!1;return n.addEventListener(`toggle`,()=>{n.open&&(r.scrollTop=r.scrollHeight)}),n.querySelector(`button`).addEventListener(`click`,t),{update({text:e,baud:t,dropped:o,droppedBytes:s=0,session:c}){let l=n.open&&r.clientHeight>0,u=!a||r.scrollTop+r.clientHeight>=r.scrollHeight-12;a=l,r.textContent!==e&&(r.textContent=e),i.textContent=`Sessão ${c} · ${t?Math.round(t)+` baud`:`UART aguardando Serial.begin`} · últimos 8192 caracteres${o?` · `+o+` caracteres descartados`:``}${s?` · `+s+` bytes descartados na UART`:``}`,u&&(r.scrollTop=r.scrollHeight)}}}function s({editor:n,container:r,status:i,getTarget:s=()=>null,onRestart:c=()=>{},onOutput:l=()=>{},onAssemble:u,base:d=`./`}){let f=r.ownerDocument;r.innerHTML=`<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(e).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join(``)}<option value="custom" disabled>Personalizado</option></select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">Escolha um exemplo e monte seu circuito. Botão: segure o topo. Potenciômetro: arraste o eixo ou ajuste no inspetor. A compilação pública depende do serviço de demonstração estar online.</p>`;let p=r.querySelector(`select`),m=r.querySelector(`[data-action="run"]`),h=r.querySelector(`[data-action="stop"]`),g=r.querySelector(`[data-action="restart"]`),_=r.querySelector(`.firmware-state`),v=r.querySelector(`details`),y,b,x=!1,S=!1,C=o(r,()=>w.clearSerial()),w=a({compile:t({base:d,local:!1}),createRunner(e,t,n,r){let i=new Worker(new URL(`/ghostlab/pr-33/assets/worker-n5V9eHxj.js`,``+import.meta.url),{type:`module`});return i.onmessage=({data:e})=>e.error?n(e.error):t(e.output),i.onerror=()=>n(`Falha ao executar firmware. Pare e tente novamente.`),i.postMessage({hex:e,inputs:r}),{terminate:()=>i.terminate(),setInputs:e=>i.postMessage({type:`inputs`,inputs:e})}},onChange(e){let t=e.executedRevision!==null&&e.revision!==e.executedRevision;_.textContent=e.message+(e.phase===`running`?` Rev. ${e.executedRevision}${t?` · código editado, compile para aplicar`:``}`:``),i.textContent=e.phase===`running`?`UNO · executando${t?` versão anterior`:``}`:e.phase===`compiling`?`UNO · compilando`:`UNO · parado`,h.disabled=![`running`,`compiling`].includes(e.phase),m.disabled=S||e.phase===`compiling`,g.disabled=e.executedRevision===null||t||e.phase===`compiling`,v.hidden=e.diagnostics.length===0,v.open=e.diagnostics.length>0,v.querySelector(`pre`).textContent=e.diagnostics.join(`
`),C.update(e.serial),l(e.output?{...e.output,unoId:y}:null)}});u&&(b=f.createElement(`button`),b.type=`button`,b.textContent=`Montar circuito do exemplo`,r.querySelector(`.firmware-actions`).append(b),b.addEventListener(`click`,async()=>{if(e[p.value]){if(!x)x=!0,b.textContent=`Confirmar: substituir montagem`,_.textContent=`A montagem atual será substituída. Clique novamente no botão para confirmar.`;else{S=!0,b.disabled=!0,m.disabled=!0,g.disabled=!0,p.disabled=!0;try{await u(p.value)}catch{_.textContent=`Não foi possível montar o exemplo. Tente novamente.`}finally{S=!1,p.disabled=!1,m.disabled=!1,T()}}}}));function T(){x=!1,b&&(b.textContent=`Montar circuito do exemplo`,b.disabled=S||p.value===`custom`)}function E(){let t=Object.entries(e).find(([,e])=>e.source===n.value);p.value=t?.[0]??`custom`,T(),w.edit(n.value)}n.value=e.blink.source,E(),n.addEventListener(`input`,E),p.addEventListener(`change`,()=>{let t=e[p.value];t&&(w.stop(),n.value=t.source),E()});function D(){return y=s(),y!=null||(_.textContent=`Adicione um Arduino Uno à bancada antes de executar.`,!1)}return m.addEventListener(`click`,()=>{D()&&w.execute()}),h.addEventListener(`click`,()=>w.stop()),g.addEventListener(`click`,()=>{D()&&(c(),w.restart())}),window.addEventListener(`pagehide`,()=>w.stop()),w}export{e as n,s as t};