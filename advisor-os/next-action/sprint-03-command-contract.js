export const SPRINT_03_READ_COMMANDS = Object.freeze([
  Object.freeze({ id: 'agenda-today', phrase: '¿Qué tengo hoy?', intent: 'READ', handlerId: 'agenda-read-authority', query: 'TODAY' }),
  Object.freeze({ id: 'agenda-overdue', phrase: 'Muéstrame vencidos', intent: 'READ', handlerId: 'agenda-read-authority', query: 'OVERDUE' }),
  Object.freeze({ id: 'agenda-week', phrase: '¿Qué tengo esta semana?', intent: 'READ', handlerId: 'agenda-read-authority', query: 'UPCOMING_7_DAYS' }),
]);

export const SPRINT_03_WRITE_COMMANDS = Object.freeze([
  Object.freeze({ id: 'action-reschedule', phrase: 'Reagenda este seguimiento para mañana a las 6', intent: 'WRITE', operation: 'RESCHEDULE', requiresConfirmation: true }),
  Object.freeze({ id: 'action-complete', phrase: 'Marca esta acción como realizada', intent: 'WRITE', operation: 'COMPLETE', requiresConfirmation: true }),
  Object.freeze({ id: 'case-waiting', phrase: 'Estoy esperando respuesta del cliente', intent: 'WRITE', operation: 'MARK_WAITING', requiresConfirmation: true }),
  Object.freeze({ id: 'case-close', phrase: 'Cierra este caso', intent: 'WRITE', operation: 'CLOSE_CASE', requiresConfirmation: true }),
]);

export function createAgendaReadAuthority({ readModelProvider }) {
  if (typeof readModelProvider !== 'function') throw new TypeError('AGENDA_READ_MODEL_PROVIDER_REQUIRED');
  return Object.freeze({
    handlerId: 'agenda-read-authority',
    async execute({ command }) {
      const model = await readModelProvider();
      const section = model.sections.find(item => item.id === command.query);
      return Object.freeze({ ok: true, source: 'AGENDA_READ_MODEL', freshness: model.generatedAt, section: section || null });
    },
  });
}
