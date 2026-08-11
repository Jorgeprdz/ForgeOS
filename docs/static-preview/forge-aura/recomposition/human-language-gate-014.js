const CONTRACT_ID = 'FORGE_AURA_HUMAN_LANGUAGE_GATE_014';

const FORBIDDEN = Object.freeze([
  /\bcan[oó]nic(?:al|o|a|os|as)\b/i,
  /\bsource-owner\b/i,
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
]);

const INTERNAL_SELECTOR = [
  '[hidden]',
  '[aria-hidden="true"]',
  '[data-internal-only-014="true"]',
  '.aura-technical-disclosure',
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
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse';
}

function matchForbidden(value) {
  const current = text(value);
  if (!current) return null;
  const pattern = FORBIDDEN.find(candidate => candidate.test(current));
  return pattern ? Object.freeze({ pattern: String(pattern), text: current }) : null;
}

function audit(root = document.body) {
  if (!root) return Object.freeze({ contractId: CONTRACT_ID, count: 0, violations: [] });
  const doc = root.ownerDocument || document;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const violations = [];
  let node = walker.nextNode();
  while (node) {
    if (isRendered(node)) {
      const match = matchForbidden(node.nodeValue);
      if (match) {
        violations.push(Object.freeze({
          ...match,
          tag: node.parentElement?.tagName || null,
          route: root.closest?.('[data-route]')?.getAttribute?.('data-route') || null,
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

globalThis.ForgeAuraHumanLanguageGate014 = Object.freeze({
  contractId: CONTRACT_ID,
  forbiddenPatterns: FORBIDDEN,
  audit,
  assertClean,
});

export { CONTRACT_ID, FORBIDDEN, audit, assertClean };