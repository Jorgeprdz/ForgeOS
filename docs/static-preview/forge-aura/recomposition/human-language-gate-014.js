const CONTRACT_ID = 'FORGE_AURA_HUMAN_LANGUAGE_GATE_014';
const ACTIVE_AUDITOR_ID = 'FORGE_AURA_HUMAN_LANGUAGE_ACTIVE_AUDITOR_014B';

const FORBIDDEN = Object.freeze([
  /\bcan[oó]nic(?:al|o|a|os|as)\b/i,
  /\bsource-owner\b/i,
  /\bsource owner\b/i,
  /\bsource\b/i,
  /\bevidence\b/i,
  /\bauthority\b/i,
  /\bPolicy Intelligence\b/i,
  /\bRelationship Intelligence\b/i,
  /\brelationship memory\b/i,
  /\bmemoria relacional\b/i,
  /\bbrief relacional\b/i,
  /\badapter\b/i,
  /\bruntime\b/i,
  /\bnamespace\b/i,
  /\bstage changed\b/i,
  /\bEVIDENCE_VERSION\b/i,
  /\bCANONICAL_SOURCE_LIMIT\b/i,
  /\bHISTORY_LIMIT\b/i,
  /\bledger\b/i,
  /\bread model\b/i,
  /\bwrite model\b/i,
  /\bprojection\b/i,
  /\bpayload\b/i,
  /\bRLS\b/i,
  /\bCommercialPerson\b/i,
  /\bCRS-\d+\b/i,
  /\bLLM\b/i,
  /\bGENERATED_YTD\b/i,
  /\bEXPECTED\b/i,
  /\bSCENARIO\b/i,
  /\bEARNED\b/i,
  /fallback t[eé]cnico/i,
]);

const INTERNAL_SELECTOR = [
  '[hidden]',
  '[aria-hidden="true"]',
  '[data-internal-only-014="true"]',
  '.aura-technical-disclosure',
  '.aura-conversation__technical',
  '[data-conversation-technical]',
  '[data-pipeline-context-technical]',
  '[data-pipeline-projection-technical]',
  '[data-pipeline-crs10-technical]',
  '[data-observability]',
  '[data-technical]',
  'script',
  'style',
  'template',
].join(',');

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function isInternal(node) {
  return Boolean(node?.parentElement?.closest?.(INTERNAL_SELECTOR));
}

function isRendered(node) {
  const element = node?.parentElement;
  if (!element || isInternal(node)) return false;
  const view = element.ownerDocument?.defaultView;
  if (!view?.getComputedStyle) return true;
  const style = view.getComputedStyle(element);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.visibility !== 'collapse';
}

function matchForbidden(value) {
  const current = text(value);
  if (!current) return null;
  const pattern = FORBIDDEN.find(candidate => candidate.test(current));
  return pattern ? Object.freeze({ pattern: String(pattern), text: current }) : null;
}

function routeFor(node) {
  const element = node?.parentElement;
  return element?.closest?.('[data-route],[data-aura-route],[data-route-module]')?.getAttribute?.('data-route')
    || element?.closest?.('[data-aura-route]')?.getAttribute?.('data-aura-route')
    || element?.closest?.('[data-route-module]')?.getAttribute?.('data-route-module')
    || null;
}

function audit(root = document.body) {
  if (!root) return Object.freeze({ contractId: CONTRACT_ID, count: 0, violations: [] });
  const doc = root.ownerDocument || document;
  const NodeFilterRef = doc.defaultView?.NodeFilter || globalThis.NodeFilter;
  if (!NodeFilterRef) return Object.freeze({ contractId: CONTRACT_ID, count: 0, violations: [] });
  const walker = doc.createTreeWalker(root, NodeFilterRef.SHOW_TEXT);
  const violations = [];
  let node = walker.nextNode();
  while (node) {
    if (isRendered(node)) {
      const match = matchForbidden(node.nodeValue);
      if (match) {
        violations.push(Object.freeze({
          ...match,
          tag: node.parentElement?.tagName || null,
          route: routeFor(node),
        }));
      }
    }
    node = walker.nextNode();
  }
  return Object.freeze({
    contractId: CONTRACT_ID,
    count: violations.length,
    violations: Object.freeze(violations),
  });
}

function assertClean(root = document.body) {
  const result = audit(root);
  if (result.count > 0) {
    const error = new Error(`HUMAN_LANGUAGE_GATE_014_FAILED:${result.count}`);
    error.code = 'HUMAN_LANGUAGE_GATE_014_FAILED';
    error.violations = result.violations;
    throw error;
  }
  return result;
}

let observer = null;
let observedRoot = null;
let scheduled = false;
let latestResult = Object.freeze({ contractId: CONTRACT_ID, count: 0, violations: [] });
let latestSignature = '';

function resultSignature(result) {
  return JSON.stringify((result?.violations || []).map(item => [item.route, item.tag, item.pattern, item.text]));
}

function publish(result) {
  latestResult = result;
  const doc = observedRoot?.ownerDocument || globalThis.document;
  const html = doc?.documentElement;
  if (html) {
    const state = result.count > 0 ? 'fail' : 'pass';
    if (html.dataset.humanLanguageGate014 !== state) html.dataset.humanLanguageGate014 = state;
    const count = String(result.count);
    if (html.dataset.humanLanguageViolations014 !== count) html.dataset.humanLanguageViolations014 = count;
    if (html.dataset.humanLanguageAuditor014 !== ACTIVE_AUDITOR_ID) html.dataset.humanLanguageAuditor014 = ACTIVE_AUDITOR_ID;
  }
  const signature = resultSignature(result);
  if (signature === latestSignature) return result;
  latestSignature = signature;
  const view = doc?.defaultView || globalThis;
  const EventCtor = view?.CustomEvent || globalThis.CustomEvent;
  if (EventCtor && view?.dispatchEvent) {
    view.dispatchEvent(new EventCtor('forge:human-language-gate-014', {
      detail: Object.freeze({
        contractId: CONTRACT_ID,
        activeAuditorId: ACTIVE_AUDITOR_ID,
        count: result.count,
        violations: result.violations,
      }),
    }));
  }
  return result;
}

function runActiveAudit() {
  scheduled = false;
  if (!observedRoot?.isConnected) return latestResult;
  return publish(audit(observedRoot));
}

function scheduleActiveAudit() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(runActiveAudit);
}

function stop() {
  observer?.disconnect?.();
  observer = null;
  observedRoot = null;
  scheduled = false;
}

function start(root = document.body) {
  if (!root) return null;
  if (observer && observedRoot === root) {
    scheduleActiveAudit();
    return observer;
  }
  stop();
  observedRoot = root;
  const doc = root.ownerDocument || document;
  const Observer = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
  if (Observer) {
    observer = new Observer(scheduleActiveAudit);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden', 'aria-hidden', 'class', 'style'],
    });
  }
  scheduleActiveAudit();
  return observer;
}

function latest() {
  return latestResult;
}

const api = Object.freeze({
  contractId: CONTRACT_ID,
  activeAuditorId: ACTIVE_AUDITOR_ID,
  forbiddenPatterns: FORBIDDEN,
  audit,
  assertClean,
  start,
  stop,
  latest,
});

globalThis.ForgeAuraHumanLanguageGate014 = api;

if (globalThis.document) {
  if (document.body) start(document.body);
  else document.addEventListener('DOMContentLoaded', () => start(document.body), { once: true });
}

export {
  ACTIVE_AUDITOR_ID,
  CONTRACT_ID,
  FORBIDDEN,
  audit,
  assertClean,
  latest,
  start,
  stop,
};
