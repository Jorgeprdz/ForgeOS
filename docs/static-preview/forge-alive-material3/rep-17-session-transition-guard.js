const VERSION = "REP-17C-SESSION-TRANSITION-GUARD-V2";
const BOOTSTRAP_KEY = "ForgeProductiveProspectBootstrap067G17B";

const state = {
  revision: 0,
  status: "unknown",
  signedOutBarrier: false,
  lastProviderSignature: null,
  lastPublicSignature: null,
  source: null,
  wrapped: null,
};

function advisorId(session) {
  return session?.user?.id || null;
}

function sessionVersion(session) {
  if (!session) return "none";
  return String(
    session.expires_at ||
    session.expires_in ||
    session.access_token?.slice(-12) ||
    "unversioned",
  );
}

function providerSignature(event, session) {
  return [
    event,
    advisorId(session) || "anonymous",
    sessionVersion(session),
  ].join("|");
}

function acceptProviderTransition(event, session) {
  const signature = providerSignature(event, session);
  if (signature === state.lastProviderSignature) return false;

  const nextAdvisorId = advisorId(session);
  if (event === "SIGNED_OUT") {
    state.signedOutBarrier = true;
    state.status = "anonymous";
  } else if (event === "SIGNED_IN" && nextAdvisorId) {
    state.signedOutBarrier = false;
    state.status = "authenticated";
  } else if (
    state.signedOutBarrier &&
    nextAdvisorId &&
    ["INITIAL_SESSION", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)
  ) {
    return false;
  } else {
    state.status = nextAdvisorId ? "authenticated" : "anonymous";
  }

  state.revision += 1;
  state.lastProviderSignature = signature;
  return true;
}

function anonymousSessionResult(result) {
  return {
    ...(result || {}),
    data: {
      ...(result?.data || {}),
      session: null,
    },
  };
}

function wrapBootstrap(source) {
  if (!source || typeof source !== "object") return source;
  if (source.__rep17SessionGuard === true) return source;

  const wrapped = Object.freeze({
    ...source,
    __rep17SessionGuard: true,
    __rep17Source: source,

    async getSession(...args) {
      const revision = state.revision;
      const result = await source.getSession(...args);
      if (
        revision !== state.revision &&
        (state.status === "anonymous" || state.signedOutBarrier)
      ) {
        return anonymousSessionResult(result);
      }
      return result;
    },

    onAuthStateChange(callback) {
      return source.onAuthStateChange((event, session) => {
        if (!acceptProviderTransition(event, session)) return;
        callback(event, session);
      });
    },

    async signOut(...args) {
      state.revision += 1;
      state.status = "signing_out";
      state.signedOutBarrier = true;
      const result = await source.signOut(...args);
      if (!result?.error) {
        state.revision += 1;
        state.status = "anonymous";
      }
      return result;
    },
  });

  state.source = source;
  state.wrapped = wrapped;
  return wrapped;
}

function installBootstrapGuard() {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, BOOTSTRAP_KEY);
  if (descriptor?.get?.__rep17Guard === true) return true;

  if (descriptor && descriptor.configurable === false) {
    const current = globalThis[BOOTSTRAP_KEY];
    if (current && current.__rep17SessionGuard !== true) {
      globalThis[BOOTSTRAP_KEY] = wrapBootstrap(current);
    }
    return true;
  }

  let current = globalThis[BOOTSTRAP_KEY] || null;
  if (current) current = wrapBootstrap(current);

  const getter = () => current;
  getter.__rep17Guard = true;

  Object.defineProperty(globalThis, BOOTSTRAP_KEY, {
    configurable: true,
    enumerable: true,
    get: getter,
    set(value) {
      current = wrapBootstrap(value);
    },
  });

  return true;
}

function publicSignature(detail) {
  return [
    String(detail?.event || ""),
    String(detail?.status || ""),
    String(detail?.advisorId || "anonymous"),
  ].join("|");
}

function scrubPrivatePipeline() {
  const root = document.querySelector("[data-forge-pipeline-module]");
  if (!root) return false;

  document.querySelectorAll(
    "[data-nash-prospect-workspace], [data-productive-context-workspace], " +
    "[data-nash-combat-workspace], [data-nba-workspace], [data-referral-sheet]",
  ).forEach(node => node.remove());

  const privateSurface = root.querySelector(
    "[data-productive-prospect-card], [data-productive-pipeline-cards], " +
    "[data-productive-filter-bar]",
  );
  if (!privateSurface) return false;

  root.innerHTML = `
    <header class="pipeline-module__header">
      <p>PIPELINE</p>
      <h1>Relaciones en movimiento</h1>
      <span>Datos privados protegidos</span>
    </header>
    <section class="pipeline-module__empty"
      data-pipeline-auth-state="ANONYMOUS"
      data-rep17-session-guard="true">
      <div class="pipeline-module__empty-copy">
        <h2>Inicia sesión para abrir tu Pipeline</h2>
        <p>Tus prospectos y Timeline sólo aparecen con tu cuenta autenticada.</p>
      </div>
      <button type="button" class="pipeline-module__create"
        data-forge-auth-open>Continuar con Google</button>
    </section>
  `;
  return true;
}

function installPublicTransitionGuard() {
  globalThis.addEventListener(
    "forge:auth-state-changed",
    event => {
      const detail = event.detail || {};
      const signature = publicSignature(detail);
      if (signature === state.lastPublicSignature) {
        event.stopImmediatePropagation();
        return;
      }
      state.lastPublicSignature = signature;

      const status = String(detail.status || "").toLowerCase();
      if (status === "authenticated") {
        state.status = "authenticated";
        state.signedOutBarrier = false;
      } else if (["anonymous", "auth_error"].includes(status)) {
        state.revision += 1;
        state.status = status;
        state.signedOutBarrier = true;
        queueMicrotask(scrubPrivatePipeline);
      }
    },
    { capture: true },
  );

  const observer = new MutationObserver(() => {
    if (state.status === "anonymous" || state.status === "auth_error") {
      scrubPrivatePipeline();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return observer;
}

installBootstrapGuard();
const observer = installPublicTransitionGuard();

document.documentElement.dataset.rep17SessionTransitionGuard = VERSION;

globalThis.ForgeRep17SessionTransitionGuard = Object.freeze({
  version: VERSION,
  diagnostics: () => Object.freeze({
    revision: state.revision,
    status: state.status,
    signedOutBarrier: state.signedOutBarrier,
    bootstrapWrapped: Boolean(state.wrapped),
    observerActive: Boolean(observer),
  }),
  scrubPrivatePipeline,
});

export {
  VERSION,
  acceptProviderTransition,
  installBootstrapGuard,
  providerSignature,
  scrubPrivatePipeline,
  sessionVersion,
  wrapBootstrap,
};
