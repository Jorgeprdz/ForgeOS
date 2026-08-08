import { createCarteraAdapter as createBaseAdapter } from './cartera-adapter-pages-v1.js?base=aura-cartera-pdf-invoke-003';

const PDF_FUNCTION_NAME = 'cartera-pdf-intake';
const PDF_FUNCTION_PATH = '/functions/v1/cartera-pdf-intake';

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function clientWithInvokeTransport(client) {
  const auth = new Proxy(client.auth, {
    get(target, property) {
      if (property === 'getSession') {
        return async () => ({
          data: { session: { access_token: 'AURA_FUNCTIONS_INVOKE' } },
          error: null,
        });
      }
      return bindValue(target, property);
    },
  });

  return new Proxy(client, {
    get(target, property) {
      if (property === 'auth') return auth;
      return bindValue(target, property);
    },
  });
}

async function functionErrorPayload(error) {
  let payload = { error: 'CARTERA_PDF_FUNCTION_INVOKE_FAILED' };
  try {
    const context = error?.context;
    if (context && typeof context.json === 'function') {
      const parsed = await context.json();
      if (parsed && typeof parsed === 'object') payload = parsed;
    }
  } catch {
  }
  return payload;
}

function windowWithInvokeTransport(windowRef, client) {
  return {
    __ENV__: windowRef.__ENV__,
    fetch: async (url, init = {}) => {
      if (!String(url).includes(PDF_FUNCTION_PATH)) {
        return windowRef.fetch(url, init);
      }

      if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      let body = {};
      try {
        body = typeof init.body === 'string' ? JSON.parse(init.body) : (init.body || {});
      } catch {
        return {
          ok: false,
          json: async () => ({ error: 'CARTERA_PDF_FUNCTION_BODY_INVALID' }),
        };
      }

      const { data, error } = await client.functions.invoke(PDF_FUNCTION_NAME, { body });
      if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      if (error) {
        const payload = await functionErrorPayload(error);
        return { ok: false, json: async () => payload };
      }

      return { ok: true, json: async () => (data || {}) };
    },
  };
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adaptedClient = clientWithInvokeTransport(client);
  const adaptedWindow = windowWithInvokeTransport(windowRef, client);
  return createBaseAdapter({ client: adaptedClient, windowRef: adaptedWindow });
}