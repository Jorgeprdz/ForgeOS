import {
  getAlfredActionById,
  resolveAlfredAction,
} from './alfred-action-registry.js';

export const ALFRED_PACKET_SAFETY = Object.freeze({
  previewOnly: true,
  reviewOnly: true,
  notApproved: true,
  notSendable: true,
  finalAuthority: 'HUMAN',
  createsTruth: false,
  executesRuntime: false,
  sendsMessage: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  createsRevenue: false,
  createsCompensation: false,
  createsPayoutTruth: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
  liveSearchEnabled: false,
  providerRuntimeEnabled: false,
  requiresHumanConfirmation: true,
});

const PRODUCT_TERMS = Object.freeze([
  ['retiro', 'Retiro'],
  ['vida mujer', 'Vida Mujer'],
  ['segubeca', 'SeguBeca'],
  ['gmm', 'GMM'],
  ['gastos medicos', 'GMM'],
  ['gastos médicos', 'GMM'],
  ['ppr', 'PPR'],
  ['orvi', 'ORVI'],
  ['vida', 'Vida'],
]);

const DAYS = Object.freeze([
  'lunes',
  'martes',
  'miércoles',
  'miercoles',
  'jueves',
  'viernes',
  'sábado',
  'sabado',
  'domingo',
]);

