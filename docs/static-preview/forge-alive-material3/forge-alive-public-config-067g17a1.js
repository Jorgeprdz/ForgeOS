(function forgeAlivePublicConfig067G17A1(global) {
  'use strict';

  const CONTRACT_ID = 'FORGE_ALIVE_PUBLIC_CONFIG_067G17A1_V1';
  const ALLOWED_KEYS = Object.freeze(['SUPABASE_URL', 'SUPABASE_KEY', 'DEMO_MODE', 'ENABLE_TEST_ADVISOR_LOGIN']);

  function normalizedString(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function resolveConfig(input) {
    const source = input && typeof input === 'object' ? input : {};
    const demoMode = source.DEMO_MODE === true || normalizedString(source.DEMO_MODE).toLowerCase() === 'true';
    const supabaseUrl = normalizedString(source.SUPABASE_URL);
    const supabaseKey = normalizedString(source.SUPABASE_KEY);
    const enableTestAdvisorLogin = normalizedString(source.ENABLE_TEST_ADVISOR_LOGIN).toLowerCase() === 'true';
    const configured = Boolean(supabaseUrl && supabaseKey);
    const publicConfig = Object.freeze({
      SUPABASE_URL: supabaseUrl,
      SUPABASE_KEY: supabaseKey,
      DEMO_MODE: demoMode ? 'true' : 'false',
      ENABLE_TEST_ADVISOR_LOGIN: enableTestAdvisorLogin ? 'true' : 'false'
    });

    if (demoMode) {
      return Object.freeze({
        contractId: CONTRACT_ID,
        state: 'DEMO_EXPLICIT',
        demoMode: true,
        configured,
        canInitializePublicClient: false,
        productiveProspectCrudAuthorized: false,
        testAdvisorLoginAuthorized: enableTestAdvisorLogin,
        reason: 'DEMO_MODE_EXPLICIT',
        publicConfig
      });
    }

    if (!configured) {
      return Object.freeze({
        contractId: CONTRACT_ID,
        state: 'BLOCKED',
        demoMode: false,
        configured: false,
        canInitializePublicClient: false,
        productiveProspectCrudAuthorized: false,
        testAdvisorLoginAuthorized: enableTestAdvisorLogin,
        reason: !supabaseUrl && !supabaseKey ? 'PUBLIC_CONFIG_MISSING' : 'PUBLIC_CONFIG_INCOMPLETE',
        publicConfig
      });
    }

    return Object.freeze({
      contractId: CONTRACT_ID,
      state: 'READY',
      demoMode: false,
      configured: true,
      canInitializePublicClient: true,
      productiveProspectCrudAuthorized: true,
      testAdvisorLoginAuthorized: enableTestAdvisorLogin,
      reason: null,
      publicConfig
    });
  }

  function renderState(result, documentRef) {
    if (!documentRef?.documentElement || result.state === 'READY') return;
    documentRef.documentElement.dataset.forgePublicConfigState = result.state.toLowerCase();
    if (result.state !== 'BLOCKED') return;
    if (documentRef.querySelector('[data-forge-public-config-state="067g17a1"]')) return;

    const notice = documentRef.createElement('section');
    notice.dataset.forgePublicConfigState = '067g17a1';
    notice.setAttribute('role', result.state === 'BLOCKED' ? 'alert' : 'status');
    notice.style.cssText = 'box-sizing:border-box;width:100%;padding:12px 18px;border:1px solid currentColor;background:#101827;color:#f8fafc;font:600 14px/1.4 Inter,system-ui,sans-serif;text-align:center;';
    notice.textContent = 'Forge está bloqueado: falta la configuración pública requerida. No se usarán datos demo ni acceso productivo.';
    documentRef.body.prepend(notice);
  }

  const result = resolveConfig(global.__ENV__);
  const api = Object.freeze({
    contractId: CONTRACT_ID,
    allowedKeys: ALLOWED_KEYS,
    resolveConfig,
    current: () => result,
    allowsDemoFixtures: () => result.state === 'DEMO_EXPLICIT',
    allowsPublicClientInitialization: () => result.canInitializePublicClient === true,
    allowsProductiveProspectCrud: () => result.state === 'READY' && result.productiveProspectCrudAuthorized === true,
    allowsTestAdvisorLogin: () => result.testAdvisorLoginAuthorized === true
  });

  global.ForgeAlivePublicConfig067G17A1 = api;
  global.__FORGE_PUBLIC_CONFIG_STATE__ = result;

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', () => renderState(result, global.document), { once: true });
    } else {
      renderState(result, global.document);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
