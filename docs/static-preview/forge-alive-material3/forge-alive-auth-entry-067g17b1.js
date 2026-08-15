(function forgeAliveAuthEntry067G17B1(global) {
  'use strict';

  const CONTRACT_ID = 'FORGE_AUTH_ENTRY_067G17B1_V1';
  const DESIGN_AUTHORITY = 'FORGE_AURA_LIGHT_2026_V1';
  const AVATAR_SELECTOR = [
    '.dw-top-actions-056y .dw-avatar-056y',
    '.dw-sidebar-profile-056y .dw-avatar-056y',
    '.alfred-profile-056g7 > span',
    '.hero .orb',
    '.hero .profile',
  ].join(',');
  const FOCUSABLE_SELECTOR = [
    'button:not([disabled]):not([hidden])',
    'input:not([disabled]):not([hidden])',
    'select:not([disabled]):not([hidden])',
    'textarea:not([disabled]):not([hidden])',
    'a[href]:not([hidden])',
    '[tabindex]:not([tabindex="-1"]):not([hidden])',
  ].join(',');

  const state = {
    avatars: [],
    panel: null,
    lastFocus: null,
    session: null,
    user: null,
    status: 'auth_loading',
    requestedNav: null,
    authBusy: false,
    authSubscription: null,
    listenerPromise: null,
    bootPromise: null,
    fallbackAvatar: null,
    themeColorBeforeAuth: null,
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
    const button = node.tagName === 'BUTTON'
      ? node
      : global.document.createElement('button');
    button.type = 'button';
    button.className = `${node.className || ''} forge-auth-avatar-067g17b1`.trim();
    button.dataset.forgeAuthAvatar = '067g17b1';
    button.setAttribute('aria-label', 'Iniciar sesión o abrir perfil');
    button.textContent = node.matches?.('.hero .profile') ? 'JP' : 'F';
    if (button !== node) node.replaceWith(button);
    button.addEventListener('click', () => openAuthPanel());
    return button;
  }

  function ensureFallbackAvatar() {
    if (state.fallbackAvatar?.isConnected) return state.fallbackAvatar;
    const button = global.document.createElement('button');
    button.type = 'button';
    button.className = 'forge-auth-avatar-067g17b1 forge-auth-floating-avatar-067g17b1';
    button.dataset.forgeAuthAvatar = '067g17b1';
    button.dataset.forgeAuthFallback = 'true';
    button.setAttribute('aria-label', 'Iniciar sesión o abrir perfil');
    button.textContent = 'F';
    button.addEventListener('click', () => openAuthPanel());
    global.document.body.append(button);
    state.fallbackAvatar = button;
    return button;
  }

  function isVisibleAvatar(node) {
    if (!node || node.hidden) return false;
    const style = global.getComputedStyle(node);
    if (!node.getClientRects().length || style.visibility === 'hidden' || style.display === 'none' || style.pointerEvents === 'none') {
      return false;
    }
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.right <= 0 || rect.top >= global.innerHeight || rect.left >= global.innerWidth) {
      return false;
    }
    const target = global.document.elementFromPoint(
      Math.min(Math.max(rect.left + rect.width / 2, 0), global.innerWidth - 1),
      Math.min(Math.max(rect.top + rect.height / 2, 0), global.innerHeight - 1),
    );
    return target === node || node.contains(target);
  }

  function syncFallbackAvatarVisibility() {
    if (!state.fallbackAvatar) return;
    const canonicalVisible = state.avatars
      .filter((avatar) => avatar !== state.fallbackAvatar)
      .some(isVisibleAvatar);
    state.fallbackAvatar.hidden = canonicalVisible;
  }

  function discoverAvatars() {
    const fallback = ensureFallbackAvatar();
    state.avatars = Array.from(global.document.querySelectorAll(AVATAR_SELECTOR))
      .map(makeAvatarButton)
      .filter(Boolean);
    if (!state.avatars.includes(fallback)) state.avatars.push(fallback);
    renderCurrentAvatarState();
    syncFallbackAvatarVisibility();
  }

  function renderCurrentAvatarState() {
    if (state.status === 'authenticated' && state.user?.id) {
      renderAuthenticatedAvatar(state.user);
      return;
    }
    if (state.status === 'auth_loading') {
      renderLoadingAvatar();
      return;
    }
    renderAnonymousAvatar();
  }

  function renderAnonymousAvatar() {
    for (const avatar of state.avatars) {
      avatar.textContent = avatar.matches?.('.hero .profile') ? 'JP' : 'F';
      avatar.setAttribute('aria-label', 'Iniciar sesión en Forge');
      avatar.dataset.forgeAuthState = 'anonymous';
    }
  }

  function safeInitials(user) {
    const metadata = user?.user_metadata || {};
    const raw = metadata.full_name || metadata.name || user?.email || 'Forge';
    const parts = String(raw).trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'F';
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
    if (provider === 'email') return 'Correo y contraseña';
    return 'Sesión de Forge';
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
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url
      : typeof metadata.picture === 'string' ? metadata.picture : '';
    const initials = safeInitials(user);
    for (const avatar of state.avatars) {
      avatar.dataset.forgeAuthState = 'authenticated';
      avatar.setAttribute('aria-label', 'Abrir perfil de Forge');
      avatar.replaceChildren();
      if (avatarUrl) {
        const image = global.document.createElement('img');
        image.alt = '';
        image.referrerPolicy = 'no-referrer';
        image.src = avatarUrl;
        image.addEventListener('error', () => {
          avatar.replaceChildren(global.document.createTextNode(initials));
        }, { once: true });
        avatar.append(image);
      } else {
        avatar.textContent = initials;
      }
    }
  }

  function renderProfileMark(container, user) {
    if (!container) return;
    container.replaceChildren();
    const metadata = user?.user_metadata || {};
    const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url
      : typeof metadata.picture === 'string' ? metadata.picture : '';
    if (!avatarUrl) {
      container.textContent = safeInitials(user);
      return;
    }
    const image = global.document.createElement('img');
    image.alt = '';
    image.referrerPolicy = 'no-referrer';
    image.src = avatarUrl;
    image.addEventListener('error', () => {
      container.replaceChildren(global.document.createTextNode(safeInitials(user)));
    }, { once: true });
    container.append(image);
  }

  function ensurePanel() {
    if (state.panel) return state.panel;
    const backdrop = global.document.createElement('div');
    backdrop.className = 'forge-auth-backdrop-067g17b1';
    backdrop.dataset.forgeAuthPanel = '067g17b1';
    backdrop.dataset.forgeDesignAuthority = DESIGN_AUTHORITY;
    backdrop.dataset.forgeAuthMode = 'loading';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="forge-auth-stage-067g17b1" role="dialog" aria-modal="true" aria-labelledby="forge-auth-title-067g17b1" aria-describedby="forge-auth-description-067g17b1" tabindex="-1">
        <aside class="forge-auth-story-067g17b1">
          <div class="forge-auth-brand-067g17b1" aria-label="Forge">
            <span class="forge-auth-brand-mark-067g17b1" aria-hidden="true">F</span>
            <span>Forge</span>
          </div>
          <div class="forge-auth-story-copy-067g17b1">
            <p class="forge-auth-eyebrow-067g17b1">TU OPERACIÓN, EN UN SOLO LUGAR</p>
            <h1>Convierte seguimiento en decisiones claras.</h1>
            <p>Organiza prospectos, pólizas, actividades y oportunidades sin depender de hojas separadas.</p>
            <ul aria-label="Beneficios de Forge">
              <li><span aria-hidden="true">✓</span> Prioridades visibles desde el primer momento</li>
              <li><span aria-hidden="true">✓</span> Información comercial conectada</li>
              <li><span aria-hidden="true">✓</span> Acceso protegido por tu identidad</li>
            </ul>
          </div>
          <div class="forge-auth-aura-067g17b1" aria-hidden="true">
            <span class="forge-auth-aura-core-067g17b1">F</span>
            <span class="forge-auth-aura-ring-067g17b1 forge-auth-aura-ring-a-067g17b1"></span>
            <span class="forge-auth-aura-ring-067g17b1 forge-auth-aura-ring-b-067g17b1"></span>
            <span class="forge-auth-aura-chip-067g17b1 forge-auth-aura-chip-a-067g17b1">Seguimiento</span>
            <span class="forge-auth-aura-chip-067g17b1 forge-auth-aura-chip-b-067g17b1">Pipeline</span>
          </div>
        </aside>

        <div class="forge-auth-card-067g17b1">
          <header class="forge-auth-card-header-067g17b1">
            <div class="forge-auth-mobile-brand-067g17b1" aria-label="Forge">
              <span class="forge-auth-brand-mark-067g17b1" aria-hidden="true">F</span>
              <span>Forge</span>
            </div>
            <button type="button" class="forge-auth-close-067g17b1" data-forge-auth-close aria-label="Cerrar perfil" hidden>×</button>
          </header>

          <div class="forge-auth-loading-067g17b1" data-forge-auth-loading-view>
            <span class="forge-auth-loader-067g17b1" aria-hidden="true"></span>
            <h2>Recuperando tu sesión</h2>
            <p>Estamos comprobando tu acceso seguro a Forge.</p>
          </div>

          <div class="forge-auth-login-067g17b1" data-forge-auth-login-view hidden>
            <p class="forge-auth-eyebrow-067g17b1">ACCESO SEGURO</p>
            <h2 id="forge-auth-title-067g17b1" data-forge-auth-title>Bienvenido a Forge</h2>
            <p id="forge-auth-description-067g17b1" class="forge-auth-description-067g17b1">Ingresa con tu correo o continúa con Google.</p>

            <form class="forge-auth-form-067g17b1" data-forge-auth-form novalidate>
              <label class="forge-auth-field-067g17b1">
                <span>Correo electrónico</span>
                <input type="email" name="email" autocomplete="username" inputmode="email" spellcheck="false" required aria-describedby="forge-auth-error-067g17b1">
              </label>

              <label class="forge-auth-field-067g17b1">
                <span>Contraseña</span>
                <span class="forge-auth-password-wrap-067g17b1">
                  <input type="password" name="password" autocomplete="current-password" required minlength="6" aria-describedby="forge-auth-error-067g17b1">
                  <button type="button" class="forge-auth-password-toggle-067g17b1" data-forge-auth-password-toggle aria-label="Mostrar contraseña" aria-pressed="false">Ver</button>
                </span>
              </label>

              <button type="submit" class="forge-auth-primary-067g17b1" data-forge-auth-password-submit>
                <span data-forge-auth-password-label>Entrar a Forge</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p class="forge-auth-error-067g17b1" id="forge-auth-error-067g17b1" data-forge-auth-error role="alert" hidden></p>

            <div class="forge-auth-divider-067g17b1" aria-hidden="true"><span>o</span></div>

            <button type="button" class="forge-auth-google-067g17b1" data-forge-auth-google>
              <span class="forge-auth-google-mark-067g17b1" aria-hidden="true">G</span>
              <span data-forge-auth-google-label>Continuar con Google</span>
            </button>

            <section class="forge-auth-test-section-067g17b1" data-forge-test-advisors hidden>
              <p class="forge-auth-test-label-067g17b1">Acceso gobernado de prueba</p>
              <div class="forge-auth-test-actions-067g17b1">
                <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="A">Asesor A</button>
                <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="B">Asesor B</button>
              </div>
            </section>

            <p class="forge-auth-security-note-067g17b1"><span aria-hidden="true">◉</span> Tu sesión se protege mediante Supabase Auth.</p>
          </div>

          <div class="forge-auth-profile-067g17b1" data-forge-auth-profile-view hidden>
            <p class="forge-auth-eyebrow-067g17b1">SESIÓN ACTIVA</p>
            <h2 data-forge-auth-title>Tu perfil de Forge</h2>
            <p class="forge-auth-description-067g17b1">Esta es la identidad con la que estás trabajando.</p>
            <div class="forge-auth-profile-card-067g17b1">
              <div class="forge-auth-profile-mark-067g17b1" data-forge-auth-profile-mark>F</div>
              <div>
                <strong data-forge-auth-profile-name>Usuario Forge</strong>
                <span data-forge-auth-profile-email>Correo no disponible</span>
                <span data-forge-auth-profile-type>Sesión de Forge</span>
              </div>
            </div>
            <button type="button" class="forge-auth-secondary-067g17b1" data-forge-auth-signout>Cerrar sesión</button>
            <p class="forge-auth-error-067g17b1" data-forge-auth-profile-error role="alert" hidden></p>
          </div>
        </div>
      </section>`;

    global.document.body.append(backdrop);

    backdrop.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('[data-forge-auth-close]')) closeAuthPanel();
      if (target.closest('[data-forge-auth-google]')) startGoogleLogin();
      if (target.closest('[data-forge-auth-signout]')) signOut();
      if (target.closest('[data-forge-auth-password-toggle]')) togglePasswordVisibility();
      const testAdvisorButton = target.closest('[data-forge-test-advisor]');
      if (testAdvisorButton) startTestAdvisorLogin(testAdvisorButton.getAttribute('data-forge-test-advisor'));
    });

    backdrop.querySelector('[data-forge-auth-form]')?.addEventListener('submit', startPasswordLogin);
    global.document.addEventListener('keydown', handlePanelKeydown);
    state.panel = backdrop;
    return backdrop;
  }

  function focusableElements() {
    if (!state.panel || state.panel.hidden) return [];
    return Array.from(state.panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter((node) => {
      if (node.hidden || node.closest('[hidden]')) return false;
      const style = global.getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function handlePanelKeydown(event) {
    if (!state.panel || state.panel.hidden) return;
    if (event.key === 'Escape') {
      if (state.status === 'authenticated') closeAuthPanel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = focusableElements();
    if (!focusable.length) {
      event.preventDefault();
      state.panel.querySelector('.forge-auth-stage-067g17b1')?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && global.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && global.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function refreshPanel() {
    const panel = ensurePanel();
    const loginView = panel.querySelector('[data-forge-auth-login-view]');
    const loadingView = panel.querySelector('[data-forge-auth-loading-view]');
    const profileView = panel.querySelector('[data-forge-auth-profile-view]');
    const testSection = panel.querySelector('[data-forge-test-advisors]');
    const closeButton = panel.querySelector('[data-forge-auth-close]');
    const authenticated = state.status === 'authenticated' && Boolean(state.user?.id);
    const loading = state.status === 'auth_loading';

    panel.dataset.forgeAuthMode = authenticated ? 'profile' : loading ? 'loading' : 'login';
    panel.setAttribute('aria-busy', loading ? 'true' : 'false');
    if (loginView) loginView.hidden = authenticated || loading;
    if (loadingView) loadingView.hidden = !loading;
    if (profileView) profileView.hidden = !authenticated;
    if (closeButton) closeButton.hidden = !authenticated;
    if (testSection) testSection.hidden = authenticated || !testAdvisorLoginAvailable();

    if (authenticated) {
      renderProfileMark(panel.querySelector('[data-forge-auth-profile-mark]'), state.user);
      const name = panel.querySelector('[data-forge-auth-profile-name]');
      const email = panel.querySelector('[data-forge-auth-profile-email]');
      const type = panel.querySelector('[data-forge-auth-profile-type]');
      if (name) name.textContent = displayName(state.user);
      if (email) email.textContent = displayEmail(state.user);
      if (type) type.textContent = sessionType(state.user);
    }
  }

  function currentNav() {
    const url = new URL(global.location.href);
    return state.requestedNav || url.searchParams.get('nav') || global.document?.body?.dataset?.forgeSaasActiveModuleR16c5l || 'inicio';
  }

  function canonicalRedirectUrl() {
    const url = new URL(global.location.href);
    const redirect = new URL('/ForgeOS/static-preview/forge-alive/', url.origin);
    redirect.searchParams.set('nav', currentNav());
    if (url.searchParams.get('v')) redirect.searchParams.set('v', url.searchParams.get('v'));
    if (url.hash) redirect.hash = url.hash;
    return redirect.href;
  }

  function errorElement(profile = false) {
    return state.panel?.querySelector(profile ? '[data-forge-auth-profile-error]' : '[data-forge-auth-error]');
  }

  function setPanelError(message, code = '', profile = false) {
    const error = errorElement(profile);
    if (!error) return;
    error.textContent = message || '';
    error.hidden = !message;
    if (code) error.dataset.forgeAuthErrorCode = code;
    else delete error.dataset.forgeAuthErrorCode;
  }

  function humanAuthError(error) {
    const code = String(error?.code || error?.name || '').toLowerCase();
    const message = String(error?.message || '').toLowerCase();
    if (code === 'auth_credentials_required') {
      return { code: 'CREDENTIALS_REQUIRED', message: 'Escribe tu correo y contraseña para continuar.' };
    }
    if (code.includes('invalid') || message.includes('invalid login credentials')) {
      return { code: 'INVALID_CREDENTIALS', message: 'El correo o la contraseña no coinciden. Revísalos e intenta de nuevo.' };
    }
    if (message.includes('email not confirmed')) {
      return { code: 'EMAIL_NOT_CONFIRMED', message: 'Confirma tu correo antes de entrar a Forge.' };
    }
    if (code.includes('rate') || message.includes('too many') || message.includes('rate limit')) {
      return { code: 'RATE_LIMITED', message: 'Hubo demasiados intentos. Espera un momento antes de volver a probar.' };
    }
    if (code === 'config_blocked' || message.includes('config_blocked') || message.includes('config blocked')) {
      return { code: 'CONFIG_BLOCKED', message: 'El acceso productivo no está configurado en esta publicación.' };
    }
    if (
      code.includes('network')
      || code.includes('client_unavailable')
      || message.includes('fetch')
      || message.includes('network')
      || message.includes('load failed')
    ) {
      return { code: 'NETWORK_ERROR', message: 'No pudimos conectar con Forge. Revisa tu conexión e intenta nuevamente.' };
    }
    return { code: 'AUTH_ERROR', message: 'No pudimos iniciar tu sesión. Intenta nuevamente.' };
  }

  function publicConfigReady() {
    return configApi()?.allowsPublicClientInitialization?.() === true;
  }

  async function waitForAuthBootstrap() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const bootstrap = global.ForgeProductiveProspectBootstrap067G17B;
      if (bootstrap?.getSession && bootstrap?.onAuthStateChange) return bootstrap;
      await new Promise((resolve) => global.setTimeout(resolve, 50));
    }
    return global.ForgeProductiveProspectBootstrap067G17B || null;
  }

  function emitAuthState(eventName) {
    global.dispatchEvent(new CustomEvent('forge:auth-state-changed', {
      detail: {
        contractId: CONTRACT_ID,
        designAuthority: DESIGN_AUTHORITY,
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

  function clearCredentialFields() {
    const form = state.panel?.querySelector('[data-forge-auth-form]');
    if (!form) return;
    const password = form.elements?.password;
    if (password) password.value = '';
  }

  function applySession(session, eventName = 'INITIAL_SESSION') {
    state.session = session || null;
    state.user = session?.user || null;
    discoverAvatars();
    if (state.user?.id) {
      state.status = 'authenticated';
      renderAuthenticatedAvatar(state.user);
      clearCredentialFields();
      clearOAuthUrlParameters();
    } else {
      state.status = 'anonymous';
      renderAnonymousAvatar();
    }
    refreshPanel();
    if (state.user?.id && eventName === 'SIGNED_IN') closeAuthPanel({ force: true });
    if (!state.user?.id && state.panel?.hidden) openAuthPanel({ nav: currentNav() });
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
    refreshPanel();
    openAuthPanel({ nav: currentNav() });
    state.bootPromise = (async () => {
      if (!publicConfigReady()) {
        state.status = 'auth_error';
        refreshPanel();
        setPanelError('El acceso productivo no está configurado en esta publicación.', 'CONFIG_BLOCKED');
        emitAuthState('CONFIG_BLOCKED');
        return null;
      }
      try {
        const bootstrap = await waitForAuthBootstrap();
        if (typeof bootstrap?.getSession !== 'function') throw Object.assign(new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE'), { code: 'CLIENT_UNAVAILABLE' });
        const result = await bootstrap.getSession();
        applySession(result?.data?.session || null, 'INITIAL_SESSION');
        await ensureAuthListener();
        return state.session;
      } catch (error) {
        const human = humanAuthError(error);
        state.status = 'auth_error';
        renderAnonymousAvatar();
        refreshPanel();
        setPanelError(human.message, human.code);
        emitAuthState(human.code);
        return null;
      }
    })();
    return state.bootPromise;
  }

  function setLoginBusy(busy, source = '') {
    state.authBusy = busy;
    const form = state.panel?.querySelector('[data-forge-auth-form]');
    const google = state.panel?.querySelector('[data-forge-auth-google]');
    const passwordButton = state.panel?.querySelector('[data-forge-auth-password-submit]');
    const passwordLabel = state.panel?.querySelector('[data-forge-auth-password-label]');
    const googleLabel = state.panel?.querySelector('[data-forge-auth-google-label]');
    if (form) form.setAttribute('aria-busy', busy ? 'true' : 'false');
    for (const control of form?.querySelectorAll('input, button') || []) control.disabled = busy;
    if (google) google.disabled = busy;
    if (passwordButton) passwordButton.disabled = busy;
    if (passwordLabel) passwordLabel.textContent = busy && source === 'password' ? 'Comprobando acceso…' : 'Entrar a Forge';
    if (googleLabel) googleLabel.textContent = busy && source === 'google' ? 'Abriendo Google…' : 'Continuar con Google';
  }

  async function startPasswordLogin(event) {
    event?.preventDefault?.();
    if (state.authBusy) return;
    const form = state.panel?.querySelector('[data-forge-auth-form]');
    if (!form) return;
    setPanelError('');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const email = String(form.elements.email?.value || '').trim();
    const password = String(form.elements.password?.value || '');
    setLoginBusy(true, 'password');
    try {
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.signInWithPassword !== 'function') {
        throw Object.assign(new Error('CANONICAL_PASSWORD_AUTH_UNAVAILABLE'), { code: 'CLIENT_UNAVAILABLE' });
      }
      const { data, error } = await bootstrap.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.session?.user?.id) applySession(data.session, 'SIGNED_IN');
    } catch (error) {
      const human = humanAuthError(error);
      setPanelError(human.message, human.code);
      state.panel?.querySelector('input[name="email"]')?.focus();
    } finally {
      setLoginBusy(false);
    }
  }

  async function startGoogleLogin() {
    if (state.authBusy) return;
    setPanelError('');
    setLoginBusy(true, 'google');
    try {
      const bootstrap = await waitForAuthBootstrap();
      if (typeof bootstrap?.signInWithGoogle !== 'function') {
        throw Object.assign(new Error('CANONICAL_AUTH_CLIENT_UNAVAILABLE'), { code: 'CLIENT_UNAVAILABLE' });
      }
      const { error } = await bootstrap.signInWithGoogle({ redirectTo: canonicalRedirectUrl() });
      if (error) throw error;
    } catch (error) {
      const human = humanAuthError(error);
      setPanelError(human.message, human.code);
      setLoginBusy(false);
    }
  }

  async function startTestAdvisorLogin(advisorKey) {
    const adapter = testAdvisorAuthAdapter();
    if (!adapter || !testAdvisorLoginEnabled()) {
      setPanelError('El acceso de prueba no está disponible en esta publicación.', 'TEST_LOGIN_UNAVAILABLE');
      return;
    }
    setPanelError('');
    try {
      await adapter.signInAsAdvisor({ advisorKey });
    } catch (error) {
      const human = humanAuthError(error);
      setPanelError(human.message, human.code);
    }
  }

  async function signOut() {
    setPanelError('', '', true);
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
      setPanelError('No pudimos cerrar la sesión. Intenta nuevamente.', 'SIGN_OUT_ERROR', true);
    } finally {
      if (button?.isConnected) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }

  function togglePasswordVisibility() {
    const input = state.panel?.querySelector('input[name="password"]');
    const toggle = state.panel?.querySelector('[data-forge-auth-password-toggle]');
    if (!input || !toggle) return;
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal ? 'Ocultar' : 'Ver';
    toggle.setAttribute('aria-label', reveal ? 'Ocultar contraseña' : 'Mostrar contraseña');
    toggle.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    input.focus();
  }

  function setAuthThemeColor(active) {
    const meta = global.document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    if (state.themeColorBeforeAuth === null) state.themeColorBeforeAuth = meta.getAttribute('content') || '';
    meta.setAttribute('content', active ? '#F7F8FC' : state.themeColorBeforeAuth || '#F7F8FC');
  }

  function openAuthPanel(options = {}) {
    const panel = ensurePanel();
    if (options.nav) state.requestedNav = options.nav;
    refreshPanel();
    if (panel.hidden) state.lastFocus = global.document.activeElement?.focus ? global.document.activeElement : null;
    panel.hidden = false;
    global.document.body.classList.add('forge-auth-open-067g17b1');
    setAuthThemeColor(true);
    global.setTimeout(() => {
      const focusTarget = panel.querySelector('[data-forge-auth-login-view]:not([hidden]) input[name="email"]')
        || panel.querySelector('[data-forge-auth-profile-view]:not([hidden]) [data-forge-auth-close]')
        || panel.querySelector('.forge-auth-stage-067g17b1');
      focusTarget?.focus?.();
    }, 0);
    global.dispatchEvent(new CustomEvent('forge:auth-panel-opened', {
      detail: { contractId: CONTRACT_ID, designAuthority: DESIGN_AUTHORITY },
    }));
  }

  function closeAuthPanel(options = {}) {
    if (!state.panel) return;
    if (state.status !== 'authenticated' && options.force !== true) return;
    state.panel.hidden = true;
    global.document.body.classList.remove('forge-auth-open-067g17b1');
    setAuthThemeColor(false);
    state.lastFocus?.focus?.();
    global.dispatchEvent(new CustomEvent('forge:auth-panel-closed', {
      detail: { contractId: CONTRACT_ID, designAuthority: DESIGN_AUTHORITY },
    }));
  }

  function init() {
    if (!global.document) return;
    discoverAvatars();
    ensurePanel();
    refreshPanel();
    bootstrapSession();
    global.addEventListener('forge:auth-state-changed', () => global.setTimeout(discoverAvatars, 0));
    global.addEventListener('forge:static-view-changed', () => global.setTimeout(discoverAvatars, 0));
    global.addEventListener('forge:pipeline-rendered', () => global.setTimeout(discoverAvatars, 0));
    global.document.addEventListener('click', (event) => {
      const opener = event.target.closest?.('[data-forge-auth-open]');
      if (!opener) return;
      event.preventDefault();
      openAuthPanel({ nav: opener.getAttribute('data-forge-auth-open-nav') || opener.getAttribute('data-forge-nav-key') || null });
    });
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    designAuthority: DESIGN_AUTHORITY,
    openAuthPanel,
    closeAuthPanel,
    refreshPanel,
    canonicalRedirectUrl,
    signOut,
    diagnostics: () => Object.freeze({
      contractId: CONTRACT_ID,
      designAuthority: DESIGN_AUTHORITY,
      avatarCount: state.avatars.length,
      panelReady: Boolean(state.panel),
      status: state.status,
      advisorId: state.user?.id || null,
      authListenerAttached: Boolean(state.authSubscription),
      passwordSignInAvailable: typeof global.ForgeProductiveProspectBootstrap067G17B?.signInWithPassword === 'function',
      googleSignInAvailable: typeof global.ForgeProductiveProspectBootstrap067G17B?.signInWithGoogle === 'function',
      testAdvisorLoginEnabled: testAdvisorLoginEnabled(),
      testAdvisorLoginAvailable: testAdvisorLoginAvailable(),
      requestedNav: state.requestedNav,
      material3DesignUsed: false,
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