function normalizeText(value, max = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalize(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function stableHash(value) {
  const source = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function titleCase(value) {
  return normalizeText(value, 160)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function commandRemainder(input, action) {
  const raw = normalizeText(input);
  const terms = [action?.command, ...(action?.aliases || [])]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  const normalizedRaw = normalize(raw);
  for (const term of terms) {
    const normalizedTerm = normalize(term);
    if (normalizedRaw === normalizedTerm) return '';
    if (normalizedRaw.startsWith(`${normalizedTerm} `)) {
      return raw.slice(term.length).trim();
    }
  }
  return raw.replace(/^\/[\p{L}\s]+/u, '').trim() || raw;
}

function extractProducts(text) {
  const normalized = normalize(text);
  return unique(PRODUCT_TERMS
    .filter(([term]) => normalized.includes(normalize(term)))
    .map(([, label]) => label));
}

function extractDay(text) {
  const normalized = normalize(text);
  return DAYS.find((day) => normalized.includes(normalize(day))) || '';
}

function extractTime(text) {
  const match = normalizeText(text).match(/\b(?:a las\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2] || '00'}${match[3] ? ` ${match[3].toLowerCase()}` : ''}`;
}

function extractPeople(text) {
  const source = normalizeText(text);
  const candidates = [];
  const relation = source.match(/\b(?:con|para|a|de)\s+([A-ZÁÉÍÓÚÑ][\p{L}'-]+(?:\s+[A-ZÁÉÍÓÚÑ][\p{L}'-]+){0,2})/u);
  if (relation?.[1]) candidates.push(relation[1]);
  const capitalized = source.match(/\b[A-ZÁÉÍÓÚÑ][\p{L}'-]+(?:\s+[A-ZÁÉÍÓÚÑ][\p{L}'-]+){0,2}/gu) || [];
  for (const value of capitalized) {
    if (!/^(Alfred|Forge|Hoy|Tengo|Crear|Follow|Memoria|Agenda|Cotizar|Comisiones|Bonos)$/i.test(value)) {
      candidates.push(value);
    }
  }
  return unique(candidates.map(titleCase)).slice(0, 5);
}

function extractReferral(text) {
  const source = normalizeText(text);
  const referral = source.match(/\/Referid[oa]\s+(.+?)(?:\s+es\s+referid[oa]\s+de\s+|\s+viene\s+de\s+|$)/i);
  const sourceMatch = source.match(/(?:referid[oa]\s+de|viene\s+de)\s+(.+?)(?:,|\.|$)/i);
  const relation = source.match(/(?:compañero|compañera|amigo|amiga|familiar|cliente|vecino|vecina)(?:\s+del?\s+[\p{L}\s]+)?/iu);
  return {
    referralName: referral?.[1] ? titleCase(referral[1]) : '',
    sourceName: sourceMatch?.[1] ? titleCase(sourceMatch[1]) : '',
    relationship: relation?.[0] ? normalizeText(relation[0], 120) : '',
  };
}

function extractSignals(text) {
  const normalized = normalize(text);
  const signals = [];
  if (/interesa|intereso|interesó/.test(normalized)) signals.push('interest_signal');
  if (/esposa|esposo|novio|novia|pareja/.test(normalized)) signals.push('relationship_context');
  if (/seguim|proxima semana|próxima semana|martes|viernes/.test(normalized)) signals.push('follow_up_signal');
  if (/cita|llamada|videollamada/.test(normalized)) signals.push('appointment_signal');
  if (/referid/.test(normalized)) signals.push('referral_signal');
  return unique(signals);
}

function packetTitle(packetType) {
  return {
    MEMORY_REVIEW_PACKET: 'Memoria preparada para revisión',
    REFERRAL_CAPTURE_REVIEW_PACKET: 'Referido preparado para revisión',
    CALENDAR_EVENT_DRAFT_REVIEW_PACKET: 'Borrador de cita preparado',
    PRODUCT_INTELLIGENCE_REVIEW_PACKET: 'Preparación comercial lista para revisar',
    MESSAGE_DRAFT_REVIEW_PACKET: 'Mensaje preparado para revisión',
    FOLLOW_UP_REVIEW_PACKET: 'Seguimiento preparado para revisión',
    UNIVERSAL_INDEX_REVIEW_PACKET: 'Contexto preparado para revisión',
    CHATBOT_CONTEXT_REVIEW_PACKET: 'Contexto de conversación preparado',
  }[packetType] || 'Acción preparada para revisión';
}

function proposedAction(action) {
  return Object.freeze({
    actionId: action?.actionId || 'open.review.context',
    actionType: action?.kind || 'REVIEW_PACKET',
    label: action?.label || 'Revisar contexto',
    status: 'PREPARED_FOR_HUMAN_REVIEW',
    executionState: 'NOT_EXECUTED',
    ...ALFRED_PACKET_SAFETY,
  });
}

function buildFacts({ people, products, day, time, referral, signals, entityCandidates, query }) {
  const facts = [];
  for (const person of people) facts.push({ factType: 'person_candidate', value: person, reviewRequired: true });
  for (const product of products) facts.push({ factType: 'product_interest', value: product, reviewRequired: true });
  if (day) facts.push({ factType: 'calendar_day_candidate', value: day, reviewRequired: true });
  if (time) facts.push({ factType: 'calendar_time_candidate', value: time, reviewRequired: true });
  if (referral.referralName) facts.push({ factType: 'referral_candidate', value: referral.referralName, reviewRequired: true });
  if (referral.sourceName) facts.push({ factType: 'referral_source', value: referral.sourceName, reviewRequired: true });
  if (referral.relationship) facts.push({ factType: 'referral_relationship', value: referral.relationship, reviewRequired: true });
  for (const signal of signals) facts.push({ factType: 'context_signal', value: signal, reviewRequired: true });
  for (const entity of entityCandidates) {
    facts.push({
      factType: 'indexed_entity_candidate',
      value: entity.label,
      entityId: entity.id,
      entityType: entity.type,
      reviewRequired: true,
    });
  }
  if (!facts.length && query) facts.push({ factType: 'unstructured_query', value: query, reviewRequired: true });
  return facts;
}

function buildUncertainty({ packetType, people, products, day, time, referral, entityCandidates }) {
  const uncertainty = [];
  if (!people.length && !entityCandidates.length && packetType !== 'CHATBOT_CONTEXT_REVIEW_PACKET') {
    uncertainty.push('La persona o entidad principal todavía no está confirmada.');
  }
  if (packetType === 'CALENDAR_EVENT_DRAFT_REVIEW_PACKET' && !day) {
    uncertainty.push('Falta confirmar la fecha exacta.');
  }
  if (packetType === 'CALENDAR_EVENT_DRAFT_REVIEW_PACKET' && !time) {
    uncertainty.push('Falta confirmar la hora exacta.');
  }
  if (packetType === 'PRODUCT_INTELLIGENCE_REVIEW_PACKET' && !products.length) {
    uncertainty.push('Falta confirmar el producto o necesidad que debe revisarse.');
  }
  if (packetType === 'REFERRAL_CAPTURE_REVIEW_PACKET' && !referral.sourceName) {
    uncertainty.push('Falta confirmar quién recomendó al referido.');
  }
  if (entityCandidates.length > 1) {
    uncertainty.push('Hay más de una coincidencia; elige la entidad correcta.');
  }
  if (!uncertainty.length) uncertainty.push('Los datos extraídos siguen siendo candidatos hasta tu revisión.');
  return uncertainty;
}

function reviewQuestions(packetType) {
  return {
    MEMORY_REVIEW_PACKET: ['¿La memoria refleja correctamente lo que ocurrió?', '¿Debe prepararse un seguimiento?'],
    REFERRAL_CAPTURE_REVIEW_PACKET: ['¿El nombre, la fuente y la relación son correctos?', '¿Existe contexto suficiente para preparar el primer contacto?'],
    CALENDAR_EVENT_DRAFT_REVIEW_PACKET: ['¿Cuál es la fecha, hora, duración y objetivo exactos?', '¿A quién se invitaría?'],
    PRODUCT_INTELLIGENCE_REVIEW_PACKET: ['¿Qué necesidad y producto deben revisarse?', '¿Qué información falta antes de cotizar o presentar?'],
    MESSAGE_DRAFT_REVIEW_PACKET: ['¿El destinatario y el tono son correctos?', '¿Qué canal se usaría después de aprobar?'],
    FOLLOW_UP_REVIEW_PACKET: ['¿Cuál es el objetivo, momento y canal del seguimiento?', '¿La persona correcta está seleccionada?'],
    UNIVERSAL_INDEX_REVIEW_PACKET: ['¿La entidad o contexto encontrado es el correcto?', '¿Qué acción debe prepararse después?'],
    CHATBOT_CONTEXT_REVIEW_PACKET: ['¿Deseas entrar explícitamente al modo conversacional?'],
  }[packetType] || ['¿El contexto interpretado es correcto?'];
}

export function buildAlfredReviewPacket({
  input,
  actionId = '',
  routeId = 'inicio',
  routeLabel = '',
  entityCandidates = [],
} = {}) {
  const rawInput = normalizeText(input);
  const action = getAlfredActionById(actionId)
    || resolveAlfredAction(rawInput, { routeId })
    || null;
  const query = commandRemainder(rawInput, action);
  const packetType = action?.packetType || 'UNIVERSAL_INDEX_REVIEW_PACKET';
  const people = extractPeople(query);
  const products = extractProducts(query);
  const day = extractDay(query);
  const time = extractTime(query);
  const referral = extractReferral(rawInput);
  const signals = extractSignals(query);
  const normalizedEntities = Array.isArray(entityCandidates)
    ? entityCandidates.slice(0, 8).map((entity) => ({
        id: normalizeText(entity?.id, 180),
        type: normalizeText(entity?.type, 40),
        label: normalizeText(entity?.label, 180),
        secondaryLabel: normalizeText(entity?.secondaryLabel, 180),
        route: normalizeText(entity?.route, 80),
        params: { ...(entity?.params || {}) },
        locator: entity?.locator ? { ...entity.locator } : null,
      })).filter((entity) => entity.id && entity.label)
    : [];
  const primaryEntity = referral.referralName
    || normalizedEntities[0]?.label
    || people[0]
    || 'REQUIRES_HUMAN_REVIEW';
  const extractedFacts = buildFacts({
    people,
    products,
    day,
    time,
    referral,
    signals,
    entityCandidates: normalizedEntities,
    query,
  });
  const uncertainty = buildUncertainty({
    packetType,
    people,
    products,
    day,
    time,
    referral,
    entityCandidates: normalizedEntities,
  });
  const packetId = `ALFRED_REVIEW_PACKET_${stableHash([
    packetType,
    action?.actionId || 'unresolved',
    routeId,
    rawInput,
  ].join('|'))}`;

  return Object.freeze({
    packetId,
    packetType,
    title: packetTitle(packetType),
    source: 'ALFRED_REVIEW_ACTION_PACKET_BROWSER_PROJECTION',
    sourcePhase: '054M_ALFRED_REVIEW_ACTION_PACKET_READ_MODEL_IMPLEMENTATION',
    sourceCommand: action?.command || rawInput.split(' ')[0] || '/Index',
    actionId: action?.actionId || null,
    rawInput,
    query,
    intentFamily: action?.actionId || 'universal_index_search',
    routeFamily: action?.routeFamily || 'ALFRED_INDEX',
    routeContext: {
      routeId: normalizeText(routeId, 80),
      routeLabel: normalizeText(routeLabel, 120),
    },
    primaryEntity,
    relatedEntities: unique([...people.slice(1), referral.sourceName]).map((value) => ({
      type: 'related_entity_candidate',
      value,
      reviewRequired: true,
    })),
    productInterests: products,
    calendarCandidate: {
      day,
      time,
      eventCandidate: packetType === 'CALENDAR_EVENT_DRAFT_REVIEW_PACKET' || Boolean(day || time),
      reviewRequired: true,
      createsCalendarEvent: false,
    },
    referralCandidate: {
      ...referral,
      reviewRequired: true,
      writesCrm: false,
    },
    messageDraftCandidate: {
      rawText: packetType === 'MESSAGE_DRAFT_REVIEW_PACKET' ? query : '',
      reviewRequired: packetType === 'MESSAGE_DRAFT_REVIEW_PACKET',
      notSendable: true,
      sendsMessage: false,
    },
    followUpCandidate: {
      reviewRequired: packetType === 'FOLLOW_UP_REVIEW_PACKET' || signals.includes('follow_up_signal'),
      createsTask: false,
    },
    entityCandidates: normalizedEntities,
    extractedFacts,
    uncertainty,
    reviewSummary: `${packetTitle(packetType)}${primaryEntity === 'REQUIRES_HUMAN_REVIEW' ? '' : ` para ${primaryEntity}`}. Nada fue guardado, enviado, agendado ni ejecutado.`,
    proposedActions: [proposedAction(action)],
    forbiddenActions: Object.freeze([
      'SEND_MESSAGE',
      'CREATE_CALENDAR_EVENT',
      'WRITE_CRM',
      'CREATE_TASK',
      'APPROVE_QUOTE',
      'APPROVE_PROPOSAL',
      'CREATE_REVENUE_TRUTH',
      'CREATE_COMMISSION_TRUTH',
      'CREATE_PAYOUT_TRUTH',
      'CALL_PROVIDER_RUNTIME',
    ]),
    humanReviewQuestions: reviewQuestions(packetType),
    confirmationRequired: true,
    safety: ALFRED_PACKET_SAFETY,
    finalAuthority: 'HUMAN',
  });
}
