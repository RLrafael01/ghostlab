import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { setupWorkspacePanels } from '../src/workspace-panels.js';

function workspace(t) {
  const dom = new JSDOM(`<main><button id="fullscreen"></button><button id="code-toggle"></button><div id="code-panel" hidden><textarea></textarea><button id="close-code"></button></div><button data-dock-action="code" class="dock-card" aria-current="true"></button></main>`);
  const { document } = dom.window;
  globalThis.document = document;
  globalThis.CustomEvent = dom.window.CustomEvent;
  t.after(() => { dom.window.close(); delete globalThis.document; delete globalThis.CustomEvent; });
  const shell = document.querySelector('main');
  shell.requestFullscreen = async () => { document.fullscreenElement = shell; document.dispatchEvent(new dom.window.Event('fullscreenchange')); };
  document.exitFullscreen = async () => { document.fullscreenElement = null; document.dispatchEvent(new dom.window.Event('fullscreenchange')); };
  setupWorkspacePanels();
  return { document, shell, editor: document.querySelector('#code-panel') };
}

test('editor is immediately visible outside fullscreen', t => {
  const { editor } = workspace(t);
  assert.equal(editor.hidden, false);
});

test('fullscreen hides the editor; opening and leaving preserves code and restores visibility', async t => {
  const { document, shell, editor } = workspace(t);
  const text = editor.querySelector('textarea');
  text.value = 'digitalWrite(13, HIGH);';
  await shell.requestFullscreen();
  assert.equal(editor.hidden, true);
  document.querySelector('#code-toggle').click();
  assert.equal(editor.hidden, false);
  assert.equal(document.activeElement, text);
  document.querySelector('#close-code').click();
  assert.equal(editor.hidden, true);
  await document.exitFullscreen();
  assert.equal(editor.hidden, false);
  assert.equal(text.value, 'digitalWrite(13, HIGH);');
  await shell.requestFullscreen();
  assert.equal(editor.hidden, true);
});
