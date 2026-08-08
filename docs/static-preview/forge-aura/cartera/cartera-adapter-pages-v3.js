import { createCarteraAdapter as createTransportAdapter } from './cartera-adapter-pages-v2.js?base=aura-cartera-pdf-idempotency-004';

const ADMIT_RPC = 'forge_cartera020b_admit_evidence';

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function attemptToken() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function clientWithAdmissionAttemptIdempotency(client) {
  return new Proxy(client, {
    get(target, property) {
      if (property !== 'rpc') return bindValue(target, property);

      return async (name, args = {}, options) => {
        if (name !== ADMIT_RPC) return target.rpc(name, args, options);

        const command = args?.p_command;
        if (!command || typeof command !== 'object') return target.rpc(name, args, options);

        const baseKey = String(command.idempotencyKey || '').trim();
        const idempotencyKey = `${baseKey}:${attemptToken()}`.slice(0, 160);

        return target.rpc(name, {
          ...args,
          p_command: {
            ...command,
            idempotencyKey,
          },
        }, options);
      };
    },
  });
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');

  return createTransportAdapter({
    client: clientWithAdmissionAttemptIdempotency(client),
    windowRef,
  });
}
