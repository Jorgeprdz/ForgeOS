const NAVIGATION_COMMANDS = [
  ['open-dashboard', 'Ir a Inicio', '/dashboard', ['inicio', 'home', 'dashboard'], 'dashboard'],
  ['open-pipeline', 'Abrir Pipeline', '/pipeline', ['pipeline', 'prospectos', 'oportunidades'], 'advisor-sales-pipeline'],
  ['open-prospeccion', 'Abrir Prospectos', '/prospeccion', ['prospeccion', 'prospectos', 'contactos'], 'prospeccion'],
  ['open-referidos', 'Abrir Referidos', '/referidos', ['referidos', 'recomendaciones'], 'referidos'],
  ['open-actividad', 'Abrir Actividad', '/actividad', ['actividad', 'puntos', 'productividad'], 'actividad'],
  ['open-cartera', 'Abrir Cartera', '/cartera', ['cartera', 'clientes', 'polizas'], 'cartera'],
  ['open-comisiones', 'Abrir Comisiones', '/comisiones', ['comisiones', 'compensacion', 'ingresos'], 'comisiones'],
];

const navigationCommands = NAVIGATION_COMMANDS.map(([
  id,
  label,
  command,
  keywords,
  route,
]) => Object.freeze({
  id,
  label,
  command,
  aliases: Object.freeze([command]),
  keywords: Object.freeze(keywords),
  intent: 'NAVIGATION',
  domain: 'platform',
  handlerId: 'navigate-route',
  requiresContext: Object.freeze([]),
  requiresConfirmation: false,
  availability: 'enabled',
  source: 'core',
  payload: Object.freeze({ route }),
}));

const writeCommands = [Object.freeze({
  id: 'record-follow-up',
  label: 'Registrar seguimiento',
  command: '/seguimiento',
  aliases: Object.freeze(['/seguimiento', '/follow-up']),
  keywords: Object.freeze(['seguimiento', 'nota', 'contacto', 'resultado']),
  intent: 'WRITE',
  domain: 'person',
  handlerId: 'person-follow-up-authority',
  requiresContext: Object.freeze(['personReference']),
  requiresConfirmation: true,
  availability: 'enabled',
  source: 'core',
  payload: Object.freeze({ action: 'RECORD_FOLLOW_UP' }),
})];

export const COMMANDS = Object.freeze([...navigationCommands, ...writeCommands]);

export function getCommandById(commandId) {
  return COMMANDS.find(command => command.id === commandId) || null;
}
