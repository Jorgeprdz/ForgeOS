const SERVICE_ACTION_TYPES = Object.freeze([
  'ANNUAL_REVIEW',
  'RENEWAL_REVIEW',
  'PAYMENT_FOLLOW_UP',
  'CLIENT_CONTACT',
  'DOCUMENT_REVIEW',
]);

const ACTIONS_REQUIRING_POLICY = new Set([
  'RENEWAL_REVIEW',
  'PAYMENT_FOLLOW_UP',
  'DOCUMENT_REVIEW',
]);

const SOURCE_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  EMPTY: 'EMPTY',
  UNAVAILABLE: 'UNAVAILABLE',
  ERROR: 'ERROR',
});

export class PortfolioServiceError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'PortfolioServiceError';
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => {
  throw new PortfolioServiceError(code, message, details);
};

const text = value => typeof value === 'string' ? value.trim() : '';
const array = value => Array.isArray(value) ? value : [];
const required = (value, code, label) => text(value) || fail(code, `${label} es obligatorio.`);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function normalizeDate(value) {
  const normalized = required(value, 'AS_OF_DATE_REQUIRED', 'La fecha de corte');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    fail('AS_OF_DATE_INVALID', 'La fecha de corte debe usar YYYY-MM-DD.');
  }
  return normalized;
}

function normalizeTimezone(value) {
  const normalized = text(value) || 'America/Mexico_City';
  if (normalized.length > 120) fail('TIMEZONE_INVALID', 'La zona horaria no es válida.');
  return normalized;
}

function errorCode(error) {
  return text(error?.code) || text(error?.name) || 'SOURCE_READ_FAILED';
}

function hasContent(data) {
  if (Array.isArray(data)) return data.length > 0;
  if (!data || typeof data !== 'object') return data !== null && data !== undefined;
  if (Array.isArray(data.items)) return data.items.length > 0;
  if (Array.isArray(data.entries)) return data.entries.length > 0;
  return Object.keys(data).length > 0;
}

async function optionalSource(id, loader) {
  try {
    const data = await loader();
    return deepFreeze({
      id,
      status: hasContent(data) ? SOURCE_STATUS.AVAILABLE : SOURCE_STATUS.EMPTY,
      errorCode: null,
      data: data ?? null,
    });
  } catch (error) {
    return deepFreeze({
      id,
      status: SOURCE_STATUS.UNAVAILABLE,
      errorCode: errorCode(error),
      data: null,
    });
  }
}

function workspacePersonReference(workspace) {
  return text(workspace?.personReference)
    || text(workspace?.person?.personReference)
    || text(workspace?.identity?.personReference)
    || text(workspace?.identity?.reference)
    || text(workspace?.facts?.personReference);
}

function findSection(workspace, id) {
  const upper = String(id).toUpperCase();
  if (workspace?.sections && !Array.isArray(workspace.sections)) {
    return workspace.sections[upper] || workspace.sections[id] || null;
  }
  return array(workspace?.sections).find(section => String(section?.id || '').toUpperCase() === upper) || null;
}

function sectionItems(workspace, id) {
  const section = findSection(workspace, id);
  return array(section?.items || section?.records || section);
}

function policyReferenceOf(value) {
  return text(value?.policyReference)
    || text(value?.reference)
    || text(value?.policy?.policyReference)
    || text(value?.facts?.policyReference);
}

function policyPersonReferences(detail) {
  const references = new Set();
  const add = value => {
    const normalized = text(value);
    if (normalized) references.add(normalized);
  };

  array(detail?.people).forEach(person => add(person?.personReference || person?.person_reference || person?.reference));
  array(detail?.participants?.people).forEach(person => add(person?.personReference || person?.person_reference || person?.reference));
  array(detail?.personReferences).forEach(add);
  array(detail?.roles).forEach(role => add(
    role?.personReference
      || role?.participantPersonReference
      || role?.participant_person_reference
      || role?.person?.personReference
  ));
  add(detail?.personReference);
  add(detail?.facts?.personReference);
  return references;
}

