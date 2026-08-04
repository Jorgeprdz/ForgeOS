const ALL_ROUTES = Object.freeze([
  'inicio',
  'pipeline',
  'actividad',
  'quotes',
  'cartera',
  'comisiones',
  'persona',
]);

const SAFE_PREVIEW = Object.freeze({
  previewOnly: true,
  reviewOnly: true,
  requiresHumanApproval: true,
  executesRuntime: false,
  createsTruth: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  sendsMessage: false,
});

function action(definition) {
  return Object.freeze({
    availability: 'enabled',
    source: 'core',
    routeIds: ALL_ROUTES,
    aliases: Object.freeze([]),
    keywords: Object.freeze([]),
    ...SAFE_PREVIEW,
    ...definition,
    routeIds: Object.freeze([...(definition.routeIds || ALL_ROUTES)]),
    aliases: Object.freeze([...(definition.aliases || [])]),
    keywords: Object.freeze([...(definition.keywords || [])]),
  });
}

export const ALFRED_ACTIONS = Object.freeze([
  action({
    actionId: 'command.quick_actions',
    label: 'Ver acciones disponibles',
    command: '/quick actions',
    aliases: ['/quick', '/acciones', 'acciones rápidas', 'acciones rapidas'],
    keywords: ['acciones', 'quick', 'comandos', 'disponible'],
    kind: 'CATALOG',
    packetType: null,
    order: 10,
  }),
  action({
    actionId: 'report.prepare_preview',
    label: 'Preparar resumen y prioridad',
    command: '/Resumen',
    aliases: ['/resumen', 'prioriza hoy', 'qué hago hoy', 'que hago hoy'],
    keywords: ['resumen', 'prioridad', 'hoy', 'riesgo', 'meta'],
    kind: 'REVIEW_PACKET',
    packetType: 'UNIVERSAL_INDEX_REVIEW_PACKET',
    routeFamily: 'ALFRED_ACTION_PREP',
    routeIds: ['inicio', 'actividad', 'comisiones'],
    order: 20,
  }),
  action({
    actionId: 'opportunity.review',
    label: 'Revisar oportunidad prioritaria',
    command: '/Revisar oportunidad',
    aliases: ['/revisar', 'revisar oportunidad', 'revisar prioridad'],
    keywords: ['oportunidad', 'prioridad', 'riesgo', 'revisar'],
    kind: 'REVIEW_PACKET',
    packetType: 'UNIVERSAL_INDEX_REVIEW_PACKET',
    routeFamily: 'ALFRED_INDEX',
    routeIds: ['inicio', 'pipeline', 'persona'],
    order: 30,
  }),
  action({
    actionId: 'client.follow_preview',
    label: 'Preparar seguimiento',
    command: '/Follow',
    aliases: ['/follow', '/seguimiento', 'preparar seguimiento', 'seguimiento'],
    keywords: ['follow', 'seguimiento', 'contacto', 'próxima acción', 'proxima accion'],
    kind: 'REVIEW_PACKET',
    packetType: 'FOLLOW_UP_REVIEW_PACKET',
    routeFamily: 'ALFRED_FOLLOW_UP_PREP',
    routeIds: ['inicio', 'pipeline', 'cartera', 'persona'],
    order: 40,
  }),
  action({
    actionId: 'quote.prepare_preview',
    label: 'Preparar cotización',
    command: '/Cotizar',
    aliases: ['/cotizar', '/cotiza', 'preparar cotización', 'preparar cotizacion'],
    keywords: ['cotizar', 'cotización', 'cotizacion', 'producto', 'propuesta'],
    kind: 'REVIEW_PACKET',
    packetType: 'PRODUCT_INTELLIGENCE_REVIEW_PACKET',
    routeFamily: 'ALFRED_PRODUCT_INTELLIGENCE',
    routeIds: ['pipeline', 'quotes', 'cartera', 'persona'],
    order: 50,
  }),
  action({
    actionId: 'record.open_preview',
    label: 'Buscar persona, póliza o cotización',
    command: '/Buscar',
    aliases: ['/buscar', '/index', 'buscar persona', 'abrir detalle'],
    keywords: ['buscar', 'persona', 'póliza', 'poliza', 'cotización', 'detalle'],
    kind: 'ENTITY_SEARCH',
    packetType: 'UNIVERSAL_INDEX_REVIEW_PACKET',
    routeFamily: 'ALFRED_INDEX',
    routeIds: ALL_ROUTES,
    order: 60,
  }),
  action({
    actionId: 'memory.prepare_review',
    label: 'Registrar memoria',
    command: '/Memoria',
    aliases: ['/memoria', '/registro', '/bitácora', '/bitacora'],
    keywords: ['memoria', 'registro', 'nota', 'reunión', 'reunion'],
    kind: 'REVIEW_PACKET',
    packetType: 'MEMORY_REVIEW_PACKET',
    routeFamily: 'ALFRED_MEMORY',
    routeIds: ['pipeline', 'cartera', 'persona'],
    order: 70,
  }),
  action({
    actionId: 'referral.prepare_review',
    label: 'Capturar referido',
    command: '/Referido',
    aliases: ['/referido', '/referida'],
    keywords: ['referido', 'referida', 'recomendación', 'recomendacion'],
    kind: 'REVIEW_PACKET',
    packetType: 'REFERRAL_CAPTURE_REVIEW_PACKET',
    routeFamily: 'ALFRED_REFERRAL_CAPTURE',
    routeIds: ['pipeline', 'cartera', 'persona'],
    order: 80,
  }),
  action({
    actionId: 'calendar.prepare_review',
    label: 'Preparar cita',
    command: '/Agenda',
    aliases: ['/agenda', '/crear evento', '/evento', '/cita'],
    keywords: ['agenda', 'evento', 'cita', 'calendario'],
    kind: 'REVIEW_PACKET',
    packetType: 'CALENDAR_EVENT_DRAFT_REVIEW_PACKET',
    routeFamily: 'ALFRED_CALENDAR_PREP',
    routeIds: ['inicio', 'pipeline', 'persona'],
    order: 90,
  }),
  action({
    actionId: 'message.prepare_review',
    label: 'Preparar mensaje',
    command: '/Mejora este mensaje',
    aliases: ['/mejora este mensaje', '/mensaje', '/mejorar mensaje'],
    keywords: ['mensaje', 'whatsapp', 'redactar', 'mejorar'],
    kind: 'REVIEW_PACKET',
    packetType: 'MESSAGE_DRAFT_REVIEW_PACKET',
    routeFamily: 'ALFRED_MESSAGE_DRAFT',
    routeIds: ['pipeline', 'cartera', 'persona'],
    order: 100,
  }),
  action({
    actionId: 'product.presentation_review',
    label: 'Preparar presentación',
    command: '/Presentación',
    aliases: ['/presentación', '/presentacion', '/propuesta', '/proyectar'],
    keywords: ['presentación', 'presentacion', 'propuesta', 'proyección', 'proyeccion'],
    kind: 'REVIEW_PACKET',
    packetType: 'PRODUCT_INTELLIGENCE_REVIEW_PACKET',
    routeFamily: 'ALFRED_PRODUCT_INTELLIGENCE',
    routeIds: ['quotes', 'persona'],
    order: 110,
  }),
  action({
    actionId: 'compensation.preview',
    label: 'Revisar comisiones y bonos',
    command: '/Comisiones',
    aliases: ['/comisiones', '/bonos', '/comision', '/bono'],
    keywords: ['comisiones', 'bonos', 'compensación', 'compensacion'],
    kind: 'REVIEW_PACKET',
    packetType: 'PRODUCT_INTELLIGENCE_REVIEW_PACKET',
    routeFamily: 'ALFRED_PRODUCT_INTELLIGENCE',
    routeIds: ['inicio', 'comisiones'],
    order: 120,
  }),
  action({
    actionId: 'chatbot.open',
    label: 'Abrir conversación con IA',
    command: '/Chatbot',
    aliases: ['/chatbot', '/chat'],
    keywords: ['chatbot', 'chat', 'ia', 'conversación', 'conversacion'],
    kind: 'CHATBOT',
    packetType: 'CHATBOT_CONTEXT_REVIEW_PACKET',
    routeFamily: 'ALFRED_CHATBOT_ENTRY',
    routeIds: ALL_ROUTES,
    order: 999,
  }),
]);

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizedRoute(routeId) {
  const route = normalize(routeId);
  if (route === 'cotizaciones') return 'quotes';
  if (route === 'dashboard') return 'inicio';
  return route || 'inicio';
}

