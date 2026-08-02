const CONTRACT_ID = "FORGE_AUTHENTICATED_SESSION_CONTROLS_V1";
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const WARNING_LEAD_MS = 60 * 1000;
const LAST_ACTIVITY_KEY = "forge.auth.last_activity.v1";
const ACTIVITY_THROTTLE_MS = 1000;
const PERSIST_THROTTLE_MS = 5000;
const AUTH_API_KEY = "ForgeAliveAuthEntry067G17B1";
const ACTIVITY_EVENTS = Object.freeze([
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
  "wheel",
]);

const state = {
  authenticated: false,
  user: null,
  anchor: null,
  menu: null,
  warning: null,
  idleTimer: null,
  warningTimer: null,
  lastActivityAt: 0,
  lastPersistAt: 0,
  signOutRequested: false,
  authSource: null,
  authWrapped: null,
  authWrapTimer: null,
  observer: null,
  channel: null,
};

function authBoundaryAuthenticated() {
  return document.documentElement.dataset.forgeAuthBoundary === "authenticated";
}

function isAuthenticated() {
  return state.authenticated || authBoundaryAuthenticated();
}

function authApi() {
  return globalThis[AUTH_API_KEY] || null;
}

function bootstrapApi() {
  return globalThis.ForgeProductiveProspectBootstrap067G17B || null;
}