function assertPolicyBelongsToPerson(detail, personReference) {
  const references = policyPersonReferences(detail);
  if (references.size === 0) {
    fail('POLICY_PERSON_LINK_UNVERIFIED', 'La Policy no contiene un vínculo verificable con la persona.');
  }
  if (!references.has(personReference)) {
    fail('POLICY_PERSON_MISMATCH', 'La Policy pertenece a otra persona.', {
      expected: personReference,
      observed: [...references],
    });
  }
}

function calendarItems(calendar, policyReference = null) {
  return array(calendar?.items).filter(item => {
    if (!policyReference) return true;
    return !text(item?.policyReference) || text(item?.policyReference) === policyReference;
  });
}

function radarItems(radar, { personReference = null, policyReference = null } = {}) {
  const items = [...array(radar?.items), ...array(radar?.focusItems)];
  const unique = new Map();
  for (const item of items) {
    const itemPerson = text(item?.personReference || item?.facts?.personReference);
    const itemPolicy = text(item?.policyReference || item?.facts?.policyReference);
    if (personReference && itemPerson && itemPerson !== personReference) continue;
    if (policyReference && itemPolicy && itemPolicy !== policyReference) continue;
    const key = text(item?.signalReference || item?.reference || item?.id)
      || `${item?.type || item?.kind || 'SIGNAL'}:${itemPolicy}:${item?.effectiveDate || item?.dueDate || ''}`;
    unique.set(key, item);
  }
  return [...unique.values()];
}

function timelineEntries(timeline, policyReference = null) {
  return array(timeline?.entries).filter(entry => {
    if (!policyReference) return true;
    const serializedReferences = [
      entry?.policyReference,
      entry?.recordReference,
      entry?.facts?.policyReference,
    ].map(text).filter(Boolean);
    return serializedReferences.length === 0 || serializedReferences.includes(policyReference);
  });
}

