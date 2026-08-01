import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function read(path) {
  return readFile(resolve(root, path), "utf8");
}

async function write(path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
}

function replaceExact(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`REP_17_PATCH_CARDINALITY_${label}=${count}`);
  }
  return source.replace(before, after);
}

async function patchBanxicoBridge() {
  const path =
    "docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js";
  let source = await read(path);

  source = replaceExact(
    source,
`function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
`,
`function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function isExpectedAbort(error, signal = null) {
  return Boolean(
    signal?.aborted ||
    error?.name === "AbortError" ||
    error?.code === "ABORT_ERR",
  );
}

function unavailableResponse(code, status = 503) {
  return jsonResponse({
    ok: false,
    code,
    cacheStatus: "LIVE_UNAVAILABLE",
    rates: null,
  }, status);
}
`,
    "BANXICO_HELPERS",
  );

  source = replaceExact(
    source,
`    const url = edgeUrl();
    if (!url) return originalFetch(input, init);
`,
`    const url = edgeUrl();
    if (!url) return unavailableResponse("BANXICO_EDGE_NOT_CONFIGURED");
`,
    "BANXICO_NO_PUBLIC_404_FALLBACK",
  );

  source = replaceExact(
    source,
`    try {
      const response = await originalFetch(url, {
        method: "GET",
        cache: "no-store",
        headers,
      });
      const payload = await response.json();
      return jsonResponse(normalizeEdgePayload(payload), response.status);
    } catch {
      return originalFetch(input, init);
    }
`,
`    try {
      const response = await originalFetch(url, {
        method: "GET",
        cache: "no-store",
        headers,
        signal: init?.signal,
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        return unavailableResponse("BANXICO_EDGE_PAYLOAD_INVALID", 502);
      }
      return jsonResponse(normalizeEdgePayload(payload), response.status);
    } catch (error) {
      if (isExpectedAbort(error, init?.signal)) throw error;
      return unavailableResponse("BANXICO_EDGE_UNAVAILABLE");
    }
`,
    "BANXICO_ABORT_RECONCILIATION",
  );

  await write(path, source);
}