function safeStorageRead() {
  try {
    const value = Number(globalThis.localStorage?.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function safeStorageWrite(value) {
  try {
    globalThis.localStorage?.setItem(LAST_ACTIVITY_KEY, String(value));
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove() {
  try {
    globalThis.localStorage?.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // Storage is optional; session behavior remains in-memory.
  }
}

function clearTimers() {
  if (state.idleTimer) globalThis.clearTimeout(state.idleTimer);
  if (state.warningTimer) globalThis.clearTimeout(state.warningTimer);
  state.idleTimer = null;
  state.warningTimer = null;
}

function displayName(user) {
  const metadata = user?.user_metadata || {};
  return metadata.full_name || metadata.name || user?.email || "Usuario Forge";
}

function displayEmail(user) {
  return user?.email || "Cuenta autenticada";
}

function safeInitials(user) {
  const raw = displayName(user);
  const parts = String(raw).trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "F";
}

function avatarUrl(user) {
  const metadata = user?.user_metadata || {};
  if (typeof metadata.avatar_url === "string") return metadata.avatar_url;
  if (typeof metadata.picture === "string") return metadata.picture;
  return "";
}

function bindPress(node, handler) {
  let recentPointerAt = 0;
  node.addEventListener("pointerup", (event) => {
    event.preventDefault();
    recentPointerAt = performance.now();
    handler(event);
  });
  node.addEventListener("touchend", (event) => {
    if ("PointerEvent" in globalThis) return;
    event.preventDefault();
    recentPointerAt = performance.now();
    handler(event);
  }, { passive: false });
  node.addEventListener("click", (event) => {
    event.preventDefault();
    if (performance.now() - recentPointerAt < 900) return;
    handler(event);
  });
}

function installStyles() {
  if (document.querySelector("[data-forge-session-controls-style]")) return;
  const style = document.createElement("style");
  style.dataset.forgeSessionControlsStyle = CONTRACT_ID;
  style.textContent = `
    [data-forge-session-menu] {
      background: linear-gradient(145deg, rgba(7, 20, 44, .985), rgba(12, 33, 66, .975));
      border: 1px solid rgba(112, 221, 255, .28);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, .48), 0 0 0 1px rgba(245, 199, 92, .12);
      box-sizing: border-box;
      color: #f8fbff;
      inline-size: min(320px, calc(100vw - 24px));
      padding: 16px;
      position: fixed;
      z-index: 2147483006;
    }
    [data-forge-session-menu][hidden],
    [data-forge-session-warning][hidden] {
      display: none !important;
    }
    .forge-session-menu__top {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .forge-session-menu__eyebrow {
      color: rgba(112, 221, 255, .88);
      font: 800 .72rem/1.2 Inter, system-ui, sans-serif;
      letter-spacing: .1em;
      margin: 0;
      text-transform: uppercase;
    }
    .forge-session-menu__close,
    .forge-session-menu__signout,
    .forge-session-warning__continue {
      -webkit-tap-highlight-color: rgba(155, 232, 255, .18);
      appearance: none;
      border: 1px solid rgba(255, 255, 255, .16);
      cursor: pointer;
      font: 750 .9rem/1 Inter, system-ui, sans-serif;
      min-height: 44px;
      touch-action: manipulation;
    }
    .forge-session-menu__close {
      background: rgba(255, 255, 255, .07);
      border-radius: 999px;
      color: #f8fbff;
      inline-size: 44px;
      padding: 0;
    }
    .forge-session-menu__identity {
      align-items: center;
      display: grid;
      gap: 12px;
      grid-template-columns: 54px minmax(0, 1fr);
    }
    .forge-session-menu__mark {
      align-items: center;
      aspect-ratio: 1;
      background: radial-gradient(circle at 30% 20%, rgba(245, 199, 92, .34), rgba(61, 216, 255, .18));
      border: 1px solid rgba(245, 199, 92, .34);
      border-radius: 50%;
      display: flex;
      font-weight: 900;
      justify-content: center;
      overflow: hidden;
    }
    .forge-session-menu__mark img {
      block-size: 100%;
      inline-size: 100%;
      object-fit: cover;
    }
    .forge-session-menu__name,
    .forge-session-menu__email {
      display: block;
      overflow-wrap: anywhere;
    }
    .forge-session-menu__name {
      font: 800 .98rem/1.25 Inter, system-ui, sans-serif;
    }
    .forge-session-menu__email {
      color: rgba(226, 236, 255, .72);
      font: 500 .8rem/1.4 Inter, system-ui, sans-serif;
      margin-top: 3px;
    }
    .forge-session-menu__idle-note {
      background: rgba(112, 221, 255, .08);
      border: 1px solid rgba(112, 221, 255, .14);
      border-radius: 14px;
      color: rgba(226, 236, 255, .8);
      font: 600 .8rem/1.45 Inter, system-ui, sans-serif;
      margin: 14px 0;
      padding: 10px 12px;
    }
    .forge-session-menu__signout {
      background: rgba(255, 255, 255, .08);
      border-radius: 14px;
      color: #f8fbff;
      inline-size: 100%;
      padding: 12px 14px;
    }
    [data-forge-session-menu] button:focus-visible,
    [data-forge-session-warning] button:focus-visible {
      outline: 3px solid rgba(61, 216, 255, .9);
      outline-offset: 3px;
    }
    [data-forge-session-warning] {
      align-items: center;
      background: rgba(7, 20, 44, .985);
      border: 1px solid rgba(245, 199, 92, .38);
      border-radius: 18px;
      bottom: max(96px, calc(env(safe-area-inset-bottom) + 84px));
      box-shadow: 0 18px 60px rgba(0, 0, 0, .42);
      box-sizing: border-box;
      color: #f8fbff;
      display: flex;
      gap: 12px;
      inline-size: min(430px, calc(100vw - 24px));
      justify-content: space-between;
      padding: 12px;
      position: fixed;
      right: max(12px, env(safe-area-inset-right));
      z-index: 2147483007;
    }
    .forge-session-warning__copy {
      font: 650 .84rem/1.4 Inter, system-ui, sans-serif;
      margin: 0;
    }
    .forge-session-warning__continue {
      background: linear-gradient(135deg, #f5c75c, #ffe08a);
      border-radius: 13px;
      color: #081225;
      flex: 0 0 auto;
      padding: 10px 12px;
    }
    @media (max-width: 520px) {
      [data-forge-session-warning] {
        align-items: stretch;
        flex-direction: column;
        left: 12px;
        right: 12px;
      }
      .forge-session-warning__continue {
        inline-size: 100%;
      }
    }
  `;
  document.head.append(style);
}

function ensureMenu() {
  if (state.menu?.isConnected) return state.menu;
  const menu = document.createElement("section");
  menu.dataset.forgeSessionMenu = CONTRACT_ID;
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Cuenta de Forge");
  menu.hidden = true;
  menu.innerHTML = `
    <div class="forge-session-menu__top">
      <p class="forge-session-menu__eyebrow">Cuenta de Forge</p>
      <button type="button" class="forge-session-menu__close" data-forge-session-menu-close aria-label="Cerrar menú de cuenta">×</button>
    </div>
    <div class="forge-session-menu__identity">
      <div class="forge-session-menu__mark" data-forge-session-mark>F</div>
      <div>
        <strong class="forge-session-menu__name" data-forge-session-name>Usuario Forge</strong>
        <span class="forge-session-menu__email" data-forge-session-email>Cuenta autenticada</span>
      </div>
    </div>
    <p class="forge-session-menu__idle-note">La sesión se cierra automáticamente después de 10 minutos sin actividad.</p>
    <button type="button" class="forge-session-menu__signout" data-forge-auth-signout role="menuitem">Cerrar sesión</button>
  `;
  document.body.append(menu);
  bindPress(menu.querySelector("[data-forge-session-menu-close]"), closeMenu);
  state.menu = menu;
  updateMenuProfile();
  return menu;
}

function ensureWarning() {
  if (state.warning?.isConnected) return state.warning;
  const warning = document.createElement("aside");
  warning.dataset.forgeSessionWarning = CONTRACT_ID;
  warning.setAttribute("role", "status");
  warning.hidden = true;
  warning.innerHTML = `
    <p class="forge-session-warning__copy">Tu sesión se cerrará en menos de un minuto por inactividad.</p>
    <button type="button" class="forge-session-warning__continue" data-forge-session-continue>Seguir conectado</button>
  `;
  document.body.append(warning);
  bindPress(warning.querySelector("[data-forge-session-continue]"), () => {
    recordActivity({ force: true, broadcast: true });
  });
  state.warning = warning;
  return warning;
}

function updateMenuProfile() {
  const menu = state.menu;
  if (!menu) return;
  const mark = menu.querySelector("[data-forge-session-mark]");
  const name = menu.querySelector("[data-forge-session-name]");
  const email = menu.querySelector("[data-forge-session-email]");
  if (name) name.textContent = displayName(state.user);
  if (email) email.textContent = displayEmail(state.user);
  if (!mark) return;
  mark.replaceChildren();
  const source = avatarUrl(state.user);
  if (source) {
    const image = document.createElement("img");
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.src = source;
    image.addEventListener("error", () => {
      mark.textContent = safeInitials(state.user);
    }, { once: true });
    mark.append(image);
  } else {
    mark.textContent = safeInitials(state.user);
  }
}

async function hydrateUser() {
  const bootstrap = bootstrapApi();
  try {
    let user = null;
    if (typeof bootstrap?.getUser === "function") {
      const result = await bootstrap.getUser();
      user = result?.data?.user || null;
    }
    if (!user && typeof bootstrap?.getSession === "function") {
      const result = await bootstrap.getSession();
      user = result?.data?.session?.user || null;
    }
    if (user?.id) {
      state.user = user;
      updateMenuProfile();
    }
    return state.user;
  } catch {
    return state.user;
  }
}

function visibleAvatar() {
  const candidates = Array.from(document.querySelectorAll(
    '[data-forge-auth-avatar][data-forge-auth-state="authenticated"], [data-forge-auth-avatar]',
  ));
  return candidates.find((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return !node.hidden && style.display !== "none" && style.visibility !== "hidden"
      && rect.width > 0 && rect.height > 0;
  }) || candidates[0] || null;
}

function positionMenu() {
  if (!state.menu || state.menu.hidden || !state.anchor?.isConnected) return;
  const rect = state.anchor.getBoundingClientRect();
  const menuRect = state.menu.getBoundingClientRect();
  const margin = 12;
  const width = Math.min(menuRect.width || 320, globalThis.innerWidth - margin * 2);
  let left = rect.right - width;
  left = Math.max(margin, Math.min(left, globalThis.innerWidth - width - margin));
  let top = rect.bottom + 8;
  if (top + menuRect.height > globalThis.innerHeight - margin) {
    top = Math.max(margin, rect.top - menuRect.height - 8);
  }
  state.menu.style.left = `${Math.round(left)}px`;
  state.menu.style.top = `${Math.round(top)}px`;
}

function openMenu(anchor = visibleAvatar()) {
  if (!isAuthenticated()) return false;
  const menu = ensureMenu();
  state.anchor = anchor || visibleAvatar();
  updateMenuProfile();
  menu.hidden = false;
  globalThis.requestAnimationFrame(positionMenu);
  void hydrateUser();
  return true;
}

function closeMenu() {
  if (state.menu) state.menu.hidden = true;
  state.anchor = null;
}

function toggleForAvatar(anchor = visibleAvatar()) {
  if (!isAuthenticated()) return false;
  const menu = ensureMenu();
  if (!menu.hidden && state.anchor === anchor) {
    closeMenu();
    return true;
  }
  return openMenu(anchor);
}

function hideWarning() {
  if (state.warning) state.warning.hidden = true;
}

function showWarning() {
  if (!isAuthenticated() || state.signOutRequested) return;
  ensureWarning().hidden = false;
}

function emitSessionEvent(name, detail = {}) {
  globalThis.dispatchEvent(new CustomEvent(name, {
    detail: Object.freeze({
      contractId: CONTRACT_ID,
      ...detail,
    }),
  }));
}

async function requestSignOut(reason = "MANUAL") {
  if (!isAuthenticated() || state.signOutRequested) return false;
  state.signOutRequested = true;
  clearTimers();
  hideWarning();
  closeMenu();
  emitSessionEvent("forge:session-signout-requested", { reason });
  const api = authApi();
  if (typeof api?.signOut !== "function") {
    state.signOutRequested = false;
    scheduleTimers();
    return false;
  }
  await api.signOut();
  globalThis.setTimeout(() => {
    if (isAuthenticated()) {
      state.signOutRequested = false;
      scheduleTimers();
    }
  }, 3000);
  return true;
}

function evaluateInactivity(now = Date.now()) {
  if (!isAuthenticated() || state.signOutRequested) return "INACTIVE";
  if (!state.lastActivityAt) {
    recordActivity({ force: true, broadcast: false });
    return "ACTIVE";
  }
  const elapsed = Math.max(0, now - state.lastActivityAt);
  if (elapsed >= IDLE_TIMEOUT_MS) {
    void requestSignOut("INACTIVITY_TIMEOUT");
    return "SIGNING_OUT";
  }
  if (elapsed >= IDLE_TIMEOUT_MS - WARNING_LEAD_MS) {
    showWarning();
    return "WARNING";
  }
  hideWarning();
  return "ACTIVE";
}

function scheduleTimers() {
  clearTimers();
  if (!isAuthenticated() || state.signOutRequested || !state.lastActivityAt) return;
  const elapsed = Math.max(0, Date.now() - state.lastActivityAt);
  const remaining = IDLE_TIMEOUT_MS - elapsed;
  if (remaining <= 0) {
    void requestSignOut("INACTIVITY_TIMEOUT");
    return;
  }
  const warningDelay = remaining - WARNING_LEAD_MS;
  if (warningDelay <= 0) showWarning();
  else state.warningTimer = globalThis.setTimeout(showWarning, warningDelay);
  state.idleTimer = globalThis.setTimeout(() => {
    void requestSignOut("INACTIVITY_TIMEOUT");
  }, remaining);
}

function broadcastActivity(timestamp) {
  try {
    state.channel?.postMessage({ type: "ACTIVITY", timestamp });
  } catch {
    // BroadcastChannel is optional.
  }
}

function recordActivity({ force = false, broadcast = true } = {}) {
  if (!isAuthenticated() || state.signOutRequested) return false;
  const now = Date.now();
  if (!force && now - state.lastActivityAt < ACTIVITY_THROTTLE_MS) return false;
  state.lastActivityAt = now;
  hideWarning();
  if (force || now - state.lastPersistAt >= PERSIST_THROTTLE_MS) {
    safeStorageWrite(now);
    state.lastPersistAt = now;
  }
  if (broadcast) broadcastActivity(now);
  scheduleTimers();
  emitSessionEvent("forge:session-activity", { lastActivityAt: now });
  return true;
}

function beginAuthenticatedSession(eventName = "INITIAL_SESSION") {
  const wasAuthenticated = state.authenticated;
  state.authenticated = true;
  state.signOutRequested = false;
  const persisted = safeStorageRead();
  if (eventName === "SIGNED_IN" || (!persisted && !state.lastActivityAt)) {
    recordActivity({ force: true, broadcast: true });
  } else {
    state.lastActivityAt = Math.max(state.lastActivityAt, persisted || Date.now());
    evaluateInactivity();
    scheduleTimers();
  }
  if (!wasAuthenticated) emitSessionEvent("forge:session-idle-guard-started", {
    timeoutMs: IDLE_TIMEOUT_MS,
  });
  void hydrateUser();
}

function endAuthenticatedSession() {
  state.authenticated = false;
  state.user = null;
  state.signOutRequested = false;
  state.lastActivityAt = 0;
  state.lastPersistAt = 0;
  clearTimers();
  hideWarning();
  closeMenu();
  safeStorageRemove();
}

function installAuthApiBridge() {
  const source = globalThis[AUTH_API_KEY];
  if (!source || typeof source !== "object") return false;
  if (source.__forgeAuthenticatedSessionControls === CONTRACT_ID) {
    state.authWrapped = source;
    return true;
  }
  const wrapped = Object.freeze({
    ...source,
    __forgeAuthenticatedSessionControls: CONTRACT_ID,
    __forgeAuthenticatedSessionSource: source,
    openAuthPanel(options = {}) {
      if (isAuthenticated() && options?.forceFullProfile !== true) {
        return toggleForAvatar(visibleAvatar());
      }
      return source.openAuthPanel?.(options);
    },
  });
  globalThis[AUTH_API_KEY] = wrapped;
  state.authSource = source;
  state.authWrapped = wrapped;
  return true;
}

function startAuthApiBridge() {
  if (installAuthApiBridge()) return;
  state.authWrapTimer = globalThis.setInterval(() => {
    if (!installAuthApiBridge()) return;
    globalThis.clearInterval(state.authWrapTimer);
    state.authWrapTimer = null;
  }, 50);
  globalThis.setTimeout(() => {
    if (!state.authWrapTimer) return;
    globalThis.clearInterval(state.authWrapTimer);
    state.authWrapTimer = null;
  }, 8000);
}

function syncBoundary() {
  const authenticated = authBoundaryAuthenticated();
  if (authenticated && !state.authenticated) {
    beginAuthenticatedSession("BOUNDARY_AUTHENTICATED");
  } else if (!authenticated && state.authenticated) {
    endAuthenticatedSession();
  }
}

function onAuthStateChanged(event) {
  const detail = event.detail || {};
  const status = String(detail.status || "").toLowerCase();
  if (status === "authenticated") {
    beginAuthenticatedSession(String(detail.event || "AUTHENTICATED"));
  } else if (["anonymous", "auth_error"].includes(status)) {
    endAuthenticatedSession();
  }
}

function onActivityEvent() {
  recordActivity({ force: false, broadcast: true });
}

function onStorage(event) {
  if (event.key !== LAST_ACTIVITY_KEY || !event.newValue || !isAuthenticated()) return;
  const timestamp = Number(event.newValue);
  if (!Number.isFinite(timestamp) || timestamp <= state.lastActivityAt) return;
  state.lastActivityAt = timestamp;
  state.lastPersistAt = timestamp;
  hideWarning();
  scheduleTimers();
}

function onChannelMessage(event) {
  if (event.data?.type !== "ACTIVITY" || !isAuthenticated()) return;
  const timestamp = Number(event.data.timestamp);
  if (!Number.isFinite(timestamp) || timestamp <= state.lastActivityAt) return;
  state.lastActivityAt = timestamp;
  hideWarning();
  scheduleTimers();
}

function boot() {
  installStyles();
  ensureMenu();
  ensureWarning();
  startAuthApiBridge();

  for (const eventName of ACTIVITY_EVENTS) {
    const options = eventName === "keydown"
      ? { capture: true }
      : { capture: true, passive: true };
    document.addEventListener(eventName, onActivityEvent, options);
  }
  document.addEventListener("pointerdown", (event) => {
    if (!state.menu || state.menu.hidden) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("[data-forge-session-menu], [data-forge-auth-avatar]")) return;
    closeMenu();
  }, true);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  }, true);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") evaluateInactivity();
  });
  globalThis.addEventListener("pageshow", () => evaluateInactivity());
  globalThis.addEventListener("resize", positionMenu, { passive: true });
  globalThis.addEventListener("scroll", positionMenu, { capture: true, passive: true });
  globalThis.addEventListener("storage", onStorage);
  globalThis.addEventListener("forge:auth-state-changed", onAuthStateChanged);

  if ("BroadcastChannel" in globalThis) {
    state.channel = new BroadcastChannel("forge-auth-activity-v1");
    state.channel.addEventListener("message", onChannelMessage);
  }

  state.observer = new MutationObserver(syncBoundary);
  state.observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-forge-auth-boundary"],
  });
  syncBoundary();
  document.documentElement.dataset.forgeAuthenticatedSessionControls = CONTRACT_ID;
}

const api = Object.freeze({
  contractId: CONTRACT_ID,
  idleTimeoutMs: IDLE_TIMEOUT_MS,
  warningLeadMs: WARNING_LEAD_MS,
  shouldHandleAvatar: isAuthenticated,
  toggleForAvatar,
  openMenu,
  closeMenu,
  recordActivity,
  evaluateInactivity,
  requestSignOut,
  diagnostics: () => Object.freeze({
    authenticated: isAuthenticated(),
    menuOpen: Boolean(state.menu && !state.menu.hidden),
    warningVisible: Boolean(state.warning && !state.warning.hidden),
    lastActivityAt: state.lastActivityAt || null,
    idleTimeoutMs: IDLE_TIMEOUT_MS,
    authApiWrapped: Boolean(state.authWrapped),
    observerActive: Boolean(state.observer),
  }),
});

Object.defineProperty(globalThis, "ForgeAuthenticatedSessionControls", {
  configurable: true,
  value: api,
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export {
  ACTIVITY_EVENTS,
  CONTRACT_ID,
  IDLE_TIMEOUT_MS,
  LAST_ACTIVITY_KEY,
  WARNING_LEAD_MS,
  evaluateInactivity,
  recordActivity,
  requestSignOut,
  toggleForAvatar,
};