function latestContactAt(entries) {
  const contactEntries = entries.filter(entry => {
    const haystack = `${entry?.recordType || ''} ${entry?.title || ''} ${entry?.summary || ''}`.toUpperCase();
    return /CONTACT|CALL|MESSAGE|MEETING|APPOINTMENT|CONVERSATION|LLAM|MENSAJ|REUNI|CITA|CONVERS/.test(haystack);
  });
  return contactEntries
    .map(entry => entry?.occurredAt || entry?.effectiveAt || entry?.recordedAt)
    .filter(value => value && !Number.isNaN(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;
}

function daysBetween(dateOnly, timestamp) {
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return null;
  const end = Date.parse(`${dateOnly}T23:59:59.999Z`);
  return Math.max(0, Math.floor((end - Date.parse(timestamp)) / 86400000));
}

function signal(reference, type, severity, reason, context = {}) {
  return deepFreeze({
    reference,
    type,
    severity,
    reason,
    personReference: context.personReference || null,
    policyReference: context.policyReference || null,
    effectiveDate: context.effectiveDate || null,
    sourceAuthority: context.sourceAuthority,
    automaticAction: false,
    finalPriorityTruth: false,
  });
}

function buildServiceSignals({ personReference, calendar, radar, timeline, asOfDate }) {
  const signals = [];

  for (const item of calendarItems(calendar)) {
    const state = String(item?.state || item?.status || item?.bucket || '').toUpperCase();
    const dueDate = text(item?.dueDate || item?.expectedDate || item?.date) || null;
    const policyReference = text(item?.policyReference) || null;
    if (/OVERDUE|PAST_DUE|VENCID/.test(state)) {
      signals.push(signal(
        `payment-overdue:${policyReference || 'portfolio'}:${dueDate || 'unknown'}`,
        'PAYMENT_OVERDUE',
        'CRITICAL',
        'Existe una obligación esperada vencida que requiere revisión humana.',
        { personReference, policyReference, effectiveDate: dueDate, sourceAuthority: 'CARTERA_030D_PAYMENT_CALENDAR' },
      ));
    } else if (/DUE|UPCOMING|PRÓXIM|PROXIM/.test(state)) {
      signals.push(signal(
        `payment-due:${policyReference || 'portfolio'}:${dueDate || 'unknown'}`,
        'PAYMENT_DUE',
        'HIGH',
        'Existe una fecha de pago próxima; no implica que el pago esté pendiente o incumplido.',
        { personReference, policyReference, effectiveDate: dueDate, sourceAuthority: 'CARTERA_030D_PAYMENT_CALENDAR' },
      ));
    }
  }

  for (const item of radarItems(radar, { personReference })) {
    const kind = `${item?.type || ''} ${item?.kind || ''} ${item?.label || ''}`.toUpperCase();
    const policyReference = text(item?.policyReference || item?.facts?.policyReference) || null;
    const effectiveDate = text(item?.effectiveDate || item?.dueDate || item?.anniversaryDate || item?.renewalDate) || null;
    if (/RENEW|RENOV/.test(kind)) {
      signals.push(signal(
        `renewal:${policyReference || 'portfolio'}:${effectiveDate || 'unknown'}`,
        'RENEWAL_REVIEW',
        'HIGH',
        'La autoridad de futuro reporta una renovación que debe revisarse.',
        { personReference, policyReference, effectiveDate, sourceAuthority: 'CARTERA_050_FUTURE_RADAR' },
      ));
    } else if (/ANNIVERSARY|ANIVERS/.test(kind)) {
      signals.push(signal(
        `anniversary:${policyReference || 'portfolio'}:${effectiveDate || 'unknown'}`,
        'POLICY_ANNIVERSARY',
        'MEDIUM',
        'La autoridad de futuro reporta un aniversario de Policy.',
        { personReference, policyReference, effectiveDate, sourceAuthority: 'CARTERA_050_FUTURE_RADAR' },
      ));
    }
  }

  const contactAt = latestContactAt(timelineEntries(timeline));
  const daysSinceContact = daysBetween(asOfDate, contactAt);
  if (daysSinceContact !== null && daysSinceContact >= 90) {
    signals.push(signal(
      `contact-gap:${personReference}:${contactAt}`,
      'CLIENT_WITHOUT_RECENT_CONTACT',
      'MEDIUM',
      `No existe contacto registrado en los últimos ${daysSinceContact} días.`,
      { personReference, effectiveDate: contactAt, sourceAuthority: 'CRS_08_UNIFIED_TIMELINE' },
    ));
  }

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, INFORMATION: 3 };
  return deepFreeze(signals.sort((a, b) =>
    (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
    || String(a.effectiveDate || '').localeCompare(String(b.effectiveDate || ''))
    || a.reference.localeCompare(b.reference)
  ));
}

function sourceSummary(sources) {
  return Object.freeze(Object.fromEntries(
    Object.entries(sources).map(([key, source]) => [key, Object.freeze({
      status: source.status,
      errorCode: source.errorCode,
    })])
  ));
}

function overallStatus(sources) {
  const values = Object.values(sources);
  return values.every(source => [SOURCE_STATUS.AVAILABLE, SOURCE_STATUS.EMPTY].includes(source.status))
    ? 'READY'
    : 'PARTIAL';
}

export function createPortfolioServiceRuntime({
  personWorkspaceAuthority,
  portfolioAuthority,
  paymentCalendarAuthority,
  futureRadarAuthority,
  timelineAuthority,
  nextActionAuthority,
  complementaryQuoteAuthority = null,
} = {}) {
  async function loadClient360({ personReference, asOfDate, timezone = 'America/Mexico_City' } = {}) {
    const person = required(personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona');
    const date = normalizeDate(asOfDate);
    const zone = normalizeTimezone(timezone);

    if (!personWorkspaceAuthority?.getPersonWorkspace) {
      fail('PERSON_WORKSPACE_AUTHORITY_REQUIRED', 'CRS-09 Person Workspace no está conectado.');
    }
    const workspace = await personWorkspaceAuthority.getPersonWorkspace({ personReference: person });
    const resolvedPerson = workspacePersonReference(workspace);
    if (!resolvedPerson) fail('PERSON_WORKSPACE_IDENTITY_REQUIRED', 'Person Workspace no devolvió identidad canónica.');
    if (resolvedPerson !== person) fail('PERSON_WORKSPACE_IDENTITY_MISMATCH', 'Person Workspace devolvió otra persona.');

    const sources = {
      portfolio: await optionalSource('CARTERA_010C_PORTFOLIO', async () => {
        if (!portfolioAuthority?.loadPortfolio) fail('PORTFOLIO_AUTHORITY_REQUIRED', 'Cartera 010C no está conectada.');
        return portfolioAuthority.loadPortfolio();
      }),
      paymentCalendar: await optionalSource('CARTERA_030D_PAYMENT_CALENDAR', async () => {
        if (!paymentCalendarAuthority?.loadCalendar) fail('PAYMENT_CALENDAR_AUTHORITY_REQUIRED', 'Cartera 030D no está conectada.');
        return paymentCalendarAuthority.loadCalendar({ asOfDate: date, timezone: zone });
      }),
      futureRadar: await optionalSource('CARTERA_050_FUTURE_RADAR', async () => {
        if (!futureRadarAuthority?.loadFutureRadar) fail('FUTURE_RADAR_AUTHORITY_REQUIRED', 'Cartera 050 no está conectada.');
        return futureRadarAuthority.loadFutureRadar({ asOfDate: date, timezone: zone });
      }),
      timeline: await optionalSource('CRS_08_UNIFIED_TIMELINE', async () => {
        if (!timelineAuthority?.getUnifiedPersonTimeline) fail('TIMELINE_AUTHORITY_REQUIRED', 'CRS-08 Timeline no está conectado.');
        return timelineAuthority.getUnifiedPersonTimeline({ personReference: person });
      }),
    };

    const workspacePolicies = sectionItems(workspace, 'POLICIES');
    const serviceSignals = buildServiceSignals({
      personReference: person,
      calendar: sources.paymentCalendar.data,
      radar: sources.futureRadar.data,
      timeline: sources.timeline.data,
      asOfDate: date,
    });

    return deepFreeze({
      contractType: 'ADVISOR_OS_PORTFOLIO_CLIENT_360',
      contractVersion: 'SPRINT-09-PORTFOLIO-SERVICE-001.1',
      status: overallStatus(sources),
      personReference: person,
      asOfDate: date,
      timezone: zone,
      workspace,
      policies: workspacePolicies,
      serviceSignals,
      sourceStates: sourceSummary(sources),
      unknownAsZero: false,
      automaticAction: false,
    });
  }

  async function loadPolicyServiceDetail({ personReference, policyReference, asOfDate, timezone = 'America/Mexico_City' } = {}) {
    const person = required(personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona');
    const policy = required(policyReference, 'POLICY_REFERENCE_REQUIRED', 'La Policy');
    const date = normalizeDate(asOfDate);
    const zone = normalizeTimezone(timezone);
    if (!portfolioAuthority?.loadPolicyDetail) {
      fail('POLICY_DETAIL_AUTHORITY_REQUIRED', 'Cartera 010C Policy Detail no está conectado.');
    }

    const detail = await portfolioAuthority.loadPolicyDetail(policy);
    if (policyReferenceOf(detail) && policyReferenceOf(detail) !== policy) {
      fail('POLICY_DETAIL_REFERENCE_MISMATCH', 'Policy Detail devolvió otra Policy.');
    }
    assertPolicyBelongsToPerson(detail, person);

    const sources = {
      paymentCalendar: await optionalSource('CARTERA_030D_PAYMENT_CALENDAR', async () => {
        if (!paymentCalendarAuthority?.loadCalendar) fail('PAYMENT_CALENDAR_AUTHORITY_REQUIRED', 'Cartera 030D no está conectada.');
        return paymentCalendarAuthority.loadCalendar({ policyReference: policy, asOfDate: date, timezone: zone });
      }),
      futureRadar: await optionalSource('CARTERA_050_FUTURE_RADAR', async () => {
        if (!futureRadarAuthority?.loadFutureRadar) fail('FUTURE_RADAR_AUTHORITY_REQUIRED', 'Cartera 050 no está conectada.');
        return futureRadarAuthority.loadFutureRadar({ asOfDate: date, timezone: zone });
      }),
      timeline: await optionalSource('CRS_08_UNIFIED_TIMELINE', async () => {
        if (!timelineAuthority?.getUnifiedPersonTimeline) fail('TIMELINE_AUTHORITY_REQUIRED', 'CRS-08 Timeline no está conectado.');
        return timelineAuthority.getUnifiedPersonTimeline({ personReference: person });
      }),
    };

    const filteredCalendar = sources.paymentCalendar.data
      ? deepFreeze({ ...sources.paymentCalendar.data, items: calendarItems(sources.paymentCalendar.data, policy) })
      : null;
    const filteredRadar = sources.futureRadar.data
      ? deepFreeze({ items: radarItems(sources.futureRadar.data, { personReference: person, policyReference: policy }) })
      : null;
    const filteredTimeline = sources.timeline.data
      ? deepFreeze({ entries: timelineEntries(sources.timeline.data, policy) })
      : null;
    const serviceSignals = buildServiceSignals({
      personReference: person,
      calendar: filteredCalendar,
      radar: filteredRadar,
      timeline: filteredTimeline,
      asOfDate: date,
    });

    return deepFreeze({
      contractType: 'ADVISOR_OS_PORTFOLIO_POLICY_SERVICE_DETAIL',
      contractVersion: 'SPRINT-09-PORTFOLIO-SERVICE-001.1',
      status: overallStatus(sources),
      personReference: person,
      policyReference: policy,
      asOfDate: date,
      timezone: zone,
      policyDetail: detail,
      paymentCalendar: filteredCalendar,
      futureSignals: filteredRadar?.items || [],
      serviceHistory: filteredTimeline?.entries || [],
      serviceSignals,
      sourceStates: sourceSummary(sources),
      unknownAsZero: false,
      automaticAction: false,
    });
  }

  function prepareServiceAction(input = {}) {
    const actionType = required(input.actionType, 'SERVICE_ACTION_TYPE_REQUIRED', 'El tipo de servicio').toUpperCase();
    if (!SERVICE_ACTION_TYPES.includes(actionType)) {
      fail('SERVICE_ACTION_TYPE_INVALID', 'El tipo de servicio no está permitido.', { actionType });
    }
    const personReference = required(input.personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona');
    const policyReference = text(input.policyReference) || null;
    if (ACTIONS_REQUIRING_POLICY.has(actionType) && !policyReference) {
      fail('SERVICE_ACTION_POLICY_REQUIRED', 'Esta acción requiere una Policy.');
    }
    const dueAt = required(input.dueAt, 'SERVICE_ACTION_DUE_AT_REQUIRED', 'La fecha de servicio');
    if (Number.isNaN(Date.parse(dueAt))) fail('SERVICE_ACTION_DUE_AT_INVALID', 'La fecha de servicio no es válida.');

    return deepFreeze({
      status: 'PREVIEW_REQUIRED',
      actionType,
      personReference,
      policyReference,
      dueAt: new Date(dueAt).toISOString(),
      note: text(input.note) || null,
      sourceSignalReference: text(input.sourceSignalReference) || null,
      authority: 'NFAST_09_DUE_ACTION_RUNTIME',
      directWrite: false,
      confirmed: false,
    });
  }

  async function confirmServiceAction({ preview, confirmedByAdvisor, confirmationReference } = {}) {
    if (preview?.status !== 'PREVIEW_REQUIRED') {
      fail('SERVICE_ACTION_PREVIEW_REQUIRED', 'Se requiere un preview de servicio.');
    }
    if (confirmedByAdvisor !== true || !text(confirmationReference)) {
      fail('SERVICE_ACTION_CONFIRMATION_REQUIRED', 'La acción requiere confirmación humana explícita.');
    }
    if (!nextActionAuthority?.schedulePortfolioServiceAction) {
      fail('NEXT_ACTION_AUTHORITY_REQUIRED', 'Next Action no está conectado.');
    }
    const receipt = await nextActionAuthority.schedulePortfolioServiceAction({
      actionType: preview.actionType,
      personReference: preview.personReference,
      policyReference: preview.policyReference,
      dueAt: preview.dueAt,
      note: preview.note,
      sourceSignalReference: preview.sourceSignalReference,
      confirmationReference: text(confirmationReference),
    });
    if (!text(receipt?.mutationId)) {
      fail('SERVICE_ACTION_RECEIPT_REQUIRED', 'Next Action no devolvió un recibo verificable.');
    }
    if (receipt.personReference && receipt.personReference !== preview.personReference) {
      fail('SERVICE_ACTION_PERSON_MISMATCH', 'El recibo pertenece a otra persona.');
    }
    if (receipt.policyReference && receipt.policyReference !== preview.policyReference) {
      fail('SERVICE_ACTION_POLICY_MISMATCH', 'El recibo pertenece a otra Policy.');
    }
    return deepFreeze({
      status: 'SERVICE_ACTION_SCHEDULED',
      receipt,
      personReference: preview.personReference,
      policyReference: preview.policyReference,
      actionType: preview.actionType,
    });
  }

  async function prepareComplementaryQuoteEntry(input = {}) {
    const personReference = required(input.personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona');
    const policyReference = required(input.policyReference, 'POLICY_REFERENCE_REQUIRED', 'La Policy');
    const productReference = required(input.productReference, 'PRODUCT_REFERENCE_REQUIRED', 'El producto complementario');
    const correlationId = required(input.correlationId, 'CORRELATION_ID_REQUIRED', 'La correlación');

    let authorityPreview = null;
    if (complementaryQuoteAuthority?.prepareComplementaryQuoteEntry) {
      authorityPreview = await complementaryQuoteAuthority.prepareComplementaryQuoteEntry({
        personReference,
        policyReference,
        productReference,
        correlationId,
      });
      if (authorityPreview?.directWrite === true || authorityPreview?.status === 'EXECUTED') {
        fail('COMPLEMENTARY_QUOTE_AUTONOMOUS_WRITE_REJECTED', 'La entrada complementaria no puede ejecutar una cotización.');
      }
    }

    const params = new URLSearchParams({
      nav: 'cotizaciones',
      person: personReference,
      policy: policyReference,
      product: productReference,
      correlation: correlationId,
      mode: 'complementary',
    });
    return deepFreeze({
      status: 'QUOTE_ENTRY_READY',
      personReference,
      policyReference,
      productReference,
      correlationId,
      deepLink: `?${params.toString()}`,
      authorityPreview,
      quoteAuthority: 'QUOTE_LIFECYCLE_AUTHORITY',
      quotePreviewRequired: true,
      directWrite: false,
    });
  }

  function toContextualSignals(snapshot) {
    const signals = array(snapshot?.serviceSignals).map(item => deepFreeze({
      signalId: item.reference,
      type: item.type,
      severity: item.severity,
      personReference: item.personReference,
      policyReference: item.policyReference,
      effectiveDate: item.effectiveDate,
      sourceAuthority: item.sourceAuthority,
      draftOnly: true,
      automaticAction: false,
    }));
    return deepFreeze(signals);
  }

  return Object.freeze({
    loadClient360,
    loadPolicyServiceDetail,
    prepareServiceAction,
    confirmServiceAction,
    prepareComplementaryQuoteEntry,
    toContextualSignals,
    diagnostics: () => deepFreeze({
      client360Authority: 'CRS_09_PERSON_WORKSPACE',
      policyAuthority: 'CARTERA_010C_CANONICAL_PORTFOLIO',
      paymentAuthority: 'CARTERA_030D_PAYMENT_CALENDAR',
      futureAuthority: 'CARTERA_050_FUTURE_RADAR',
      timelineAuthority: 'CRS_08_UNIFIED_TIMELINE',
      serviceActionAuthority: 'NFAST_09_DUE_ACTION_RUNTIME',
      secondPersonStore: false,
      secondPolicyStore: false,
      secondServiceLedger: false,
      directDatabaseWrite: false,
      automaticPolicyMutation: false,
      automaticContact: false,
      unknownAsZero: false,
    }),
  });
}

export { SERVICE_ACTION_TYPES, SOURCE_STATUS };
