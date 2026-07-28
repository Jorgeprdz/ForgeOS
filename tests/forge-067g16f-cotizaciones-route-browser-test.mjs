import assert from 'node:assert/strict';
import http from 'node:http';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G16F_EVIDENCE_DIR;
assert.ok(puppeteerPath && chromiumPath && evidenceDir, 'browser paths and evidence directory are required');
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
mkdirSync(evidenceDir, { recursive:true });

const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  if (pathname === '/env.js') {
    response.writeHead(200, { 'Content-Type':'text/javascript', 'Cache-Control':'no-store' });
    response.end("window.__ENV__={DEMO_MODE:'true',SUPABASE_URL:'',SUPABASE_KEY:''};");
    return;
  }
  const publicPath = pathname === '/' ? 'static-preview/forge-alive/index.html' : pathname.replace(/^\/+/, '');
  const rootRuntime = /^(advisor-os|nash|platform)\//.test(publicPath);
  const relative = rootRuntime ? publicPath : join('docs', publicPath);
  const candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
    response.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/static-preview/forge-alive/`;

const browser = await puppeteer.launch({ executablePath:chromiumPath, headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote'] });
const report = { status:'PASS', scenarios:[], consoleErrors:[] };

async function state(page) {
  return page.evaluate(() => {
    const visible = node => Boolean(node?.getClientRects().length) && getComputedStyle(node).visibility !== 'hidden';
    const cotizaciones = document.querySelector('[data-forge-saas-module-host-r16c5l="cotizaciones"]');
    const pipeline = document.querySelector('[data-forge-alive-primary-outlet-067g16a]');
    const primaryNav = document.querySelector(
      matchMedia('(min-width: 901px)').matches
        ? '.dw-nav-056y'
        : '[data-forge-mobile-nav-r16c5j]',
    );
    const activeItems = Array.from(primaryNav?.querySelectorAll('[aria-current="page"], .active, .is-active') || []);
    return {
      href:location.href,
      nav:new URL(location.href).searchParams.get('nav'),
      module:new URL(location.href).searchParams.get('module'),
      hash:location.hash,
      cotizacionesVisible:visible(cotizaciones),
      cotizacionesDisplay:cotizaciones ? getComputedStyle(cotizaciones).display : null,
      cotizacionesParent:cotizaciones?.parentElement?.className || null,
      cotizacionesParentDisplay:cotizaciones?.parentElement ? getComputedStyle(cotizaciones.parentElement).display : null,
      cotizacionesGrandparent:cotizaciones?.parentElement?.parentElement?.className || null,
      cotizacionesGrandparentTag:cotizaciones?.parentElement?.parentElement?.tagName || null,
      workspaceStyle:cotizaciones?.parentElement?.getAttribute('style') || null,
      shellClass:document.querySelector('.phone-shell')?.className || null,
      fastStylePresent:Boolean(document.getElementById('forge-saas-module-fastpath-style-r16j1c1')),
      pipelineVisible:visible(pipeline) && Boolean(pipeline?.querySelector('#forge-pipeline-title')),
      bodyModule:document.body.dataset.forgeSaasActiveModuleR16c5l || null,
      activeKeys:activeItems.map(node => node.dataset.forgeNavKey || node.dataset.forgeStaticView || node.dataset.forgePrimaryNavKey).filter(Boolean),
    };
  });
}

async function waitForRoute(page, nav) {
  try {
    await page.waitForFunction(expected => {
      const url = new URL(location.href);
      const visible = node => Boolean(node?.getClientRects().length) && getComputedStyle(node).visibility !== 'hidden';
      if (url.searchParams.get('nav') !== expected || url.searchParams.has('module') || location.hash) return false;
      if (expected === 'cotizaciones') return visible(document.querySelector('[data-forge-saas-module-host-r16c5l="cotizaciones"]'));
      return globalThis.ForgeAliveStaticView067G16A?.current() === expected && visible(document.querySelector('[data-forge-alive-primary-outlet-067g16a]'));
    }, {}, nav);
  } catch (error) {
    error.routeState = await state(page);
    throw error;
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function assertRoute(result, expected) {
  assert.equal(result.nav, expected);
  assert.equal(result.module, null);
  assert.equal(result.hash, '');
  assert.deepEqual(result.activeKeys, [expected]);
  assert.equal(result.cotizacionesVisible, expected === 'cotizaciones', JSON.stringify(result));
  assert.equal(result.pipelineVisible, expected === 'pipeline');
}

async function load(page, suffix, viewport) {
  await page.setViewport(viewport);
  await page.goto(`${baseUrl}${suffix}`, { waitUntil:'domcontentloaded', timeout:30000 });
}

try {
  for (const [surface, viewport, cotSelector, pipelineSelector] of [
    ['desktop', {width:1440,height:900,deviceScaleFactor:1}, '.dw-nav-056y [data-forge-primary-nav-key="cotizaciones"]', '.dw-nav-056y [data-forge-static-view="pipeline"]'],
    ['mobile', {width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true}, '[data-forge-mobile-nav-r16c5j] [data-forge-nav-key="cotizaciones"]', '[data-forge-mobile-nav-r16c5j] [data-forge-nav-key="pipeline"]'],
  ]) {
    const page = await browser.newPage();
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({surface,text:message.text()}); });

    await load(page, '?nav=pipeline&v=067g16f-test', viewport);
    await waitForRoute(page, 'pipeline');
    assertRoute(await state(page), 'pipeline');
    report.scenarios.push({surface,scenario:'direct_pipeline',status:'PASS'});

    await load(page, '?nav=cotizaciones&v=067g16f-test', viewport);
    await waitForRoute(page, 'cotizaciones');
    assertRoute(await state(page), 'cotizaciones');
    await page.screenshot({path:join(evidenceDir,`${surface}-cotizaciones-direct.png`),fullPage:true});
    report.scenarios.push({surface,scenario:'direct_cotizaciones',status:'PASS'});

    await load(page, '?nav=pipeline&v=067g16f-test#cotizaciones', viewport);
    await waitForRoute(page, 'cotizaciones');
    assertRoute(await state(page), 'cotizaciones');
    report.scenarios.push({surface,scenario:'legacy_normalization',status:'PASS'});

    await load(page, '?nav=pipeline&v=067g16f-test', viewport);
    await waitForRoute(page, 'pipeline');
    await page.click(cotSelector);
    await waitForRoute(page, 'cotizaciones');
    assertRoute(await state(page), 'cotizaciones');
    report.scenarios.push({surface,scenario:'pipeline_to_cotizaciones',status:'PASS'});

    await page.click(pipelineSelector);
    await waitForRoute(page, 'pipeline');
    assertRoute(await state(page), 'pipeline');
    report.scenarios.push({surface,scenario:'cotizaciones_to_pipeline',status:'PASS'});

    await page.goBack({waitUntil:'domcontentloaded'}).catch(() => {});
    await waitForRoute(page, 'cotizaciones');
    assertRoute(await state(page), 'cotizaciones');
    await page.goForward({waitUntil:'domcontentloaded'}).catch(() => {});
    await waitForRoute(page, 'pipeline');
    assertRoute(await state(page), 'pipeline');
    report.scenarios.push({surface,scenario:'back_forward',status:'PASS'});

    await page.click(cotSelector);
    await waitForRoute(page, 'cotizaciones');
    await page.reload({waitUntil:'domcontentloaded'});
    await waitForRoute(page, 'cotizaciones');
    assertRoute(await state(page), 'cotizaciones');
    report.scenarios.push({surface,scenario:'hard_reload_cotizaciones',status:'PASS'});
    await page.close();
  }

  assert.deepEqual(report.consoleErrors, []);
} catch (error) {
  report.status = 'FAIL';
  report.error = {name:error.name,message:error.message,stack:error.stack,routeState:error.routeState || null};
  throw error;
} finally {
  writeFileSync(join(evidenceDir,'067g16f-cotizaciones-route.json'),JSON.stringify(report,null,2));
  await browser.close();
  server.close();
}

console.log('067G16F COTIZACIONES ROUTE BROWSER: PASS');