async function patchPipeline() {
  const path =
    "docs/static-preview/forge-alive-material3/pipeline-module.js";
  let source = await read(path);

  source = replaceExact(
    source,
`function connectedData() {
  return null;
}
`,
`function connectedData() {
  return null;
}

function isExpectedAbort(error) {
  return Boolean(
    error?.name === "AbortError" ||
    error?.code === "ABORT_ERR",
  );
}
`,
    "PIPELINE_ABORT_CLASSIFIER",
  );

  source = replaceExact(
    source,
`  const usesProductiveRuntime = dataProvider === connectedData;
  let authStatus = usesProductiveRuntime ? "AUTH_LOADING" : "AUTHENTICATED";
`,
`  const usesProductiveRuntime = dataProvider === connectedData;
  let authStatus = usesProductiveRuntime ? "AUTH_LOADING" : "AUTHENTICATED";
  let sessionRevision = 0;
`,
    "PIPELINE_SESSION_REVISION",
  );

  source = replaceExact(
    source,
`  async function reconcileAuthenticatedSession() {
    authStatus = "AUTH_LOADING";
    render();
    try {
      const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
      if (!session?.data?.session?.user?.id) {
        clearPrivateState();
        authStatus = "ANONYMOUS";
        render();
        return;
      }
      productiveHydrated = true;
      productiveAdapter = await ensureReferralRuntime();
      productiveCards = await productiveAdapter.reload();
      productiveError = "";
      authStatus = "AUTHENTICATED";
      render();
    } catch {
      clearPrivateState();
      authStatus = "AUTH_ERROR";
      render();
    }
  }
`,
`  async function reconcileAuthenticatedSession() {
    const revision = ++sessionRevision;
    authStatus = "AUTH_LOADING";
    render();
    try {
      const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
      if (revision !== sessionRevision) return;
      if (!session?.data?.session?.user?.id) {
        clearPrivateState();
        authStatus = "ANONYMOUS";
        render();
        return;
      }
      productiveHydrated = true;
      const adapter = await ensureReferralRuntime();
      if (revision !== sessionRevision) return;
      const cards = await adapter.reload();
      if (revision !== sessionRevision) return;
      productiveAdapter = adapter;
      productiveCards = cards;
      productiveError = "";
      authStatus = "AUTHENTICATED";
      render();
    } catch (error) {
      if (revision !== sessionRevision || isExpectedAbort(error)) return;
      console.error("[Forge Pipeline] authenticated reconciliation failed", error);
      clearPrivateState();
      authStatus = "AUTH_ERROR";
      render();
    }
  }
`,
    "PIPELINE_RECONCILE_REVISION",
  );

  source = replaceExact(
    source,
`    if (usesProductiveRuntime && !productiveHydrated) {
      productiveHydrated = true;
      void Promise.all([
        ensureReferralStyles(),
        ensureReferralRuntime(),
      ]).then(async ([, adapter]) => {
        productiveAdapter = adapter;
        productiveCards = await adapter.reload();
        render();
      }).catch((error) => {
        productiveError = error?.code === "AUTH_REQUIRED"
          ? "Inicia sesión para cargar tu Pipeline."
          : "No pudimos cargar el Pipeline productivo.";
        render();
      });
    }
`,
`    if (usesProductiveRuntime && !productiveHydrated) {
      productiveHydrated = true;
      const hydrationRevision = sessionRevision;
      void Promise.all([
        ensureReferralStyles(),
        ensureReferralRuntime(),
      ]).then(async ([, adapter]) => {
        const cards = await adapter.reload();
        if (
          hydrationRevision !== sessionRevision ||
          authStatus !== "AUTHENTICATED"
        ) return;
        productiveAdapter = adapter;
        productiveCards = cards;
        render();
      }).catch((error) => {
        if (
          hydrationRevision !== sessionRevision ||
          isExpectedAbort(error)
        ) return;
        productiveError = error?.code === "AUTH_REQUIRED"
          ? "Inicia sesión para cargar tu Pipeline."
          : "No pudimos cargar el Pipeline productivo.";
        render();
      });
    }
`,
    "PIPELINE_HYDRATION_REVISION",
  );

  source = replaceExact(
    source,
`      if (status === "authenticated") void reconcileAuthenticatedSession();
      else if (["anonymous", "auth_error"].includes(status)) {
        clearPrivateState();
        authStatus = status === "auth_error" ? "AUTH_ERROR" : "ANONYMOUS";
        render();
      } else {
`,
`      if (status === "authenticated") void reconcileAuthenticatedSession();
      else if (["anonymous", "auth_error"].includes(status)) {
        sessionRevision += 1;
        clearPrivateState();
        authStatus = status === "auth_error" ? "AUTH_ERROR" : "ANONYMOUS";
        render();
      } else {
`,
    "PIPELINE_LOGOUT_INVALIDATION",
  );

  await write(path, source);
}

