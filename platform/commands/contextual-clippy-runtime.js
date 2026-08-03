import { createContextualNotificationRuntime } from '../../advisor-os/notifications/contextual-notification-runtime.js';
import { abrirCommandPalette } from './command-palette-ui.js';

const CARD_ID = 'command-os-contextual-clippy';
let cleanup = null;

function removeCard() {
  document.getElementById(CARD_ID)?.remove();
}

function fillDraft(value) {
  abrirCommandPalette();
  const input = document.getElementById('universal-command-input');
  if (!input) return;
  input.value = String(value || '').trim();
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}

function render(notification, runtime) {
  removeCard();
  const card = document.createElement('aside');
  card.id = CARD_ID;
  card.className = 'command-experience-card command-clippy command-contextual-clippy';
  card.setAttribute('aria-live', 'polite');
  card.innerHTML = `
    <button type="button" class="command-clippy-close" aria-label="Cerrar sugerencia" data-contextual-dismiss>×</button>
    <p class="command-experience-kicker">Siguiente acción</p>
    <strong>${notification.title}</strong>
    ${notification.body ? `<p>${notification.body}</p>` : ''}
    ${notification.draft ? '<button type="button" data-contextual-open>Revisar en Command Bar</button>' : ''}`;
  card.addEventListener('click', event => {
    if (event.target.closest('[data-contextual-open]')) {
      runtime.dismiss(notification.id);
      removeCard();
      fillDraft(notification.draft);
    }
    if (event.target.closest('[data-contextual-dismiss]')) {
      runtime.dismiss(notification.id);
      removeCard();
    }
  });
  document.body.appendChild(card);
}

export function mountContextualClippy({ eventTarget = window, runtime = createContextualNotificationRuntime() } = {}) {
  if (cleanup) return cleanup;
  const onSignals = event => {
    const result = runtime.evaluate(Array.isArray(event.detail) ? event.detail : event.detail?.signals || []);
    if (result.status === 'READY') render(result.notification, runtime);
    else removeCard();
  };
  const onMute = event => {
    runtime.setMuted(event.detail?.muted === true);
    if (event.detail?.muted === true) removeCard();
  };
  eventTarget.addEventListener('forge:contextual-notification-signals', onSignals);
  eventTarget.addEventListener('forge:contextual-notifications-preference', onMute);
  cleanup = () => {
    eventTarget.removeEventListener('forge:contextual-notification-signals', onSignals);
    eventTarget.removeEventListener('forge:contextual-notifications-preference', onMute);
    runtime.scrub();
    removeCard();
    cleanup = null;
  };
  return cleanup;
}

export function unmountContextualClippy() {
  cleanup?.();
}
