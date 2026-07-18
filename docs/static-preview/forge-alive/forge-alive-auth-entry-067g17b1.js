(function forgeAliveAuthEntry067G17B1(global) {
  'use strict';

  const CONTRACT_ID = 'FORGE_AUTH_ENTRY_067G17B1_V1';
  const AVATAR_SELECTOR = [
    '.dw-top-actions-056y .dw-avatar-056y',
    '.dw-sidebar-profile-056y .dw-avatar-056y',
    '.alfred-profile-056g7 > span',
  ].join(',');
  const state = {
    avatars: [],
    panel: null,
    lastFocus: null,
    session: null,
    user: null,
    status: 'anonymous',
    requestedNav: null,
    authBusy: false,
    authSubscription: null,
    listenerPromise: null,
    bootPromise: null,
  };

  function configApi() {
    return global.ForgeAlivePublicConfig067G17A1 || null;
  }

  function testAdvisorLoginEnabled() {
    return configApi()?.allowsTestAdvisorLogin?.() === true;
  }

  function testAdvisorAuthAdapter() {
    const adapter = global.ForgeTestAdvisorAuth067G17B1;
    return typeof adapter?.signInAsAdvisor === 'function' ? adapter : null;
  }

  function testAdvisorLoginAvailable() {
    return testAdvisorLoginEnabled() && Boolean(testAdvisorAuthAdapter());
  }

  function makeAvatarButton(node) {
    if (!node || node.dataset.forgeAuthAvatar === '067g17b1') return node;
    const button = global.document.createElement('button');
    button.type = 'button';
    button.className = `${node.className || ''} forge-auth-avatar-067g17b1`.trim();
    button.dataset.forgeAuthAvatar = '067g17b1';
    button.setAttribute('aria-label', 'Iniciar sesión o abrir perfil');
    button.textContent = 'F';
    node.replaceWith(button);
    button.addEventListener('click', () => openAuthPanel());
    return button;
  }

  function discoverAvatars() {
    state.avatars = Array.from(global.document.querySelectorAll(AVATAR_SELECTOR))
      .map(makeAvatarButton)
      .filter(Boolean);
    renderAnonymousAvatar();
  }

  function renderAnonymousAvatar() {
    for (const avatar of state.avatars) {
      avatar.textContent = 'F';
      avatar.setAttribute('aria-label', 'Iniciar sesión o abrir perfil');
      avatar.dataset.forgeAuthState = 'anonymous';
    }
  }

  function safeInitials(user) {
    const metadata = user?.user_metadata || {};
    const raw = metadata.full_name || metadata.name || user?.email || 'Forge';
    const parts = String(raw).trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
    return initials || 'F';
  }

  function displayName(user) {
    const metadata = user?.user_metadata || {};
    return metadata.full_name || metadata.name || user?.email || 'Usuario Forge';
  }

  function displayEmail(user) {
    return user?.email || 'Correo no disponible';
  }

  function sessionType(user) {
    const provider = user?.app_metadata?.provider;
    if (provider === 'google') return 'Cuenta de Google';
    return 'Sesión de Forge';
  }

  function profileMarkHtml(user) {
    const metadata = user?.user_metadata || {};
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '';
    if (avatarUrl) return `<img src="${avatarUrl.replace(/"/g, '&quot;')}" alt="">`;
    return safeInitials(user);
  }

  function renderLoadingAvatar() {
    for (const avatar of state.avatars) {
      avatar.textContent = 'F';
      avatar.setAttribute('aria-label', 'Recuperando sesión de Forge');
      avatar.dataset.forgeAuthState = 'auth_loading';
    }
  }

  function renderAuthenticatedAvatar(user) {
    const metadata = user?.user_metadata || {};
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : '';
    const initials = safeInitials(user);
    for (const avatar of state.avatars) {
      avatar.dataset.forgeAuthState = 'authenticated';
      avatar.setAttribute('aria-label', 'Abrir perfil de Forge');
      avatar.textContent = '';
      if (avatarUrl) {
        const image = global.document.createElement('img');
        image.alt = '';
        image.referrerPolicy = 'no-referrer';
        image.src = avatarUrl;
        image.addEventListener('error', () => {
          avatar.textContent = initials;
        }, { once: true });
        avatar.append(image);
      } else {
        avatar.textContent = initials;
      }
    }
  }

  function ensurePanel() {
    if (state.panel) return state.panel;
    const backdrop = global.document.createElement('div');
    backdrop.className = 'forge-auth-backdrop-067g17b1';
    backdrop.dataset.forgeAuthPanel = '067g17b1';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="forge-auth-panel-067g17b1" role="dialog" aria-modal="true" aria-labelledby="forge-auth-title-067g17b1" tabindex="-1">
        <header data-forge-auth-panel-header>
          <div>
            <h2 id="forge-auth-title-067g17b1" data-forge-auth-title>Iniciar sesión en Forge</h2>
            <p>Accede para consultar tu Pipeline y administrar tus prospectos.</p>
          </div>
          <button type="button" class="forge-auth-close-067g17b1" data-forge-auth-close aria-label="Cerrar panel de autenticación">×</button>
        </header>
        <div class="forge-auth-login-067g17b1" data-forge-auth-login-view>
          <div class="forge-auth-actions-067g17b1">
            <button type="button" class="forge-auth-primary-067g17b1" data-forge-auth-google>Continuar con Google</button>
          </div>
          <section class="forge-auth-test-section-067g17b1" data-forge-test-advisors hidden>
            <p class="forge-auth-test-label-067g17b1">Acceso de prueba</p>
            <div class="forge-auth-test-actions-067g17b1">
              <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="A">Asesor A</button>
              <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="B">Asesor B</button>
            </div>
          </section>
        </div>
        <div class="forge-auth-profile-067g17b1" data-forge-auth-profile-view hidden>
          <div class="forge-auth-profile-card-067g17b1">
            <div class="forge-auth-profile-mark-067g17b1" data-forge-auth-profile-mark>F</div>
            <div>
              <strong data-forge-auth-profile-name>Usuario Forge</strong>
              <span data-forge-auth-profile-email>Correo no disponible</span>
              <span data-forge-auth-profile-type>Sesión de Forge</span>
              <span data-forge-auth-profile-identity>Identidad verificada por Supabase Auth</span>
            </div>
          </div>
          <div class="forge-auth-actions-067g17b1">
            <button type="button" class="forge-auth-secondary-067g17b1" data-forge-auth-signout>Cerrar sesión</button>
          </div>
        </div>
        <p class="forge-auth-error-067g17b1" data-forge-auth-error role="alert" hidden></p>
        <footer>
          <button type="button" class="forge-auth-secondary-067g17b1" data-forge-auth-close>Cancelar</button>
        </footer>
      </section>`;
    global.document.body.append(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-forge-auth-close]')) closeAuthPanel();
      if (event.target.closest('[data-forge-auth-google]')) startGoogleLogin();
      if (event.target.closest('[data-forge-auth-signout]')) signOut();
      const testAdvisorButton = event.target.closest('[data-forge-test-advisor]');
      if (testAdvisorButton) startTestAdvisorLogin(testAdvisorButton.getAttribute('data-forge-test-advisor'));
    });
    global.document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !backdrop.hidden) closeAuthPanel();
    });
    state.panel = backdrop;
    return backdrop;
  }

  function refreshPanel() {
    const panel = ensurePanel();
    const loginView = panel.querySelector('[data-forge-auth-login-view]');
    const profileView = panel.querySelector('[data-forge-auth-profile-view]');
    const title = panel.querySelector('[data-forge-auth-title]');
    const headerText = panel.querySelector('[data-forge-auth-panel-header] p');
    const testSection = panel.querySelector('[data-forge-test-advisors]');
    const authenticated = state.status === 'authenticated' && Boolean(state.user?.id);
    if (loginView) loginView.hidden = authenticated;
    if (profileView) profileView.hidden = !authenticated;
    if (title) title.textContent = authenticated ? 'Perfil de Forge' : 'Iniciar sesión en Forge';
    if (headerText) headerText.textContent = authenticated ? 'Administra tu sesión y la identidad activa.' : 'Accede para consultar tu Pipeline y administrar tus prospectos.';
    if (testSection) testSection.hidden = !testAdvisorLoginAvailable();
    if (authenticated) {
      const mark = panel.querySelector('[data-forge-auth-profile-mark]');
      const name = panel.querySelector('[data-forge-auth-profile-name]');
      const email = panel.querySelector('[data-forge-auth-profile-email]');
      const type = panel.querySelector('[data-forge-auth-profile-type]');
      const identity = panel.querySelector('[data-forge-auth-profile-identity]');
      if (mark) mark.innerHTML = profileMarkHtml(state.user);
      if (name) name.textContent = displayName(state.user);
      if (email) email.textContent = displayEmail(state.user);
      if (type) type.textContent = sessionType(state.user);
      if (identity) identity.textContent = `advisorId: ${state.user.id}`;
    }
  }

  function currentNav() {
    const url = new URL(global.location.href);
    return state.requestedNav || url.searchParams.get('nav') || global.document?.body?.dataset?.forgeSaasActiveModuleR16c5l || 'inicio';
  }

  function canonicalRedirectUrl() {
    const url = new URL(global.location.href);
    const redirect = new URL(url.pathname || '/ForgeOS/static-preview/forge-alive/', url.origin);
    redirect.searchParams.set('nav', currentNav());
    if (url.searchParams.get('v')) redirect.searchParams.set('v', url.searchParams.get('v'));
    if (url.hash) redirect.hash = url.hash;
    return redirect.href;
  }

  function setPanelError(message) {
    const error = state.panel?.querySelector('[data-forge-auth-error]');
    if (!error) return;
    error.textContent = message || '';
    error.hidden = !message;
  }

  function publicConfigReady() {
    return configApi()?.allowsPublicClientInitialization?.() === true;
  }

  async function waitForAuthBootstrap() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const bootstrap = global.ForgeProductiveProspectBootstrap067G17B;
      if (bootstrap?.getSession && bootstrap?.onAuthStateChange) return bootstrap;
      await new Promise(resolve => global.setTimeout(resolve, 50));
    }
    return global.ForgeProductiveProspectBootstrap067G17B || null;
  }

  function emitAuthState(eventName) {
    global.dispatchEvent(new CustomEvent('forge:auth-state-changed', {
      detail: {
        contractId: CONTRACT_ID,
        event: eventName,
        status: state.status,
        advisorId: state.user?.id || null,
      },
    }));
  }

  function clearOAuthUrlParameters() {
    const url = new URL(global.location.href);
    const oauthKeys = ['code', 'state', 'error', 'error_code', 'error_description', ['access', 'token'].join('_'), ['refresh', 'token'].join('_'), 'expires_in', ['token', 'type'].join('_')];
    const hasOauthKey = oauthKeys.some((key) => url.searchParams.has(key) || url.hash.includes(`${key}=`));
    if (!hasOauthKey) return;
    for (const key of oauthKeys) url.searchParams.delete(key);
    url.hash = '';
    global.history.replaceState(global.history.state, '', url.href);
  }

  function applySession(session, eventName = 'INITIAL_SESSION') {
    state.session = session || null;
    state.user = session?.user || null;
    if (state.user?.id) {
      state.status = 'authenticated';
      renderAuthenticatedAvatar(state.user);
      clearOAuthUrlParameters();
    } else {
      state.status = 'anonymous';
      renderAnonymousAvatar();
    }
    if (state.panel) refreshPanel();
    emitAuthState(eventName);
  }

  async function ensureAuthListener() {
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

  async function startGoogleLogin() {
    if (state.authBusy) return;
    state.authBusy = true;
    setPanelError('');
    const button = state.panel?.querySelector('[data-forge-auth-google]');
    const previousText = button?.textContent || 'Continuar con Google';
    if (button) {
      button.disabled = true;
      button.textContent = 'Abriendo Google…';
    }
    try {
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.signInWithGoogle !== 'function') throw new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE');
      const { error } = await bootstrap.signInWithGoogle({ redirectTo: canonicalRedirectUrl() });
      if (error) throw error;
    } catch (error) {
      setPanelError(error?.code === 'CONFIG_BLOCKED'
        ? 'Forge no tiene configuración pública productiva para iniciar sesión.'
        : 'No pudimos abrir Google. Revisa la configuración de autenticación.');
      state.authBusy = false;
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }

  async function startTestAdvisorLogin(advisorKey) {
    const adapter = testAdvisorAuthAdapter();
    if (!adapter || !testAdvisorLoginEnabled()) {
      setPanelError('El acceso de prueba no está disponible en esta publicación.');
      return;
    }
    await adapter.signInAsAdvisor({ advisorKey });
  }

  async function signOut() {
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

  function openAuthPanel(options = {}) {
    const panel = ensurePanel();
    if (options.nav) state.requestedNav = options.nav;
    refreshPanel();
    state.lastFocus = global.document.activeElement instanceof HTMLElement ? global.document.activeElement : null;
    panel.hidden = false;
    const focusTarget = panel.querySelector('[data-forge-auth-google]') || panel.querySelector('[data-forge-auth-close]');
    focusTarget?.focus?.();
    global.dispatchEvent(new CustomEvent('forge:auth-panel-opened', { detail: { contractId: CONTRACT_ID } }));
  }

  function closeAuthPanel() {
    if (!state.panel) return;
    state.panel.hidden = true;
    state.lastFocus?.focus?.();
    global.dispatchEvent(new CustomEvent('forge:auth-panel-closed', { detail: { contractId: CONTRACT_ID } }));
  }

  function init() {
    if (!global.document) return;
    discoverAvatars();
    ensurePanel();
    refreshPanel();
    bootstrapSession();
    global.document.addEventListener('click', (event) => {
      const opener = event.target.closest?.('[data-forge-auth-open]');
      if (!opener) return;
      event.preventDefault();
      openAuthPanel({ nav: opener.getAttribute('data-forge-auth-open-nav') || opener.getAttribute('data-forge-nav-key') || null });
    });
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    openAuthPanel,
    closeAuthPanel,
    refreshPanel,
    canonicalRedirectUrl,
    signOut,
    diagnostics: () => Object.freeze({
      contractId: CONTRACT_ID,
      avatarCount: state.avatars.length,
      panelReady: Boolean(state.panel),
      status: state.status,
      advisorId: state.user?.id || null,
      authListenerAttached: Boolean(state.authSubscription),
      testAdvisorLoginEnabled: testAdvisorLoginEnabled(),
      testAdvisorLoginAvailable: testAdvisorLoginAvailable(),
      requestedNav: state.requestedNav,
    }),
  });

  global.ForgeAliveAuthEntry067G17B1 = api;

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
