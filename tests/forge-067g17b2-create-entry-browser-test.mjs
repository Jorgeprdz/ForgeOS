import assert from 'node:assert/strict';
import http from 'node:http';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G17B2_EVIDENCE_DIR || '/tmp/forge-067g17b2-create-browser';
assert.ok(puppeteerPath, 'FORGE_PUPPETEER_CORE_PATH_REQUIRED');
assert.ok(chromiumPath, 'FORGE_CHROMIUM_PATH_REQUIRED');

const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
mkdirSync(evidenceDir, { recursive: true });

const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const relative = pathname === '/' ? 'tests/fixture.html' : pathname.replace(/^\/+/, '');
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote'],
});

const report = { status: 'PASS', checks: [] };
function record(name, status, details = {}) {
  report.checks.push({ name, status, ...details });
}

async function loadHarness(page, viewport = { width: 390, height: 844, isMobile: true, hasTouch: true }) {
  await page.setViewport({ deviceScaleFactor: 1, ...viewport });
  await page.goto(`${baseUrl}/tests/forge-067g17b2-create-entry-harness.html`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('[data-productive-prospect-pipeline="067g17b"]');
}

async function clickVisible(page, selector, index = 0) {
  const result = await page.evaluate(({ selector, index }) => {
    const visible = Array.from(document.querySelectorAll(selector)).filter(node => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.pointerEvents !== 'none';
    });
    const node = visible[index];
    if (!node) return { ok: false, count: visible.length };
    node.click();
    return { ok: true, count: visible.length, text: node.textContent.trim() };
  }, { selector, index });
  assert.equal(result.ok, true, `CLICK_TARGET_MISSING:${selector}:${index}`);
  return result;
}

async function submitForm(page, suffix) {
  const result = await page.evaluate(suffix => {
    const dialog = document.querySelector('[data-prospect-form-dialog][open]');
    const form = dialog?.querySelector('[data-prospect-form]');
    if (!form) return { ok: false, reason: 'FORM_MISSING' };
    const values = {
      fullName: `067G17B2 Browser ${suffix}`,
      phone: '+525500000001',
      whatsapp: '+525500000001',
      source: 'Referido',
      referrerName: 'Fixture Referente',
      referrerRelationship: 'Colega',
      initialContext: 'Fixture controlado para crear prospecto productivo',
      nextActionType: 'Llamada breve',
    };
    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (!field) return { ok: false, reason: `${name}_MISSING` };
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
    form.requestSubmit();
    return { ok: true };
  }, suffix);
  assert.equal(result.ok, true, result.reason || 'FORM_FILL_FAILED');
}

