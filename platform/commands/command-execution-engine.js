import { Navigation } from '../navigation-runtime.js';
import {
  cancelWritePreview,
  confirmWritePreview,
  prepareWritePreview,
} from './write-preview-engine.js';

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

export async function ejecutarComando({ command, context = {}, input = {} }) {
  if (!command || command.availability !== 'enabled') {
    return { ok: false, reason: 'COMMAND_UNAVAILABLE' };
  }

  if (command.intent === 'WRITE') {
    return prepareWritePreview({ command, context, input });
  }

  const handler = HANDLERS[command.handlerId];
  if (!handler) {
    return { ok: false, reason: 'HANDLER_NOT_FOUND' };
  }

  return handler({ command, context });
}

export async function confirmarComandoEscritura({ previewId, confirmationToken }) {
  return confirmWritePreview({ previewId, confirmationToken });
}

export function cancelarComandoEscritura({ previewId }) {
  return cancelWritePreview({ previewId });
}
