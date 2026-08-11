import { expect, test } from '@playwright/test';

const canonical = process.env.FORGE_PUBLIC_AURA_URL || 'https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/';
const goalAuthorityUrl = new URL('../forge-alive/home-authorities/repo/advisor-os/forge-alive/smart-widgets/advisor-monthly-policy-goal-repository.mjs', canonical).href;
const authenticatedUser = Object.freeze({
  id: '015r-acceptance-advisor',
  email: 'acceptance@forge.invalid',
  user_metadata: { given_name: 'Asesor', full_name: 'Asesor de aceptación' },
});

const mockSupabaseSdk = `
(() => {
  const user = ${JSON.stringify(authenticatedUser)};
  const emptyResult = Object.freeze({ data: [], error: null });
  function query() {
    const chain = new Proxy({}, {
      get(_target, property) {
        if (property === 'then') return (resolve) => Promise.resolve(emptyResult).then(resolve);
        if (property === 'single' || property === 'maybeSingle') return async () => ({ data: null, error: null });
        return () => chain;
      },
    });
    return chain;
  }
  window.supabase = {
    createClient() {
      const subscription = { unsubscribe() {} };
      return {
        auth: {
          onAuthStateChange() { return { data: { subscription } }; },
          async getSession() { return { data: { session: { user, access_token: '015r-controlled-session' } }, error: null }; },
          async getUser() { return { data: { user }, error: null }; },
          async signOut() { return { error: null }; },
        },
        from() { return query(); },
        rpc() { return query(); },
        functions: { async invoke() { return { data: [], error: null }; } },
      };
    },
  };
})();
`;

async function prepareAuthenticatedRuntime(page) {
  const errors = [];
  const failedModules = [];
  page.on('pageerror', error => errors.push(String(error?.message || error)));
  page.on('response', response => {
    if (response.status() >= 400 && /\.(?:js|mjs)(?:\?|$)/.test(response.url())) {
      failedModules.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.route('https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js', route => (
    route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: mockSupabaseSdk })
  ));
  return { errors, failedModules };
}

async function assertHomeReady(page, runtime) {
  await expect(page.locator('[data-aura-main]')).toHaveAttribute('data-aura-route-state', 'READY', { timeout: 30_000 });
  await expect(page.locator('[data-commercial-compass-015]')).toBeVisible();
  await expect(page.getByText('No pudimos cargar Inicio')).toHaveCount(0);
  expect(runtime.failedModules).toEqual([]);
  expect(runtime.errors.filter(value => /Failed to fetch dynamically imported module|404/i.test(value))).toEqual([]);
}

test('cold load, reload and module return use the canonical Pages runtime', async ({ page, request }) => {
  const goalAuthority = await request.get(goalAuthorityUrl);
  expect(goalAuthority.status()).toBe(200);
  expect(await goalAuthority.text()).toContain('createAdvisorMonthlyPolicyGoalRepository');
  const runtime = await prepareAuthenticatedRuntime(page);
  await page.goto(`${canonical}?route=inicio`, { waitUntil: 'domcontentloaded' });
  await assertHomeReady(page, runtime);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await assertHomeReady(page, runtime);
  await page.locator('[data-aura-route-link="pipeline"]:visible').first().click();
  await expect(page.locator('[data-aura-shell]')).toHaveAttribute('data-aura-active-route', 'pipeline');
  await page.locator('[data-aura-route-link="inicio"]:visible').first().click();
  await assertHomeReady(page, runtime);
});