function actionTerms(item) {
  return [item.command, item.label, ...item.aliases, ...item.keywords]
    .map(normalize)
    .filter(Boolean);
}

export function getAlfredActionById(actionId) {
  return ALFRED_ACTIONS.find((item) => item.actionId === actionId) || null;
}

export function getAvailableAlfredActions({ routeId = 'inicio', capabilities = {} } = {}) {
  const route = normalizedRoute(routeId);
  return ALFRED_ACTIONS
    .filter((item) => item.availability === 'enabled')
    .filter((item) => item.routeIds.includes(route))
    .filter((item) => capabilities[item.actionId] !== false)
    .sort((left, right) => left.order - right.order);
}

export function searchAlfredActions(query, options = {}) {
  const normalizedQuery = normalize(query).replace(/^\//, '');
  const available = getAvailableAlfredActions(options);
  if (!normalizedQuery) return available;
  return available.filter((item) =>
    actionTerms(item).some((term) => term.replace(/^\//, '').includes(normalizedQuery)),
  );
}

export function resolveAlfredAction(input, options = {}) {
  const normalizedInput = normalize(input);
  if (!normalizedInput) return null;
  const available = getAvailableAlfredActions(options);
  const ordered = [...available].sort((left, right) => {
    const leftLength = Math.max(...actionTerms(left).map((term) => term.length));
    const rightLength = Math.max(...actionTerms(right).map((term) => term.length));
    return rightLength - leftLength;
  });
  for (const item of ordered) {
    for (const term of actionTerms(item)) {
      if (normalizedInput === term || normalizedInput.startsWith(`${term} `)) return item;
    }
  }
  return null;
}
