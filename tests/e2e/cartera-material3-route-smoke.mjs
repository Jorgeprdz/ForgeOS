import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.FORGE_CARTERA_M3_URL
  || 'http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/?nav=cartera';
const artifactDir = 'artifacts/cartera-material3-route-smoke';
mkdirSync(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function verifyProfile(name, viewport) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    globalThis.ForgeProductiveProspectBootstrap067G17B = Object.freeze({
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async getClient() {
        throw new Error('ANONYMOUS_CLIENT_MUST_NOT_BE_REQUESTED');
      },
    });
  });

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const carteraButton = page.locator('[data-route-id="cartera"]');
  await carteraButton.waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('[data-forge-cartera-module]').waitFor({ state: 'visible' });
  await page.locator('[data-cartera-material3-state="auth-required"]').waitFor({
    state: 'visible',
    timeout: 10_000,
  });

  const state = await page.evaluate(() => {
    const application = document.querySelector('[data-forge-application]');
    const nav = document.querySelector('[data-forge-nav-pill]');
    const button = document.querySelector('[data-route-id="cartera"]');
    const module = document.querySelector('[data-forge-cartera-module]');
    const viewport = document.querySelector('[data-forge-module-viewport]');
    const app = document.querySelector('.app');
    const navStyle = nav ? getComputedStyle(nav) : null;
    const appStyle = app ? getComputedStyle(app) : null;
    return {
      href: location.href,
      shellRoute: application?.dataset.forgeRoute,
      viewportRoute: viewport?.dataset.activeRoute,
      navigationCount: nav?.querySelectorAll('[data-route-id]').length || 0,
      carteraActive: button?.classList.contains('active') || false,
      carteraCurrent: button?.getAttribute('aria-current'),
      carteraLabel: button?.textContent?.trim(),
      moduleVisible: Boolean(module && !module.hidden),
      moduleState: module?.dataset.carteraMaterial3State,
      authButtonVisible: Boolean(module?.querySelector('[data-forge-auth-open]')),
      navPosition: navStyle?.position,
      navColumns: navStyle?.gridTemplateColumns,
      appPaddingBottom: appStyle?.paddingBottom,
      navRect: nav?.getBoundingClientRect().toJSON?.() || null,
      moduleRect: module?.getBoundingClientRect().toJSON?.() || null,
    };
  });

  if (!state.href.includes('nav=cartera')) throw new Error(`${name}:URL_NOT_CARTERA`);
  if (state.shellRoute !== 'cartera') throw new Error(`${name}:SHELL_ROUTE_NOT_CARTERA`);
  if (state.viewportRoute !== 'cartera') throw new Error(`${name}:VIEWPORT_ROUTE_NOT_CARTERA`);
  if (state.navigationCount !== 5) throw new Error(`${name}:NAV_COUNT_${state.navigationCount}`);
  if (!state.carteraActive || state.carteraCurrent !== 'page') {
    throw new Error(`${name}:CARTERA_BUTTON_NOT_ACTIVE`);
  }
  if (state.carteraLabel !== 'Cartera') throw new Error(`${name}:CARTERA_LABEL_INVALID`);
  if (!state.moduleVisible || state.moduleState !== 'auth-required') {
    throw new Error(`${name}:HONEST_AUTH_STATE_MISSING`);
  }
  if (!state.authButtonVisible) throw new Error(`${name}:AUTH_ACTION_MISSING`);
  if (name === 'mobile' && state.navPosition !== 'fixed') {
    throw new Error('mobile:FLOATING_NAV_NOT_PRESERVED');
  }

  await page.screenshot({
    path: `${artifactDir}/${name}.png`,
    fullPage: true,
  });
  writeFileSync(
    `${artifactDir}/${name}.json`,
    `${JSON.stringify({ state, consoleErrors }, null, 2)}\n`,
  );
  results.push({ name, ...state, consoleErrors });
  await page.close();
}

try {
  await verifyProfile('mobile', { width: 412, height: 915 });
  await verifyProfile('tablet', { width: 1024, height: 768 });
  await verifyProfile('desktop', { width: 1440, height: 900 });
  writeFileSync(
    `${artifactDir}/summary.json`,
    `${JSON.stringify({ status: 'PASS', results }, null, 2)}\n`,
  );
  console.log('CARTERA_MATERIAL3_BROWSER_ROUTE=PASS');
  console.log('CARTERA_MATERIAL3_MOBILE=PASS');
  console.log('CARTERA_MATERIAL3_TABLET=PASS');
  console.log('CARTERA_MATERIAL3_DESKTOP=PASS');
  console.log('CARTERA_MATERIAL3_FLOATING_NAV=PASS');
  console.log('CARTERA_MATERIAL3_HONEST_AUTH_STATE=PASS');
} catch (error) {
  writeFileSync(
    `${artifactDir}/summary.json`,
    `${JSON.stringify({ status: 'FAIL', error: error.message, results }, null, 2)}\n`,
  );
  throw error;
} finally {
  await browser.close();
}
