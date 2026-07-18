import assert from 'node:assert/strict';
import http from 'node:http';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G17B1_EVIDENCE_DIR || '/tmp/forge-067g17b1-auth-browser';
assert.ok(puppeteerPath, 'FORGE_PUPPETEER_CORE_PATH_REQUIRED');
assert.ok(chromiumPath, 'FORGE_CHROMIUM_PATH_REQUIRED');
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
mkdirSync(evidenceDir, { recursive: true });

const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  if (pathname === '/env.js') {
    response.writeHead(200, { 'Content-Type':'text/javascript', 'Cache-Control':'no-store' });
    response.end("window.__ENV__=Object.freeze({SUPABASE_URL:'https://rmlxigxysujsuwzgoimv.supabase.co',SUPABASE_KEY:'public-anon-placeholder',DEMO_MODE:'false',ENABLE_TEST_ADVISOR_LOGIN:'false'});");
    return;
  }
  const publicPath = pathname === '/' ? 'static-preview/forge-alive/index.html' : pathname.replace(/^\/+/, '');
  const relative = publicPath.startsWith('advisor-os/') ? publicPath : join('docs', publicPath);
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/static-preview/forge-alive/`;

const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-breakpad','--disable-crash-reporter'],
});
const report = { status:'PASS', checks:[], consoleErrors:[] };

function record(name, status, details = {}) {
  report.checks.push({ name, status, ...details });
}

async function installSupabaseStub(page) {
  await page.evaluateOnNewDocument(() => {
    const state = { session: null, authCallback: null, oauthArgs: null, signOutCount: 0 };
    const query = {
      select() { return this; },
      eq() { return this; },
      is() { return this; },
      order() { return Promise.resolve({ data: [], error: null }); },
      single() { return Promise.resolve({ data: null, error: null }); },
      insert() { return this; },
      update() { return this; },
    };
    window.__FORGE_TEST_SUPABASE_STATE = state;
    window.supabase = {
      createClient(url, key, options) {
        state.createClient = { url, keyPresent: Boolean(key), options };
        return {
          auth: {
            getSession: async () => ({ data: { session: state.session }, error: null }),
            getUser: async () => ({ data: { user: state.session?.user || null }, error: null }),
            signInWithOAuth: async (args) => { state.oauthArgs = args; return { data: {}, error: null }; },
            signOut: async () => {
              state.signOutCount += 1;
              state.session = null;
              if (state.authCallback) state.authCallback('SIGNED_OUT', null);
              return { error: null };
            },
            onAuthStateChange: (callback) => {
              state.authCallback = callback;
              return { data: { subscription: { unsubscribe() { state.unsubscribed = true; } } } };
            },
          },
          from: () => query,
        };
      },
    };
  });
}

async function waitForAuth(page, status) {
  await page.waitForFunction(expected => globalThis.ForgeAliveAuthEntry067G17B1?.diagnostics?.().status === expected, {}, status);
}

async function visibleText(page, selector) {
  return page.$$eval(selector, (nodes, selectorText) => {
    const visible = node => Boolean(node.getClientRects().length) && getComputedStyle(node).visibility !== 'hidden';
    const node = nodes.find(visible);
    if (!node) throw new Error(`VISIBLE_TEXT_TARGET_MISSING:${selectorText}`);
    return node.textContent.replace(/\s+/g, ' ').trim();
  }, selector);
}

async function clickVisible(page, selector) {
  const handles = await page.$$(selector);
  for (const handle of handles) {
    const box = await handle.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      await handle.click();
      return;
    }
  }
  throw new Error(`VISIBLE_CLICK_TARGET_MISSING:${selector}`);
}

async function assertNoHorizontalOverflow(page, name) {
  const metrics = await page.evaluate(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    panel: (() => {
      const node = document.querySelector('[data-forge-auth-panel]');
      if (!node || node.hidden) return null;
      const r = node.getBoundingClientRect();
      return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
    })(),
  }));
  assert.ok(metrics.scrollWidth <= metrics.innerWidth + 1, `${name}_DOCUMENT_HORIZONTAL_OVERFLOW`);
  assert.ok(metrics.bodyScrollWidth <= metrics.innerWidth + 1, `${name}_BODY_HORIZONTAL_OVERFLOW`);
  if (metrics.panel) {
    assert.ok(metrics.panel.left >= -1 && metrics.panel.right <= metrics.innerWidth + 1, `${name}_AUTH_PANEL_OVERFLOW`);
  }
  record(name, 'PASS', metrics);
}

try {
  const page = await browser.newPage();
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
  await installSupabaseStub(page);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(`${baseUrl}?nav=inicio&v=067g17b1-remote`, { waitUntil: 'networkidle0', timeout: 30000 });
  await waitForAuth(page, 'anonymous');

  const avatarText = await visibleText(page, '[data-forge-auth-avatar="067g17b1"]');
  assert.equal(avatarText, 'F');
  record('AVATAR_F_VISIBLE_WHEN_ANONYMOUS', 'PASS');

  await clickVisible(page, '[data-forge-auth-avatar="067g17b1"]');
  await page.waitForSelector('[data-forge-auth-panel]:not([hidden])');
  assert.match(await visibleText(page, '[data-forge-auth-panel]'), /Continuar con Google/);
  assert.equal(await page.$('[data-forge-test-advisors]:not([hidden])'), null);
  record('AUTH_PANEL_OPENS_AND_TEST_ADVISORS_GATED', 'PASS');
  await assertNoHorizontalOverflow(page, 'AUTH_PANEL_MOBILE_390');

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('[data-forge-auth-panel]')?.hidden === true);
  record('AUTH_PANEL_CLOSE', 'PASS');

  await page.goto(`${baseUrl}?nav=pipeline&v=067g17b1-remote`, { waitUntil: 'networkidle0', timeout: 30000 });
  await waitForAuth(page, 'anonymous');
  await page.waitForSelector('[data-forge-auth-open="pipeline"]');
  assert.equal(await page.$('[data-add-prospect]'), null);
  record('PIPELINE_ANONYMOUS_LOGIN_ACTION', 'PASS');

  await page.click('[data-forge-auth-open="pipeline"]');
  await page.waitForSelector('[data-forge-auth-panel]:not([hidden])');
  await page.click('[data-forge-auth-google]');
  const oauth = await page.evaluate(() => window.__FORGE_TEST_SUPABASE_STATE.oauthArgs);
  assert.equal(oauth.provider, 'google');
  assert.match(oauth.options.redirectTo, /\/static-preview\/forge-alive\//);
  assert.match(oauth.options.redirectTo, /nav=pipeline/);
  record('GOOGLE_OAUTH_CONTRACT', 'PASS', { redirectTo: oauth.options.redirectTo });

  await page.evaluate(() => {
    const session = {
      user: {
        id: 'advisor-a-auth-uid',
        email: 'advisor.a@example.test',
        app_metadata: { provider: 'google' },
        user_metadata: { full_name: 'Advisor A Remote', avatar_url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==' },
      },
    };
    window.__FORGE_TEST_SUPABASE_STATE.session = session;
    window.__FORGE_TEST_SUPABASE_STATE.authCallback('SIGNED_IN', session);
  });
  await waitForAuth(page, 'authenticated');
  await page.waitForSelector('[data-add-prospect]');
  const advisorId = await page.evaluate(() => globalThis.ForgeAliveAuthEntry067G17B1.diagnostics().advisorId);
  assert.equal(advisorId, 'advisor-a-auth-uid');
  record('SIGNED_IN_PIPELINE_RECOVERY_AND_ADD_PROSPECT', 'PASS');

  await clickVisible(page, '[data-forge-auth-avatar="067g17b1"]');
  await page.waitForSelector('[data-forge-auth-profile-view]:not([hidden])');
  assert.match(await visibleText(page, '[data-forge-auth-panel]'), /Advisor A Remote/);
  assert.match(await visibleText(page, '[data-forge-auth-panel]'), /advisor\.a@example\.test/);
  assert.match(await visibleText(page, '[data-forge-auth-panel]'), /Cuenta de Google/);
  record('PROFILE_PANEL_AUTHENTICATED', 'PASS');

  await page.click('[data-forge-auth-signout]');
  await waitForAuth(page, 'anonymous');
  await page.waitForFunction(() => document.querySelector('[data-add-prospect]') === null);
  assert.equal(await visibleText(page, '[data-forge-auth-avatar="067g17b1"]'), 'F');
  record('LOGOUT_CLEARS_VISIBLE_PRODUCTIVE_STATE', 'PASS');

  const viewports = [
    ['mobile_360', 360, 800, true],
    ['mobile_390', 390, 844, true],
    ['tablet_768', 768, 1024, true],
    ['desktop_1366', 1366, 768, false],
    ['desktop_1440', 1440, 900, false],
    ['mobile_landscape', 844, 390, true],
    ['tablet_landscape', 1024, 768, false],
    ['desktop_1280', 1280, 800, false],
    ['desktop_1536', 1536, 864, false],
  ];
  for (const [name, width, height, touch] of viewports) {
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
    await page.goto(`${baseUrl}?nav=inicio&v=067g17b1-${name}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitForAuth(page, 'anonymous');
    await clickVisible(page, '[data-forge-auth-avatar="067g17b1"]');
    await page.waitForSelector('[data-forge-auth-panel]:not([hidden])');
    await assertNoHorizontalOverflow(page, `VIEWPORT_${name}`);
  }

  for (const zoom of [100, 100, 100, 125, 125, 125]) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(`${baseUrl}?nav=inicio&v=067g17b1-zoom-${zoom}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(value => { document.documentElement.style.zoom = String(value / 100); }, zoom);
    await waitForAuth(page, 'anonymous');
    await clickVisible(page, '[data-forge-auth-avatar="067g17b1"]');
    await page.waitForSelector('[data-forge-auth-panel]:not([hidden])');
    await assertNoHorizontalOverflow(page, `ZOOM_${zoom}`);
  }

  assert.deepEqual(report.consoleErrors, [], 'CONSOLE_ERRORS_ABSENT');
} catch (error) {
  report.status = 'FAIL';
  report.error = { message: error.message, stack: error.stack };
  throw error;
} finally {
  writeFileSync(join(evidenceDir, 'forge-067g17b1-auth-entry-browser-report.json'), JSON.stringify(report, null, 2));
  await browser.close().catch(() => {});
  server.close();
}

console.log('067G17B1 AUTH ENTRY BROWSER: PASS');
