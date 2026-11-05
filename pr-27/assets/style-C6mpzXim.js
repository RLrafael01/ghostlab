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
`}};function t({base:t=`./`,request:r=fetch}={}){return async function(i,{signal:a}={}){let o;try{o=await r(`/api/compile`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({source:i}),signal:a})}catch(e){if(a?.aborted)throw e}if(o?.headers.get(`content-type`)?.includes(`application/json`)){let e=await o.json();if(!o.ok){let t=Error(e.message||`Falha na compilação.`);throw t.diagnostics=e.diagnostics,t}let t=await n(i);if(e.sourceHash!==t||typeof e.hex!=`string`)throw Error(`O firmware recebido não corresponde ao código atual.`);return{...e,origin:`compiler`}}let s=Object.entries(e).find(([,e])=>e.source===i);if(s){let e=await r(`${t}firmware/${s[0]}.json`,{signal:a});if(e.ok){let t=await e.json();if(t.sourceHash===await n(i))return{...t,origin:`example`}}}throw Error(`Compilador indisponível. No link público, execute os exemplos originais. Para compilar suas alterações, abra o servidor local com npm run dev (veja o README).`)}}async function n(e){let t=await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(e));return Array.from(new Uint8Array(t),e=>e.toString(16).padStart(2,`0`)).join(``)}function r({compile:e,createRunner:t,onChange:n=()=>{}}){let r=0,i,a,o,s,c,l={phase:`idle`,source:``,revision:0,executedRevision:null,output:null,message:`Pronto para executar.`,diagnostics:[],origin:null},u=()=>n({...l});function d(){r++,a?.abort(),a=null,o?.terminate(),o=null,l.output=null}function f(e,n){let a=++r;l.phase=`running`,l.executedRevision=n,l.origin=e.origin,l.message=e.origin===`example`?`Executando firmware pré-compilado deste exemplo.`:`Executando código compilado no servidor local.`;let s=e=>{r===a&&(d(),l.phase=`error`,l.message=String(e),u())};try{o=t(e.hex,e=>{r===a&&(l.output=e,u())},s),i&&o.setInputs?.(i),u()}catch(e){s(e)}}return{snapshot:()=>({...l}),setInputs(e){i=e,o?.setInputs?.(e)},edit(e){e!==l.source&&(l.source=e,l.revision++,l.phase===`compiling`&&(d(),l.phase=`idle`,l.message=`Código alterado; compile novamente.`),u())},async execute(){d(),l.phase=`compiling`,l.diagnostics=[],l.message=`Compilando o código…`,u();let t=r,n=l.source,i=l.revision;a=new AbortController;try{let o=await e(n,{signal:a.signal});if(t!==r||n!==l.source)return;s=o,c=n,a=null,f(o,i)}catch(e){if(t!==r)return;l.phase=`error`,l.message=e.message,l.diagnostics=e.diagnostics??[],u()}},stop(){d(),l.phase=`stopped`,l.message=`Execução parada · GPIO sem sinal ativo.`,u()},restart(){!s||c!==l.source?(l.message=`Compile o código atual antes de reiniciar.`,u()):(d(),l.diagnostics=[],f(s,l.revision))}}}function i({editor:n,container:i,status:a,getTarget:o=()=>null,onOutput:s=()=>{},onRestart:c=()=>{},base:l=`./`}){i.ownerDocument,i.innerHTML=`<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(e).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join(``)}</select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">LED no D9 com resistor e GND. Os exemplos originais têm firmware pronto para testar; compilar alterações requer o servidor local.</p>`;let u=i.querySelector(`select`),d=i.querySelector(`[data-action="run"]`),f=i.querySelector(`[data-action="stop"]`),p=i.querySelector(`[data-action="restart"]`),m=i.querySelector(`.firmware-state`),h=i.querySelector(`details`),g,_=r({compile:t({base:l}),createRunner(e,t,n){let r=new Worker(new URL(`/ghostlab/pr-27/assets/worker-C7y6B5Bk.js`,``+import.meta.url),{type:`module`});return r.onmessage=({data:e})=>e.error?n(e.error):t(e.output),r.onerror=()=>n(`Falha ao executar firmware. Pare e tente novamente.`),r.postMessage({type:`start`,hex:e}),{terminate:()=>r.terminate(),setInputs:e=>r.postMessage({type:`inputs`,inputs:e})}},onChange(e){let t=e.executedRevision!==null&&e.revision!==e.executedRevision;m.textContent=e.message+(e.phase===`running`?` Rev. ${e.executedRevision}${t?` · código editado, compile para aplicar`:``}`:``),a.textContent=e.phase===`running`?`UNO · executando${t?` versão anterior`:``}`:e.phase===`compiling`?`UNO · compilando`:`UNO · parado`,f.disabled=![`running`,`compiling`].includes(e.phase),d.disabled=e.phase===`compiling`,p.disabled=e.executedRevision===null||t||e.phase===`compiling`,h.hidden=e.diagnostics.length===0,h.open=e.diagnostics.length>0,h.querySelector(`pre`).textContent=e.diagnostics.join(`
`),s(e.output?{...e.output,unoId:g}:null)}});return n.value=e.blink.source,_.edit(n.value),n.addEventListener(`input`,()=>_.edit(n.value)),u.addEventListener(`change`,()=>{_.stop(),n.value=e[u.value].source,_.edit(n.value)}),d.addEventListener(`click`,()=>{g=o(),_.execute()}),f.addEventListener(`click`,()=>_.stop()),p.addEventListener(`click`,()=>{c(),_.restart()}),window.addEventListener(`pagehide`,()=>_.stop()),_}export{i as t};