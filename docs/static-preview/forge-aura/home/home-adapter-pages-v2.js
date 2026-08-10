import { createHomePagesAdapter as createPreviousAdapter } from './home-adapter-pages-v1.js?v=aura-home-command-center-001';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function subjectKey(item = {}, index = 0) {
  return item.personReference
    ? `PERSON:${item.personReference}`
    : item.policyReference
      ? `POLICY:${item.policyReference}`
      : `SIGNAL:${item.signalReference || index}`;
}

function signalPriority(item = {}) {
  const horizon = { CONFIRMATION_REQUIRED: 0, OVERDUE: 1, TODAY: 2, NEXT_7_DAYS: 3, NEXT_30_DAYS: 4, NEXT_90_DAYS: 5 };
  const type = { INCOMPLETE_POLICY_DATA: 0, UNCONFIRMED_PAYMENT_EVIDENCE: 1, POSSIBLE_LATE_PAYMENT: 2, RELATIONSHIP_REVIEW_DUE: 3 };
  return [horizon[item.horizon] ?? 9, type[item.signalType] ?? 9];
}

function compareSignals(left, right) {
  const a = signalPriority(left);
  const b = signalPriority(right);
  return a[0] - b[0] || a[1] - b[1] || String(left.signalReference || '').localeCompare(String(right.signalReference || ''));
}

export function groupHomeCarteraFocusItems010j(radar = {}) {
  const source = Array.isArray(radar.focusItems)
    ? radar.focusItems
    : Array.isArray(radar.items) ? radar.items : [];
  const groups = new Map();
  source.forEach((item, index) => {
    const key = subjectKey(item, index);
    groups.set(key, [...(groups.get(key) || []), item]);
  });
  const merged = [];
  for (const group of groups.values()) {
    const ordered = [...group].sort(compareSignals);
    const primary = ordered[0];
    if (ordered.length === 1) {
      merged.push(primary);
      continue;
    }
    const relatedTypes = [...new Set(ordered.map(item => item.signalType).filter(Boolean))];
    merged.push({
      ...primary,
      signalReference: `AURA010J:GROUP:${primary.personReference || primary.policyReference || primary.signalReference}`,
      whyNow: `${ordered.length} contextos de Cartera convergen sobre esta misma persona. ${ordered.map(item => item.whyNow).filter(Boolean).join(' ')}`,
      uncertainty: ordered.map(item => item.uncertainty).filter(Boolean).join(' '),
      smallestUsefulAction: primary.policyReference
        ? 'Abrir Cartera y revisar la póliza y el contexto de la relación en una sola vista.'
        : 'Abrir Cartera y revisar los contextos vinculados de esta persona.',
      relatedSignalCount: ordered.length,
      relatedSignalTypes: relatedTypes,
      groupedByPerson010j: true,
    });
  }
  return freeze(merged.sort(compareSignals).slice(0, 12));
}

export async function createHomePagesAdapter(options = {}) {
  const adapter = await createPreviousAdapter(options);
  return Object.freeze({
    ...adapter,
    async load(input = {}) {
      const snapshot = await adapter.load(input);
      if (snapshot?.radar?.state !== 'READY' || !snapshot.radar.value) return snapshot;
      const radar = snapshot.radar.value;
      const value = freeze({ ...radar, focusItems: groupHomeCarteraFocusItems010j(radar) });
      return freeze({
        ...snapshot,
        radar: { ...snapshot.radar, value },
      });
    },
    diagnostics() {
      return freeze({
        ...(adapter.diagnostics?.() || {}),
        homeCarteraPersonGrouping010j: true,
        rankingPerformed: false,
        domainWrites: 0,
      });
    },
  });
}