async function patchAuth() {
  const path =
    "docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js";
  let source = await read(path);

  source = replaceExact(
    source,
`    bootPromise: null,
    fallbackAvatar: null,
  };
`,
`    bootPromise: null,
    fallbackAvatar: null,
    transitionRevision: 0,
    lastEmittedSignature: null,
  };
`,
    "AUTH_STATE_GUARD",
  );

  source = replaceExact(
    source,
`  function emitAuthState(eventName) {
    global.dispatchEvent(new CustomEvent('forge:auth-state-changed', {
      detail: {
        contractId: CONTRACT_ID,
        event: eventName,
        status: state.status,
        advisorId: state.user?.id || null,
      },
    }));
  }
`,
`  function beginAuthTransition() {
    state.transitionRevision += 1;
    return state.transitionRevision;
  }

  function emitAuthState(eventName) {
    const advisorId = state.user?.id || null;
    const signature = [eventName, state.status, advisorId || 'anonymous'].join('|');
    if (state.lastEmittedSignature === signature) return false;
    state.lastEmittedSignature = signature;
    global.dispatchEvent(new CustomEvent('forge:auth-state-changed', {
      detail: {
        contractId: CONTRACT_ID,
        event: eventName,
        status: state.status,
        advisorId,
        transitionRevision: state.transitionRevision,
      },
    }));
    return true;
  }
`,
    "AUTH_EVENT_DEDUPLICATION",
  );

  source = replaceExact(
    source,
`  function applySession(session, eventName = 'INITIAL_SESSION') {
    state.session = session || null;
    state.user = session?.user || null;
    discoverAvatars();
    if (state.user?.id) {
      state.status = 'authenticated';
      renderAuthenticatedAvatar(state.user);
      clearOAuthUrlParameters();
    } else {
      state.status = 'anonymous';
      renderAnonymousAvatar();
    }
    if (state.panel) refreshPanel();
    if (state.user?.id && eventName === 'SIGNED_IN') closeAuthPanel();
    emitAuthState(eventName);
  }
`,
`  function applySession(
    session,
    eventName = 'INITIAL_SESSION',
    { expectedRevision = null } = {},
  ) {
    if (
      expectedRevision !== null &&
      expectedRevision !== state.transitionRevision
    ) return false;
    state.session = session || null;
    state.user = session?.user || null;
    discoverAvatars();
    if (state.user?.id) {
      state.status = 'authenticated';
      renderAuthenticatedAvatar(state.user);
      clearOAuthUrlParameters();
    } else {
      state.status = 'anonymous';
      renderAnonymousAvatar();
    }
    if (state.panel) refreshPanel();
    if (state.user?.id && eventName === 'SIGNED_IN') closeAuthPanel();
    emitAuthState(eventName);
    return true;
  }
`,
    "AUTH_STALE_SESSION_REJECTION",
  );

  source = replaceExact(
    source,
`  async function ensureAuthListener() {
    if (state.listenerPromise) return state.listenerPromise;
    state.listenerPromise = (async () => {
      if (!publicConfigReady()) return null;
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.onAuthStateChange !== 'function') return null;
      const result = await bootstrap.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          applySession(null, event);
          return;
        }
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY', 'INITIAL_SESSION'].includes(event)) {
          applySession(session, event);
        }
      });
      state.authSubscription = result?.data?.subscription || result?.subscription || null;
      return state.authSubscription;
    })();
    return state.listenerPromise;
  }

  async function bootstrapSession() {
    if (state.bootPromise) return state.bootPromise;
    state.status = 'auth_loading';
    renderLoadingAvatar();
    state.bootPromise = (async () => {
      if (!publicConfigReady()) {
        applySession(null, 'CONFIG_BLOCKED');
        return null;
      }
      try {
        const bootstrap = await waitForAuthBootstrap();
        if (typeof bootstrap?.getSession !== 'function') throw new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE');
        const result = await bootstrap.getSession();
        applySession(result?.data?.session || null, 'INITIAL_SESSION');
        await ensureAuthListener();
        return state.session;
      } catch (error) {
        state.status = 'auth_error';
        renderAnonymousAvatar();
        emitAuthState(error?.code || 'AUTH_ERROR');
        return null;
      }
    })();
    return state.bootPromise;
  }
`,
`  async function ensureAuthListener() {
    if (state.listenerPromise) return state.listenerPromise;
    state.listenerPromise = (async () => {
      if (!publicConfigReady()) return null;
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.onAuthStateChange !== 'function') return null;
      const result = await bootstrap.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          beginAuthTransition();
          applySession(null, event);
          return;
        }
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY', 'INITIAL_SESSION'].includes(event)) {
          beginAuthTransition();
          applySession(session, event);
        }
      });
      state.authSubscription = result?.data?.subscription || result?.subscription || null;
      return state.authSubscription;
    })();
    return state.listenerPromise;
  }

  async function bootstrapSession() {
    if (state.bootPromise) return state.bootPromise;
    state.status = 'auth_loading';
    renderLoadingAvatar();
    state.bootPromise = (async () => {
      if (!publicConfigReady()) {
        beginAuthTransition();
        applySession(null, 'CONFIG_BLOCKED');
        return null;
      }
      const bootstrapRevision = state.transitionRevision;
      try {
        const bootstrap = await waitForAuthBootstrap();
        if (typeof bootstrap?.getSession !== 'function') throw new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE');
        await ensureAuthListener();
        const requestRevision = state.transitionRevision;
        const result = await bootstrap.getSession();
        applySession(result?.data?.session || null, 'INITIAL_SESSION', {
          expectedRevision: requestRevision,
        });
        return state.session;
      } catch (error) {
        if (bootstrapRevision !== state.transitionRevision) return state.session;
        beginAuthTransition();
        state.status = 'auth_error';
        renderAnonymousAvatar();
        emitAuthState(error?.code || 'AUTH_ERROR');
        return null;
      }
    })();
    return state.bootPromise;
  }
`,
    "AUTH_BOOT_SEQUENCE",
  );

  source = replaceExact(
    source,
`  async function signOut() {
    setPanelError('');
    const button = state.panel?.querySelector('[data-forge-auth-signout]');
    const previousText = button?.textContent || 'Cerrar sesión';
    if (button) {
      button.disabled = true;
      button.textContent = 'Cerrando sesión…';
    }
    try {
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.signOut !== 'function') throw new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE');
      const { error } = await bootstrap.signOut();
      if (error) throw error;
      applySession(null, 'SIGNED_OUT');
      refreshPanel();
    } catch (error) {
      setPanelError('No pudimos cerrar la sesión. Intenta nuevamente.');
    } finally {
      if (button?.isConnected) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }
`,
`  async function signOut() {
    setPanelError('');
    const button = state.panel?.querySelector('[data-forge-auth-signout]');
    const previousText = button?.textContent || 'Cerrar sesión';
    if (button) {
      button.disabled = true;
      button.textContent = 'Cerrando sesión…';
    }
    const signOutRevision = beginAuthTransition();
    try {
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.signOut !== 'function') throw new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE');
      const { error } = await bootstrap.signOut();
      if (error) throw error;
      applySession(null, 'SIGNED_OUT', {
        expectedRevision: state.transitionRevision === signOutRevision
          ? signOutRevision
          : null,
      });
      refreshPanel();
    } catch (error) {
      if (state.transitionRevision === signOutRevision) {
        setPanelError('No pudimos cerrar la sesión. Intenta nuevamente.');
      }
    } finally {
      if (button?.isConnected) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }
`,
    "AUTH_SIGNOUT_SEQUENCE",
  );

  await write(path, source);
}

