import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root=new URL('../../preview/',import.meta.url);
test('Aura root tokens are exact canonical extracts and assets are local',()=>{
  const css=readFileSync(new URL('aura-tokens.css',root),'utf8');
  const spec=readFileSync(new URL('../../docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md',root),'utf8');
  assert.ok(css.includes('--forge-brand: #6C3CE8;'));
  const blocks=[...spec.matchAll(/```css\n([\s\S]*?)```/g)].map(m=>m[1]);
  for(const declaration of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const compact=s=>s.replace(/\s+/g,' ').trim();
    assert.ok(blocks.some(b=>[...b.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].some(m=>m[1]===declaration[1]&&compact(m[2])===compact(declaration[2]))),'Noncanonical token '+declaration[1]);
  }
  assert.ok(readFileSync(new URL('assets/InterVariable.woff2',root)).subarray(0,4).equals(Buffer.from('wOF2')));
  assert.match(readFileSync(new URL('assets/Inter-OFL.txt',root),'utf8'),/SIL OPEN FONT LICENSE/);
});
test('preview CSS uses governed values without legacy imports or local color tokens',()=>{
  const css=readFileSync(new URL('styles.css',root),'utf8');
  assert.doesNotMatch(css,/@import|https?:|#[0-9a-f]{3,8}\b|rgba?\(|--[\w-]+\s*:/i);
  assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);
  assert.match(css,/font-display:\s*swap/);assert.match(css,/InterVariable\.woff2/);
});
test('UI and model do not persist, make external requests, inject raw HTML, or import original engines',()=>{
  for(const name of readdirSync(root).filter(n=>n.endsWith('.mjs'))) {
    if(name==='serve.mjs')continue;
    const code=readFileSync(new URL(name,root),'utf8');
    assert.doesNotMatch(code,/localStorage|sessionStorage|indexedDB|serviceWorker|document\.cookie|fetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//,name);
    assert.doesNotMatch(code,/manager-os\/|candidate-evidence-provenance|quotes\/printable/,name);
  }
  const html=readFileSync(new URL('index.html',root),'utf8');
  assert.match(html,/MODO DEMOSTRACIÓN/);assert.match(html,/NO guardado en la nube/);
  assert.doesNotMatch(html,/src=["']https?:|href=["']https?:/);
});
