import { expect, test } from '@playwright/test';

const mockSupabaseSdk = `
window.supabase = {
  createClient() {
    const subscription = { unsubscribe() {} };
    return {
      auth: {
        onAuthStateChange() { return { data: { subscription } }; },
        async getSession() { return { data: { session: null }, error: null }; },
        async signOut() { return { error: null }; },
        async signInWithPassword() { return { data: { session: null, user: null }, error: null }; },
        async signInWithOAuth(input) {
          window.__auraLastOAuth = input;
          return { data: {}, error: null };
        },
      },
    };
  },
};
`;

async function prepare(page) {
  const pageErrors = [];
  const critical404 = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:4174' && response.status() >= 400) {
      critical404.push(`${response.status()} ${url.pathname}`);
    }
  });
  await page.route('https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: mockSupabaseSdk }),
  );
  return { pageErrors, critical404 };
}

async function assertAuraEntry(page, errors) {
  await expect.poll(() => page.url(), { timeout: 8_000 }).toContain('/static-preview/forge-aura/');
  expect(page.url()).not.toContain('/static-preview/forge-alive/');
  await expect(page.locator('html')).toHaveAttribute('data-aura-runtime', 'FORGE_AURA_LIGHT_2026_V4');
  await expect(page.getByRole('heading', { name: 'Clara y lista para avanzar.' })).toBeVisible();
  await expect(page.locator('[data-aura-auth-state="AUTH_REQUIRED"]')).toBeVisible();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.critical404).toEqual([]);
}

test('010H desktop root converges to Aura auth entry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await prepare(page);
  await page.goto('/?nav=inicio');
  await assertAuraEntry(page, errors);
});

test('010H mobile root converges to Aura without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await prepare(page);
  await page.goto('/');
  await assertAuraEntry(page, errors);
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
});

test('010H Quotes deep route survives Aura Google OAuth handoff', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto('/?nav=cotizaciones');
  await assertAuraEntry(page, errors);

  const loginUrl = new URL(page.url());
  expect(loginUrl.searchParams.get('route')).toBe('login');
  expect(loginUrl.searchParams.get('return_route')).toBe('cotizaciones');
  expect(loginUrl.searchParams.get('nav')).toBeNull();

  await page.getByRole('button', { name: 'Continuar con Google' }).click();
  await expect.poll(() => page.evaluate(() => window.__auraLastOAuth?.options?.redirectTo || ''))
    .toContain('oauth-callback-v4.html');

  const redirectTo = await page.evaluate(() => window.__auraLastOAuth.options.redirectTo);
  const callback = new URL(redirectTo);
  expect(callback.pathname).toContain('/static-preview/forge-aura/oauth-callback-v4.html');
  expect(callback.searchParams.get('return_route')).toBe('cotizaciones');
  expect(errors.pageErrors).toEqual([]);
  expect(errors.critical404).toEqual([]);
});
