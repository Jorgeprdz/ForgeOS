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
    requestedNav: null,
    authBusy: false,
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

  function ensurePanel() {
    if (state.panel) return state.panel;
    const backdrop = global.document.createElement('div');
    backdrop.className = 'forge-auth-backdrop-067g17b1';
    backdrop.dataset.forgeAuthPanel = '067g17b1';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <section class="forge-auth-panel-067g17b1" role="dialog" aria-modal="true" aria-labelledby="forge-auth-title-067g17b1" tabindex="-1">
        <header>
          <div>
            <h2 id="forge-auth-title-067g17b1">Iniciar sesión en Forge</h2>
            <p>Accede para consultar tu Pipeline y administrar tus prospectos.</p>
          </div>
          <button type="button" class="forge-auth-close-067g17b1" data-forge-auth-close aria-label="Cerrar panel de autenticación">×</button>
        </header>
        <div class="forge-auth-actions-067g17b1">
          <button type="button" class="forge-auth-primary-067g17b1" data-forge-auth-google>Continuar con Google</button>
        </div>
        <p class="forge-auth-error-067g17b1" data-forge-auth-error role="alert" hidden></p>
        <section class="forge-auth-test-section-067g17b1" data-forge-test-advisors hidden>
          <p class="forge-auth-test-label-067g17b1">Acceso de prueba</p>
          <div class="forge-auth-test-actions-067g17b1">
            <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="A">Asesor A</button>
            <button type="button" class="forge-auth-secondary-067g17b1" data-forge-test-advisor="B">Asesor B</button>
          </div>
        </section>
        <footer>
          <button type="button" class="forge-auth-secondary-067g17b1" data-forge-auth-close>Cancelar</button>
        </footer>
      </section>`;
    global.document.body.append(backdrop);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-forge-auth-close]')) closeAuthPanel();
      if (event.target.closest('[data-forge-auth-google]')) startGoogleLogin();
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
    const testSection = panel.querySelector('[data-forge-test-advisors]');
    if (testSection) testSection.hidden = !testAdvisorLoginAvailable();
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
      const bootstrap = global.ForgeProductiveProspectBootstrap067G17B;
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
    diagnostics: () => Object.freeze({
      contractId: CONTRACT_ID,
      avatarCount: state.avatars.length,
      panelReady: Boolean(state.panel),
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