const redirectDocument = ({ target }) => `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Cotización imprimible · ForgeOS</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; }
    main { max-width: 42rem; }
    a { font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>Abriendo cotizaciones…</h1>
    <p>La versión imprimible se genera desde una cotización confirmada.</p>
    <p><a data-quote-printable-fallback href="${target}">Continuar a Cotizaciones</a></p>
  </main>
  <script>
    (() => {
      const target = new URL(${JSON.stringify(target)}, location.href);
      const current = new URL(location.href);
      current.searchParams.forEach((value, key) => {
        if (key !== "nav") target.searchParams.append(key, value);
      });
      target.searchParams.set("nav", "cotizaciones");
      target.hash = current.hash;
      document.querySelector("[data-quote-printable-fallback]").href = target.href;
      location.replace(target.href);
    })();
  </script>
</body>
</html>
`;

async function writePublicQuoteRoutes() {
  await write(
    "docs/quote-printable/index.html",
    redirectDocument({ target: "../static-preview/forge-alive/" }),
  );
  await write(
    "docs/static-preview/quote-printable/index.html",
    redirectDocument({ target: "../forge-alive/" }),
  );
}

async function writeRegressionTest() {
  await write(
    "tests/rep-17-unified-runtime-regression-test.mjs",
`import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = path => readFile(resolve(root, path), "utf8");

test("REP-17B publishes controlled quote-printable entrypoints", async () => {
  for (const path of [
    "docs/quote-printable/index.html",
    "docs/static-preview/quote-printable/index.html",
  ]) {
    const html = await source(path);
    assert.match(html, /data-quote-printable-fallback/);
    assert.match(html, /location\\.replace\\(target\\.href\\)/);
    assert.match(html, /nav", "cotizaciones"/);
  }
});

test("REP-17B quote-printable public import graph is complete", async () => {
  const visited = new Set();
  async function visit(path) {
    if (visited.has(path)) return;
    visited.add(path);
    const content = await source(path);
    const imports = [
      ...content.matchAll(/(?:from\\s+|import\\(\\s*)["'](\\.\\.?\\/[^"']+)["']/g),
    ].map(match => match[1]);
    for (const specifier of imports) {
      const clean = specifier.split("?")[0];
      const candidate = resolve(dirname(resolve(root, path)), clean);
      const withExtension = extname(candidate) ? candidate : `${candidate}.js`;
      await access(withExtension);
      const relative = withExtension.slice(root.length + 1);
      assert.equal(relative.includes(".."), false);
      if (relative.endsWith(".js")) await visit(relative);
    }
  }
  await visit(
    "docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js",
  );
  assert.ok(visited.size >= 8, `unexpectedly small graph: ${visited.size}`);
});

test("REP-17C Banxico keeps cancellation and never falls through to Pages 404", async () => {
  const bridge = await source(
    "docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
  );
  assert.match(bridge, /signal: init\\?\\.signal/);
  assert.match(bridge, /if \\(isExpectedAbort\\(error, init\\?\\.signal\\)\\) throw error/);
  assert.match(bridge, /BANXICO_EDGE_UNAVAILABLE/);
  assert.match(bridge, /BANXICO_EDGE_NOT_CONFIGURED/);
  assert.doesNotMatch(
    bridge,
    /if \\(!url\\) return originalFetch\\(input, init\\)/,
  );
});

test("REP-17C Pipeline rejects stale authenticated reloads", async () => {
  const pipeline = await source(
    "docs/static-preview/forge-alive-material3/pipeline-module.js",
  );
  assert.match(pipeline, /let sessionRevision = 0/);
  assert.match(pipeline, /const revision = \\+\\+sessionRevision/);
  assert.match(pipeline, /if \\(revision !== sessionRevision\\) return/g);
  assert.match(pipeline, /sessionRevision \\+= 1/);
  assert.match(pipeline, /isExpectedAbort\\(error\\)/);
});

test("REP-17C auth orders, deduplicates and rejects stale transitions", async () => {
  const auth = await source(
    "docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js",
  );
  assert.match(auth, /transitionRevision: 0/);
  assert.match(auth, /lastEmittedSignature: null/);
  assert.match(auth, /function beginAuthTransition\\(\\)/);
  assert.match(auth, /expectedRevision !== state\\.transitionRevision/);
  assert.match(auth, /await ensureAuthListener\\(\\)/);
  assert.match(auth, /expectedRevision: requestRevision/);
  assert.match(auth, /const signOutRevision = beginAuthTransition\\(\\)/);
});
`,
  );
}

