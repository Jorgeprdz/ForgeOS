import { abrirCommandPalette } from './command-palette-ui.js';

const STORAGE_KEY = 'forge:command-os:experience:v1';
const BENVENU_ID = 'command-os-benvenu';
const CLIPPY_ID = 'command-os-clippy';
let cleanup = null;

function readState() {
  try {
    return { seenBenvenu: false, skippedBenvenu: false, successfulUses: 0, clippyDismissed: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { seenBenvenu: false, skippedBenvenu: false, successfulUses: 0, clippyDismissed: false };
  }
}

function writeState(next) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function fillDraft(value) {
  abrirCommandPalette();
  const input = document.getElementById('universal-command-input');
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}

function remove(id) {
  document.getElementById(id)?.remove();
}

function mountBenvenu() {
  const state = readState();
  if (state.seenBenvenu || document.getElementById(BENVENU_ID)) return;
  const card = document.createElement('section');
  card.id = BENVENU_ID;
  card.className = 'command-experience-card command-benvenu';
  card.setAttribute('aria-label', 'Bienvenida a Forge');
  card.innerHTML = `
    <p class="command-experience-kicker">Benvenù</p>
    <h2>No viniste a llenar otro CRM.</h2>
    <p>Forge conecta tu trabajo de hoy con la siguiente acción útil.</p>
    <div class="command-experience-actions">
      <button type="button" data-benvenu-start>Ver mi Pipeline</button>
      <button type="button" class="secondary" data-benvenu-skip>Ahora no</button>
    </div>`;
  card.addEventListener('click', event => {
    if (event.target.closest('[data-benvenu-start]')) {
      writeState({ ...readState(), seenBenvenu: true, skippedBenvenu: false });
      remove(BENVENU_ID);
      fillDraft('pipeline');
    }
    if (event.target.closest('[data-benvenu-skip]')) {
      writeState({ ...readState(), seenBenvenu: true, skippedBenvenu: true });
      remove(BENVENU_ID);
    }
  });
  document.body.appendChild(card);
}

function currentRoute() {
  return new URL(location.href).searchParams.get('nav') || 'dashboard';
}

function mountClippy() {
  const state = readState();
  if (!state.seenBenvenu || state.clippyDismissed || state.successfulUses >= 2 || document.getElementById(CLIPPY_ID)) return;
  const route = currentRoute();
  const suggestion = route === 'advisor-sales-pipeline' || route === 'pipeline'
    ? { text: '¿Necesitas dejar un seguimiento? Puedes escribirlo aquí y revisarlo antes de guardar.', draft: 'seguimiento' }
    : { text: 'Puedes abrir cualquier módulo sin buscarlo en el menú.', draft: 'pipeline' };
  const card = document.createElement('aside');
  card.id = CLIPPY_ID;
  card.className = 'command-experience-card command-clippy';
  card.innerHTML = `
    <button type="button" class="command-clippy-close" aria-label="Cerrar sugerencia" data-clippy-close>×</button>
    <p class="command-experience-kicker">Tip</p>
    <p>${suggestion.text}</p>
    <button type="button" data-clippy-try>Probar en Command Bar</button>`;
  card.addEventListener('click', event => {
    if (event.target.closest('[data-clippy-try]')) {
      remove(CLIPPY_ID);
      fillDraft(suggestion.draft);
    }
    if (event.target.closest('[data-clippy-close]')) {
      writeState({ ...readState(), clippyDismissed: true });
      remove(CLIPPY_ID);
    }
  });
  document.body.appendChild(card);
}

function bindVoice(root) {
  const button = root.querySelector('#command-voice-draft');
  const input = root.querySelector('#universal-command-input');
  const status = root.querySelector('#command-input-status');
  if (!button || !input) return () => {};
  const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (!Recognition) {
    button.hidden = true;
    return () => {};
  }
  let recognition = null;
  const onClick = () => {
    recognition?.abort?.();
    recognition = new Recognition();
    recognition.lang = 'es-MX';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    status.textContent = 'Escuchando…';
    button.setAttribute('aria-pressed', 'true');
    recognition.onresult = event => {
      input.value = event.results?.[0]?.[0]?.transcript || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      status.textContent = 'Borrador de voz. Revísalo antes de ejecutar.';
    };
    recognition.onerror = () => { status.textContent = 'No pude escuchar. Puedes escribir el comando.'; };
    recognition.onend = () => button.setAttribute('aria-pressed', 'false');
    recognition.start();
  };
  button.addEventListener('click', onClick);
  return () => { button.removeEventListener('click', onClick); recognition?.abort?.(); };
}

export function mountAdvisorExperience(root) {
  const voiceCleanup = bindVoice(root);
  const onSuccess = () => {
    const state = readState();
    writeState({ ...state, successfulUses: Math.min(99, Number(state.successfulUses || 0) + 1) });
    if (readState().successfulUses >= 2) remove(CLIPPY_ID);
  };
  window.addEventListener('command-os:successful-use', onSuccess);
  mountBenvenu();
  queueMicrotask(mountClippy);
  cleanup = () => {
    voiceCleanup();
    window.removeEventListener('command-os:successful-use', onSuccess);
    remove(BENVENU_ID);
    remove(CLIPPY_ID);
    cleanup = null;
  };
  return cleanup;
}

export function unmountAdvisorExperience() {
  cleanup?.();
}
