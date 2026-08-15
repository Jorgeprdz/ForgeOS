import { createAuraCarteraFutureRadar017e } from './cartera-future-radar-017e.js?v=post017e-hotfix002c-base';
import {
  CARTERA_SAFE_PERSON_FALLBACK_002C,
  isInternalCarteraReference002c,
} from './cartera-live-closure-002c.js?v=post017e-hotfix002c-safe-labels';

const DOCUMENT_REVIEW_LABEL = 'Documento pendiente de revisión';
const LEGACY_DOCUMENT_AS_POLICY_LABEL = 'Información de póliza por revisar';
const SOURCE_LABELS = Object.freeze({
  DOCUMENT_INTAKE: 'Documentos',
  PAYMENT_OBLIGATION: 'Pagos',
  POLICY_INTELLIGENCE: 'Pólizas',
  RELATIONSHIP_MEMORY: 'Relación',
  CONSERVATION_INTELLIGENCE: 'Conservación',
  COMPENSATION_INTELLIGENCE: 'Compensación',
});
const TRUTH_LABELS = Object.freeze({
  CONFIRMED_FACT: 'Hecho confirmado',
  SCHEDULED_EVENT: 'Evento programado',
  DETECTED_EVIDENCE: 'Evidencia detectada',
  INFERENCE: 'Inferencia',
  RECOMMENDATION: 'Recomendación',
});
const UUID_GLOBAL = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const PACKET_GLOBAL = /POLICY_PACKET:AURA:[A-Za-z0-9._:@/-]+/gi;
const CARTERA_REF_GLOBAL = /\b(?:person|policy|account):[A-Za-z0-9._:@/-]+/gi;
const TECHNICAL_REF_GLOBAL = /\b[A-Z][A-Z0-9_]{2,}:[A-Za-z0-9][A-Za-z0-9._:@/-]*/g;

function text(value) {
  return String(value ?? '').trim();
}

export function safeVisibleCarteraText002c(value) {
  const original = String(value ?? '');
  const exact = text(original);
  if (SOURCE_LABELS[exact]) return original.replace(exact, SOURCE_LABELS[exact]);
  if (TRUTH_LABELS[exact]) return original.replace(exact, TRUTH_LABELS[exact]);
  if (exact && isInternalCarteraReference002c(exact)) {
    if (/^person:/i.test(exact)) return original.replace(exact, CARTERA_SAFE_PERSON_FALLBACK_002C);
    if (/^policy:/i.test(exact)) return original.replace(exact, 'Póliza registrada');
    if (/^account:/i.test(exact)) return original.replace(exact, 'Cuenta registrada');
    if (/^POLICY_PACKET:/i.test(exact)) return original.replace(exact, 'Documento registrado');
    return original.replace(exact, 'Referencia interna protegida');
  }
  return original
    .replace(PACKET_GLOBAL, 'documento registrado')
    .replace(CARTERA_REF_GLOBAL, match => /^person:/i.test(match)
      ? 'persona registrada'
      : /^policy:/i.test(match) ? 'póliza registrada' : 'cuenta registrada')
    .replace(UUID_GLOBAL, 'registro interno')
    .replace(TECHNICAL_REF_GLOBAL, 'registro interno');
}

function sanitizeTextNodes002c(node) {
  for (const child of [...(node?.childNodes || [])]) {
    if (child.nodeType === 3) {
      const current = String(child.nodeValue ?? '');
      const next = safeVisibleCarteraText002c(current);
      if (next !== current) child.nodeValue = next;
      continue;
    }
    if (child.nodeType !== 1 || child.tagName === 'STYLE' || child.tagName === 'SCRIPT') continue;
    sanitizeTextNodes002c(child);
  }
}

function documentPacketCard002c(trigger) {
  const packetReference = text(trigger?.getAttribute?.('data-radar-review-packet'));
  if (!packetReference.startsWith('POLICY_PACKET:')) return null;
  return trigger.closest('[data-radar-signal-reference]');
}

