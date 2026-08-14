import {
  CARTERA_PRIMARY_ATTENTION_OWNER_002B,
  installCarteraClosureStyles002b,
} from './cartera-live-closure-002b.js?v=post017e-hotfix002-live-closure-002b';

function text(value) {
  return String(value ?? '').trim();
}

export function confirmationChipLabel002b(value) {
  return text(value).replace(/^Confirmar\s*·/i, 'Pago por confirmar ·');
}

export function reconcileCarteraPresentation002b(root) {
  if (!root) return;

  root.dataset.carteraPrimaryAttentionOwner = CARTERA_PRIMARY_ATTENTION_OWNER_002B;

  const legacy = root.querySelector('#cartera-attention-title')?.closest('.cartera-panel');
  legacy?.remove();

  root.querySelectorAll('.cartera-metric').forEach(metric => {
    const label = metric.querySelector('span');
    const context = metric.querySelector('p');
    if (text(label?.textContent) !== 'Requieren revisión') return;

    label.textContent = 'Pólizas con datos incompletos';
    const current = text(context?.textContent);
    if (current === '0 pendientes' && context) {
      context.textContent = '0 pólizas con datos incompletos';
    } else if (context) {
      const next = current
        .replace(/póliza requiere revisión/i, 'póliza con datos canónicos incompletos')
        .replace(/pólizas requieren revisión/i, 'pólizas con datos canónicos incompletos');
      if (next !== current) context.textContent = next;
    }
  });

  const confirmationChip = root.querySelector('[data-radar-horizon="CONFIRMATION_REQUIRED"]');
  if (confirmationChip) {
    const currentLabel = text(confirmationChip.textContent);
    const nextLabel = confirmationChipLabel002b(currentLabel);
    if (nextLabel !== currentLabel) confirmationChip.textContent = nextLabel;

    const ariaLabel = 'Pagos o evidencia de pago que requieren confirmación';
    if (confirmationChip.getAttribute('aria-label') !== ariaLabel) {
      confirmationChip.setAttribute('aria-label', ariaLabel);
    }
  }
}

export function createCarteraPresentationClosure002b({ root, windowRef = window } = {}) {
  let observer = null;
  let scheduled = false;

  const reconcile = () => {
    scheduled = false;
    reconcileCarteraPresentation002b(root);
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(reconcile);
  };

  return Object.freeze({
    start() {
      installCarteraClosureStyles002b(root);
      reconcile();
      const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
      if (Observer && !observer) {
        observer = new Observer(schedule);
        observer.observe(root, { childList: true, subtree: true, characterData: true });
      }
    },
    reconcile,
    stop() {
      observer?.disconnect();
      observer = null;
      scheduled = false;
    },
  });
}