try {
  const page = await browser.newPage();
  page.on('pageerror', error => { throw error; });
  page.on('console', message => {
    if (message.type() === 'error') throw new Error(message.text());
  });

  await loadHarness(page);
  const buttons = await page.$$eval('[data-add-prospect]', nodes => nodes.map(node => node.textContent.trim()));
  assert.deepEqual(buttons, ['+ Agregar prospecto', 'Agregar prospecto']);
  record('BOTH_ADD_BUTTONS_VISIBLE', 'PASS');

  await clickVisible(page, '[data-add-prospect]', 0);
  await page.waitForSelector('[data-prospect-form-dialog][open] [name="fullName"]');
  assert.equal(await page.$$eval('[data-prospect-form-dialog][open]', nodes => nodes.length), 1);
  record('TOP_ADD_PROSPECT_CLICK', 'PASS');

  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-close-prospect-form]')?.click());
  await page.waitForFunction(() => !document.querySelector('[data-prospect-form-dialog]'));
  await clickVisible(page, '[data-add-prospect]', 1);
  await page.waitForSelector('[data-prospect-form-dialog][open] [name="fullName"]');
  record('EMPTY_ADD_PROSPECT_CLICK', 'PASS');

  await page.evaluate(() => {
    document.querySelector('[data-close-prospect-form]')?.click();
    document.querySelectorAll('[data-add-prospect]')[0]?.click();
    document.querySelectorAll('[data-add-prospect]')[0]?.click();
  });
  await page.waitForSelector('[data-prospect-form-dialog][open]');
  assert.equal(await page.$$eval('[data-prospect-form-dialog][open]', nodes => nodes.length), 1);
  record('DOUBLE_CLICK_DOES_NOT_OPEN_TWO_DIALOGS', 'PASS');

  await page.evaluate(() => document.querySelector('[data-close-prospect-form]')?.click());
  await page.focus('[data-add-prospect]');
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-prospect-form-dialog][open] [name="fullName"]');
  record('TOP_ADD_PROSPECT_KEYBOARD', 'PASS');

  await submitForm(page, 'A');
  await page.waitForSelector('[data-prospect-detail-dialog][open]');
  assert.match(await page.$eval('[data-prospect-detail-dialog] .forge-pipeline-product', node => node.textContent), /Referido nuevo/);
  assert.equal(await page.$eval('.forge-pipeline-card h3', node => node.textContent), '067G17B2 Browser A');
  assert.equal(await page.evaluate(() => window.__FORGE_067G17B2_SERVICE_LOG.createCalls), 1);
  record('PRODUCTIVE_CREATE_AND_DETAIL_AUTO_OPEN', 'PASS');

  await page.evaluate(() => window.__FORGE_067G17B2_PIPELINE.load());
  await page.waitForSelector('[data-add-prospect]');
  await clickVisible(page, '[data-add-prospect]', 0);
  await page.waitForSelector('[data-prospect-form-dialog][open]');
  record('RERENDER_PRESERVES_ACTION', 'PASS');

  await page.evaluate(() => {
    window.__FORGE_067G17B2_PIPELINE = window.ForgeProductiveProspectUI067G17B.create({
      client: window.__FORGE_067G17B2_CLIENT,
      root: document.querySelector('[data-harness-root]'),
    });
    return window.__FORGE_067G17B2_PIPELINE.load();
  });
  await page.waitForSelector('[data-add-prospect]');
  await clickVisible(page, '[data-add-prospect]', 0);
  await page.waitForSelector('[data-prospect-form-dialog][open]');
  const diagnostics = await page.evaluate(() => window.__FORGE_067G17B2_PIPELINE.diagnostics());
  assert.equal(diagnostics.listenerAuthority, 'root-delegated-abort-controller');
  record('REMOUNT_PRESERVES_SINGLE_AUTHORITY', 'PASS', diagnostics);

  await loadHarness(page, { width: 360, height: 800, isMobile: true, hasTouch: true });
  const geometry = await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('[data-add-prospect]')).find(node => node.textContent.trim() === 'Agregar prospecto');
    const state = document.querySelector('.forge-pipeline-state');
    const b = button.getBoundingClientRect();
    const s = state.getBoundingClientRect();
    return {
      width: b.width,
      height: b.height,
      overlapsCopy: !(b.top >= s.bottom || b.bottom <= s.top || b.left >= s.right || b.right <= s.left),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  assert.ok(geometry.width >= 120 && geometry.width <= 280, 'EMPTY_CTA_WIDTH_REASONABLE');
  assert.ok(geometry.height >= 44 && geometry.height <= 60, 'EMPTY_CTA_HEIGHT_REASONABLE');
  assert.equal(geometry.overlapsCopy, false, 'EMPTY_CTA_OVERLAPS_COPY');
  assert.equal(geometry.overflow, false, 'HORIZONTAL_OVERFLOW_PRESENT');
  record('EMPTY_CTA_GEOMETRY', 'PASS', geometry);

  writeFileSync(join(evidenceDir, '067g17b2-create-entry-browser-report.json'), JSON.stringify(report, null, 2));
  console.log('067G17B2 CREATE ENTRY BROWSER: PASS');
} finally {
  await browser.close();
  server.close();
}