export function reconcileCarteraRadarPresentation002c(root) {
  if (!root) return;

  root.querySelectorAll('[data-radar-review-packet]').forEach(trigger => {
    const card = documentPacketCard002c(trigger);
    if (!card) return;
    const title = card.querySelector('h5');
    if (title && text(title.textContent) !== DOCUMENT_REVIEW_LABEL) {
      title.textContent = DOCUMENT_REVIEW_LABEL;
    }
    const groupSubtitle = card.closest('.radar002-person')?.querySelector('.radar002-person-head p');
    if (groupSubtitle && text(groupSubtitle.textContent) === LEGACY_DOCUMENT_AS_POLICY_LABEL) {
      groupSubtitle.textContent = DOCUMENT_REVIEW_LABEL;
    }
  });

  root.querySelectorAll('.radar002-person-head h4').forEach(heading => {
    const current = text(heading.textContent);
    if (isInternalCarteraReference002c(current) && current !== CARTERA_SAFE_PERSON_FALLBACK_002C) {
      heading.textContent = CARTERA_SAFE_PERSON_FALLBACK_002C;
    }
  });

  root.querySelectorAll('.radar002-evidence dl > div').forEach(row => {
    const label = text(row.querySelector('dt')?.textContent);
    if (label === 'Registro' || label === 'Señal') row.remove();
  });

  sanitizeTextNodes002c(root);
}

function reconcileDocumentArticleHtml002c(article) {
  if (!/data-radar-review-packet="POLICY_PACKET:[^"]+"/i.test(article)) return article;
  return article
    .replace(
      /(<header\b[^>]*class="[^"]*\bradar002-person-head\b[^"]*"[^>]*>[\s\S]*?<p>)Información de póliza por revisar(<\/p>)/i,
      `$1${DOCUMENT_REVIEW_LABEL}$2`,
    )
    .replace(
      /(<section\b[^>]*class="[^"]*\bradar002-signal\b[^"]*"[^>]*>[\s\S]*?<h5>)[\s\S]*?(<\/h5>)/i,
      `$1${DOCUMENT_REVIEW_LABEL}$2`,
    );
}

export function sanitizeCarteraRadarHtml002c(html) {
  const source = String(html ?? '');
  const styleBlocks = [];
  let protectedHtml = source.replace(/<style\b[\s\S]*?<\/style>/gi, match => {
    const token = `__FORGE_STYLE_${styleBlocks.length}__`;
    styleBlocks.push(match);
    return token;
  });

  protectedHtml = protectedHtml.replace(
    /<article\b[^>]*class="[^"]*\bradar002-person\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi,
    reconcileDocumentArticleHtml002c,
  );
  protectedHtml = protectedHtml
    .replace(/<div><dt>Registro<\/dt><dd>[\s\S]*?<\/dd><\/div>/gi, '')
    .replace(/<div><dt>Señal<\/dt><dd>[\s\S]*?<\/dd><\/div>/gi, '');

  protectedHtml = protectedHtml.split(/(<[^>]+>)/g).map(part => {
    if (part.startsWith('<')) return part;
    return safeVisibleCarteraText002c(part);
  }).join('');

  protectedHtml = protectedHtml.replace(/__FORGE_STYLE_(\d+)__/g, (_, index) => styleBlocks[Number(index)] || '');
  return protectedHtml;
}

export function createCarteraRadarPresentation002c({ root, windowRef = window } = {}) {
  let observer = null;
  let scheduled = false;

  const reconcile = () => {
    scheduled = false;
    reconcileCarteraRadarPresentation002c(root);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(reconcile);
  };

  return Object.freeze({
    start() {
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

export function createAuraCarteraFutureRadar002c(options = {}) {
  const base = createAuraCarteraFutureRadar017e(options);
  const presentation = createCarteraRadarPresentation002c({
    root: options.root,
    windowRef: options.windowRef || window,
  });

  return Object.freeze({
    ...base,
    async mount() {
      presentation.start();
      await base.mount();
      presentation.reconcile();
    },
    async reload() {
      const result = await base.reload();
      presentation.reconcile();
      return result;
    },
    async scrub() {
      presentation.stop();
      return base.scrub();
    },
    async unmount() {
      presentation.stop();
      return base.unmount();
    },
    async destroy() {
      presentation.stop();
      return base.destroy();
    },
    reconcile() {
      base.reconcile?.();
      presentation.reconcile();
    },
    diagnostics() {
      return Object.freeze({
        ...(base.diagnostics?.() || {}),
        presentationClosure: 'POST_017E_HOTFIX_002C',
        rawInternalReferenceUserVisible: false,
        documentVsPolicySemantics: 'DISTINCT',
      });
    },
  });
}
