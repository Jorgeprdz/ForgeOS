import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v8.js?v=forge-aura-live-acceptance-011e-base';

function text(value) {
  return String(value ?? '').trim();
}

function setTextIfChanged(node, value) {
  if (!node) return false;
  const next = String(value ?? '');
  if (node.textContent === next) return false;
  node.textContent = next;
  return true;
}

function humanizeProductReference(value) {
  const raw = text(value);
  if (!raw) return 'Producto no identificado';
  if (!/^product:/i.test(raw)) return raw;
  const body = raw.replace(/^product:/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!body) return 'Producto no identificado';
  return body.split(' ').map(token => {
    if (/^udi$/i.test(token)) return 'UDI';
    if (/^(orvi|sgmm|gmm)$/i.test(token)) return token.toUpperCase();
    if (/^\d+$/.test(token)) return token;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join(' ');
}

function normalizeProductCopy(value) {
  const raw = text(value);
  if (!raw) return raw;
  const pieces = raw.split(' · ');
  if (!pieces.length || !/^product:/i.test(pieces[0])) return raw;
  pieces[0] = humanizeProductReference(pieces[0]);
  return pieces.join(' · ');
}

export function createCarteraModule(options = {}) {
  const { root, windowRef = window } = options;
  if (!root) throw new Error('AURA_CARTERA_ROOT_REQUIRED');

  const base = createBaseCarteraModule(options);
  let observer = null;
  let destroyed = false;

  function normalizeAttention() {
    const title = root.querySelector('#cartera-attention-title');
    const panel = title?.closest('.cartera-panel');
    if (!panel) return;
    const items = [...panel.querySelectorAll('.cartera-attention-item')];
    if (!items.length) return;

    const copy = panel.querySelector(':scope > header > div > p:not(.cartera-eyebrow)');
    setTextIfChanged(
      copy,
      'Hasta tres señales explicables. Cada tarjeta es una señal sobre tu cartera; no equivale a una póliza adicional.',
    );

    const uniquePolicies = new Set(
      [...root.querySelectorAll('.cartera-directory-row[data-directory-kind="POLICY"][data-directory-reference]')]
        .map(node => text(node.dataset.directoryReference))
        .filter(Boolean),
    );
    const counter = panel.querySelector(':scope > header > span');
    if (counter) {
      const signalLabel = `${items.length} ${items.length === 1 ? 'señal' : 'señales'}`;
      const counterLabel = uniquePolicies.size === 1 ? `${signalLabel} · 1 póliza` : signalLabel;
      setTextIfChanged(counter, counterLabel);
      const ariaLabel = `${signalLabel} de atención`;
      if (counter.getAttribute('aria-label') !== ariaLabel) counter.setAttribute('aria-label', ariaLabel);
    }
  }

  function normalizePolicyRow(row) {
    if (!row || row.dataset.aura011ePolicyRow === 'true') return;
    row.dataset.aura011ePolicyRow = 'true';
    row.type = 'button';
    row.classList.add('cartera-policy-row-011e');

    const icon = row.querySelector('.cartera-directory-icon');
    if (icon) {
      setTextIfChanged(icon, '▤');
      icon.setAttribute('aria-hidden', 'true');
    }

    const secondary = row.querySelector('small');
    if (secondary) setTextIfChanged(secondary, normalizeProductCopy(secondary.textContent));

    const number = text(row.querySelector('strong')?.textContent) || 'póliza';
    row.setAttribute('aria-label', `Abrir detalle de la póliza ${number}`);

    if (!row.querySelector('.cartera-policy-row__action')) {
      const action = row.ownerDocument.createElement('span');
      action.className = 'cartera-policy-row__action';
      action.setAttribute('aria-hidden', 'true');
      action.textContent = 'Ver detalle →';
      row.append(action);
    }
  }

  function normalizeWorkspace() {
    root.querySelectorAll('.cartera-workspace button[data-open-policy]').forEach(normalizePolicyRow);
    root.querySelectorAll('.cartera-workspace__hero h1').forEach(title => {
      if (/^product:/i.test(text(title.textContent))) {
        setTextIfChanged(title, humanizeProductReference(title.textContent));
      }
    });
    root.querySelectorAll('.cartera-directory-row small').forEach(node => {
      if (/^product:/i.test(text(node.textContent))) {
        setTextIfChanged(node, normalizeProductCopy(node.textContent));
      }
    });
  }

  function normalize() {
    if (destroyed || !root.isConnected) return;
    normalizeAttention();
    normalizeWorkspace();
    root.dataset.auraLiveAcceptance011e = 'true';
  }

  function start() {
    if (observer) return;
    const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(() => normalize());
    observer.observe(root, { childList: true, subtree: true });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      destroyed = false;
      await base.mount?.();
      normalize();
      start();
    },
    async reload() {
      const result = await base.reload?.();
      normalize();
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      destroyed = true;
      stop();
      return base.destroy?.();
    },
  });
}

export { humanizeProductReference };
