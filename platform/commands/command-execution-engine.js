import { Navigation } from '../navigation-runtime.js';

const HANDLERS = Object.freeze({
  'navigate-route': async ({ command }) => {
    const route = command?.payload?.route;
    if (!route) return { ok: false, reason: 'MISSING_ROUTE' };

    await Navigation.navigate(route);
    return {
      ok: true,
      commandId: command.id,
      handlerId: command.handlerId,
      intent: command.intent,
      route,
    };
  },
});

export async function ejecutarComando({ command, context = {} }) {
  if (!command || command.availability !== 'enabled') {
    return { ok: false, reason: 'COMMAND_UNAVAILABLE' };
  }

  if (command.intent === 'WRITE') {
    return { ok: false, reason: 'WRITE_REQUIRES_GOVERNED_PREVIEW' };
  }

  const handler = HANDLERS[command.handlerId];
  if (!handler) {
    return { ok: false, reason: 'HANDLER_NOT_FOUND' };
  }

  return handler({ command, context });
}
