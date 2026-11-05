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
`}};function t({base:t=`./`,request:r=fetch}={}){return async function(i,{signal:a}={}){let o;try{o=await r(`/api/compile`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({source:i}),signal:a})}catch(e){if(a?.aborted)throw e}if(o?.headers.get(`content-type`)?.includes(`application/json`)){let e=await o.json();if(!o.ok){let t=Error(e.message||`Falha na compilação.`);throw t.diagnostics=e.diagnostics,t}let t=await n(i);if(e.sourceHash!==t||typeof e.hex!=`string`)throw Error(`O firmware recebido não corresponde ao código atual.`);return{...e,origin:`compiler`}}let s=Object.entries(e).find(([,e])=>e.source===i);if(s){let e=await r(`${t}firmware/${s[0]}.json`,{signal:a});if(e.ok){let t=await e.json();if(t.sourceHash===await n(i))return{...t,origin:`example`}}}throw Error(`Compilador indisponível. No link público, execute os exemplos originais. Para compilar suas alterações, abra o servidor local com npm run dev (veja o README).`)}}async function n(e){let t=await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(e));return Array.from(new Uint8Array(t),e=>e.toString(16).padStart(2,`0`)).join(``)}function r({compile:e,createRunner:t,onChange:n=()=>{}}){let r=0,i,a,o,s,c={phase:`idle`,source:``,revision:0,executedRevision:null,output:null,message:`Pronto para executar.`,diagnostics:[],origin:null},l=()=>n({...c});function u(){r++,i?.abort(),i=null,a?.terminate(),a=null,c.output=null}function d(e,n){let i=++r;c.phase=`running`,c.executedRevision=n,c.origin=e.origin,c.message=e.origin===`example`?`Executando firmware pré-compilado deste exemplo.`:`Executando código compilado no servidor local.`;let o=e=>{r===i&&(u(),c.phase=`error`,c.message=String(e),l())};try{a=t(e.hex,e=>{r===i&&(c.output=e,l())},o),l()}catch(e){o(e)}}return{snapshot:()=>({...c}),edit(e){e!==c.source&&(c.source=e,c.revision++,c.phase===`compiling`&&(u(),c.phase=`idle`,c.message=`Código alterado; compile novamente.`),l())},async execute(){u(),c.phase=`compiling`,c.diagnostics=[],c.message=`Compilando o código…`,l();let t=r,n=c.source,a=c.revision;i=new AbortController;try{let l=await e(n,{signal:i.signal});if(t!==r||n!==c.source)return;o=l,s=n,i=null,d(l,a)}catch(e){if(t!==r)return;c.phase=`error`,c.message=e.message,c.diagnostics=e.diagnostics??[],l()}},stop(){u(),c.phase=`stopped`,c.message=`Execução parada · GPIO sem sinal ativo.`,l()},restart(){!o||s!==c.source?(c.message=`Compile o código atual antes de reiniciar.`,l()):(u(),c.diagnostics=[],d(o,c.revision))}}}function i({editor:n,container:i,status:a,getTarget:o=()=>null,onOutput:s=()=>{},base:c=`./`}){i.ownerDocument,i.innerHTML=`<div class="firmware-actions"><label>Exemplo <select aria-label="Exemplo de código">${Object.entries(e).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join(``)}</select></label><button data-action="run" class="run-firmware">▶ Compilar e executar</button><button data-action="stop">■ Parar</button><button data-action="restart">↻ Reiniciar</button></div><div class="firmware-state" role="status"></div><details class="firmware-diagnostics" hidden><summary>Diagnósticos de compilação</summary><pre></pre></details><p class="firmware-note">LED no D9 com resistor e GND. Os exemplos originais têm firmware pronto para testar; compilar alterações requer o servidor local.</p>`;let l=i.querySelector(`select`),u=i.querySelector(`[data-action="run"]`),d=i.querySelector(`[data-action="stop"]`),f=i.querySelector(`[data-action="restart"]`),p=i.querySelector(`.firmware-state`),m=i.querySelector(`details`),h,g=r({compile:t({base:c}),createRunner(e,t,n){let r=new Worker(new URL(`/ghostlab/main/assets/worker-C5osg1vF.js`,``+import.meta.url),{type:`module`});return r.onmessage=({data:e})=>e.error?n(e.error):t(e.output),r.onerror=()=>n(`Falha ao executar firmware. Pare e tente novamente.`),r.postMessage({hex:e}),{terminate:()=>r.terminate()}},onChange(e){let t=e.executedRevision!==null&&e.revision!==e.executedRevision;p.textContent=e.message+(e.phase===`running`?` Rev. ${e.executedRevision}${t?` · código editado, compile para aplicar`:``}`:``),a.textContent=e.phase===`running`?`UNO · executando${t?` versão anterior`:``}`:e.phase===`compiling`?`UNO · compilando`:`UNO · parado`,d.disabled=![`running`,`compiling`].includes(e.phase),u.disabled=e.phase===`compiling`,f.disabled=e.executedRevision===null||t||e.phase===`compiling`,m.hidden=e.diagnostics.length===0,m.open=e.diagnostics.length>0,m.querySelector(`pre`).textContent=e.diagnostics.join(`
`),s(e.output?{...e.output,unoId:h}:null)}});return n.value=e.blink.source,g.edit(n.value),n.addEventListener(`input`,()=>g.edit(n.value)),l.addEventListener(`change`,()=>{g.stop(),n.value=e[l.value].source,g.edit(n.value)}),u.addEventListener(`click`,()=>{h=o(),g.execute()}),d.addEventListener(`click`,()=>g.stop()),f.addEventListener(`click`,()=>g.restart()),window.addEventListener(`pagehide`,()=>g.stop()),g}export{i as t};