async function writeEvidence() {
  await write(
    "docs/evidence/REP_17_UNIFIED_REPAIR_AND_REGRESSION.md",
`# REP-17 Unified Repair and Regression

Status at source commit: \`IMPLEMENTED_PENDING_CI\`

## REP-17A — classification

| ID | Classification | Surface | Root cause | Repair |
|---|---|---|---|---|
| REP-17A-01 | BUILD_OR_PAGES_REGRESSION | Public quote-printable | No public compatibility document existed for direct navigation | Added direct public entrypoints preserving query/hash and routing to Cotizaciones |
| REP-17A-02 | DATA_ADAPTER_REGRESSION | Banxico / Quote | The Pages bridge retried the static \`/api/forge-market-rates\` URL after an Edge failure, producing a predictable 404 | Replaced fallthrough with controlled JSON failures and static-cache continuation |
| REP-17A-03 | ASYNC_LIFECYCLE_REGRESSION | Pipeline | An older authenticated reload could complete after logout and restore private cards | Added monotonic session revision checks around every await boundary |
| REP-17A-04 | SESSION_REGRESSION | Authentication | Initial session, listener callbacks and manual sign-out could apply duplicated or stale transitions | Listener-first bootstrap, transition revision and event deduplication |

## REP-17B — public quote-printable

- \`/quote-printable/\` is now a published compatibility route.
- \`/static-preview/quote-printable/\` is also published for the preview namespace.
- Query parameters and hash are preserved.
- The route remains public and sends the user to the canonical Cotizaciones surface.
- The complete printable JavaScript import graph is checked recursively.

## REP-17C — Pipeline, Banxico and session transitions

- Expected aborts remain aborts and are not converted into a second request.
- Banxico failures are bounded to 502/503 JSON responses, allowing the existing static cache candidate to run.
- Pipeline only commits cards when its session revision is still current.
- Logout invalidates pending Pipeline hydration.
- Auth listener registration precedes the explicit session read.
- Late session reads are rejected after a newer auth transition.
- Duplicate auth events are not emitted twice.

## REP-17D — regression contract

The REP-17 workflow runs:

1. the one-shot source transformation;
2. Node syntax checks for modified runtimes;
3. the integrated REP-17 regression test;
4. existing shell, public-config, quote-printable, Vida Mujer and Pipeline regression tests;
5. the Pages runtime generator and its artifact regression;
6. \`git diff --check\`.

The workflow commits the repaired sources only after every gate passes.
`,
  );
}

await patchBanxicoBridge();
await patchPipeline();
await patchAuth();
await writePublicQuoteRoutes();
await writeRegressionTest();
await writeEvidence();

console.log("REP_17_UNIFIED_REPAIR_SOURCE=READY");
