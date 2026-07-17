import assert from 'node:assert/strict';
import http from 'node:http';
import { createReadStream, mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G16B_EVIDENCE_DIR || '/data/data/com.termux/files/usr/tmp/067g16b-evidence';
assert.ok(puppeteerPath);
assert.ok(chromiumPath);
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
mkdirSync(evidenceDir, { recursive:true });

const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const candidate = normalize(join(root, relative));
    if (!candidate.startsWith(root)) return response.writeHead(403).end();
    try {
        const info = await stat(candidate);
        const file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
        response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
        createReadStream(file).pipe(response);
    } catch { response.writeHead(404).end(); }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
async function launchBrowser() {
    return puppeteer.launch({
        executablePath:chromiumPath,
        headless:true,
        args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-breakpad','--disable-crash-reporter'],
    });
}

async function closeBrowser() {
    if (!browser) return;
    const activeBrowser = browser;
    browser = undefined;
    const closed = await Promise.race([
        activeBrowser.close().then(() => true),
        new Promise(resolve => setTimeout(() => resolve(false), 3000)),
    ]);
    if (!closed) activeBrowser.process()?.kill('SIGKILL');
}

async function restartBrowser() {
    await closeBrowser();
    browser = await launchBrowser();
    return browser.newPage();
}

browser = await launchBrowser();
const baseUrl = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive/`;

async function load(page, width, height, suffix = '') {
    await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width <= 430,hasTouch:width <= 768});
    await page.goto(baseUrl + suffix, {waitUntil:'networkidle0',timeout:30000});
    await page.waitForFunction(() => Boolean(globalThis.ForgeAliveStaticView067G16A));
    await page.waitForSelector('[data-forge-mobile-nav-r16c5j]');
}

async function audit(page) {
    return page.evaluate(() => {
        const visible = node => Boolean(node?.getClientRects().length) && getComputedStyle(node).visibility !== 'hidden';
        const ids = Array.from(document.querySelectorAll('[id]')).map(node => node.id);
        const homeNodes = Array.from(document.querySelectorAll('[data-forge-static-home-node-067g16a], [data-forge-static-home-node-067g16b]'));
        const host = document.querySelector('[data-forge-alive-primary-outlet-067g16a]');
        const diagnostics = globalThis.ForgeAliveStaticView067G16A.diagnostics();
        return {
            url:location.href,
            currentView:globalThis.ForgeAliveStaticView067G16A.current(),
            activeMobile:document.querySelector('[data-forge-mobile-nav-r16c5j] [aria-current="page"]')?.dataset.forgeNavKey || null,
            homeVisible:homeNodes.some(visible),
            homeVisibleCount:homeNodes.filter(visible).length,
            homeVisibleDetails:homeNodes.filter(visible).map(node => ({tag:node.tagName,className:node.className})),
            homeInteractiveWhileInactive:homeNodes.filter(node => !visible(node)).some(node => Array.from(node.querySelectorAll('a,button,input,select,textarea,[tabindex]')).some(control => !control.disabled && control.tabIndex >= 0 && !control.closest('[inert]'))),
            homeInteractiveDetails:homeNodes.filter(node => !visible(node)).flatMap(node => Array.from(node.querySelectorAll('a,button,input,select,textarea,[tabindex]')).filter(control => !control.disabled && control.tabIndex >= 0 && !control.closest('[inert]')).map(control => ({tag:control.tagName,text:(control.textContent || '').trim().slice(0,50),parent:node.className,html:node.outerHTML.slice(0,120)}))).slice(0,10),
            pipelineVisible:visible(host) && Boolean(host.querySelector('#forge-pipeline-title')),
            pipelineTitleCount:Array.from(document.querySelectorAll('h1')).filter(node => visible(node) && node.textContent.trim() === 'Pipeline de ventas').length,
            filterRowCount:Array.from(document.querySelectorAll('.forge-pipeline-toolbar[role="search"]')).filter(visible).length,
            activeOutletCount:Array.from(document.querySelectorAll('[data-forge-alive-primary-outlet-067g16a][data-active-static-view="pipeline"]')).filter(visible).length,
            identityCopy:['FORGE · ADVISOR OS','INTERVENCIÓN COMERCIAL EXPLICADA','Buscar prospecto','Todos los orígenes','Seguimientos'].every(copy => host?.textContent.includes(copy)),
            homeMetricVisible:Array.from(document.querySelectorAll('.forge-mobile-context-nav-057d, .forge-mobile-widget-grid-057j')).some(visible),
            outletCount:document.querySelectorAll('[data-forge-alive-primary-outlet-067g16a]').length,
            duplicateIds:ids.filter((id,index) => ids.indexOf(id) !== index),
            overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
            diagnostics,
            limitation:host?.querySelector('.forge-pipeline-state p')?.textContent || '',
            shellCount:document.querySelectorAll('.phone-shell').length,
        };
    });
}

async function tapMobile(page, key) {
    const element = await page.$(`[data-forge-nav-key="${key}"]`);
    const box = await element.boundingBox();
    await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2);
    await page.waitForFunction(expected => globalThis.ForgeAliveStaticView067G16A.current() === expected, {}, key);
}

async function clickVisibleDesktop(page, view) {
    const handles = await page.$$(`[data-forge-static-view="${view}"]`);
    for (const handle of handles) {
        const box = await handle.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
            await handle.click();
            await page.waitForFunction(expected => globalThis.ForgeAliveStaticView067G16A.current() === expected, {}, view);
            return;
        }
    }
    throw new Error(`VISIBLE_STATIC_VIEW_CONTROL_MISSING:${view}`);
}

try {
    let page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await load(page, 390, 844);
    const home390 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'mobile_static_home_before_390x844.png')});
    await tapMobile(page, 'pipeline');
    const pipeline390 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'mobile_pipeline_after_click_390x844.png')});
    assert.equal(home390.currentView, 'inicio');
    assert.equal(home390.homeVisible, true);
    if (pipeline390.homeVisible) console.log(JSON.stringify(pipeline390.homeVisibleDetails, null, 2));
    assert.equal(pipeline390.homeVisible, false);
    if (pipeline390.homeInteractiveWhileInactive) console.log(JSON.stringify(pipeline390.homeInteractiveDetails, null, 2));
    assert.equal(pipeline390.homeInteractiveWhileInactive, false);
    assert.equal(pipeline390.pipelineVisible, true);
    assert.equal(pipeline390.activeMobile, 'pipeline');
    assert.equal(pipeline390.pipelineTitleCount, 1);
    assert.equal(pipeline390.filterRowCount, 1);
    assert.equal(pipeline390.activeOutletCount, 1);
    assert.equal(pipeline390.identityCopy, true);
    assert.equal(pipeline390.homeMetricVisible, false);
    assert.equal(pipeline390.outletCount, 1);
    assert.equal(pipeline390.diagnostics.pipelineMountCount, 1);
    assert.equal(pipeline390.diagnostics.navListenerCount, 1);
    assert.deepEqual(pipeline390.duplicateIds, []);
    assert.equal(pipeline390.overflow, 0);

    await tapMobile(page, 'inicio');
    const returned390 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'mobile_home_after_return_390x844.png')});
    assert.equal(returned390.homeVisible, true);
    assert.equal(returned390.pipelineVisible, false);

    for (let cycle = 0; cycle < 3; cycle += 1) {
        await tapMobile(page, 'pipeline');
        const opened = await audit(page);
        assert.equal(opened.pipelineVisible, true);
        assert.equal(opened.diagnostics.pipelineMountCount, 1);
        assert.equal(opened.diagnostics.navListenerCount, 1);
        await tapMobile(page, 'inicio');
        assert.equal((await audit(page)).homeVisible, true);
    }
    await tapMobile(page, 'pipeline');
    await page.screenshot({path:join(evidenceDir,'mobile_pipeline_second_open_390x844.png')});

    await load(page, 390, 844);
    await page.click('[data-forge-static-open-pipeline]');
    await page.waitForFunction(() => globalThis.ForgeAliveStaticView067G16A.current() === 'pipeline');
    await page.screenshot({path:join(evidenceDir,'dashboard_open_pipeline_static_result_390x844.png')});
    assert.equal((await audit(page)).homeVisible, false);

    await load(page, 390, 844);
    await page.$eval('[data-forge-static-open-pipeline]', button => {
        button.dataset.forgeContextType = 'prospect';
        button.dataset.forgeContextId = 'P-MISSING';
    });
    await page.click('[data-forge-static-open-pipeline]');
    await page.waitForFunction(() => globalThis.ForgeAliveStaticView067G16A.current() === 'pipeline');
    await page.screenshot({path:join(evidenceDir,'dashboard_missing_prospect_pipeline_notice_390x844.png')});
    assert.match((await audit(page)).limitation, /prospecto P-MISSING no puede resolverse/);

    await load(page, 390, 844);
    await page.$eval('[data-forge-static-open-pipeline]', button => {
        button.dataset.forgeContextType = 'opportunity';
        button.dataset.forgeContextId = 'O-MISSING';
    });
    await page.click('[data-forge-static-open-pipeline]');
    await page.waitForFunction(() => globalThis.ForgeAliveStaticView067G16A.current() === 'pipeline');
    await page.screenshot({path:join(evidenceDir,'dashboard_missing_opportunity_pipeline_notice_390x844.png')});
    assert.match((await audit(page)).limitation, /oportunidad O-MISSING no puede resolverse/);

    page = await restartBrowser();
    page.on('pageerror', error => pageErrors.push(error.message));
    await load(page, 360, 800);
    await tapMobile(page, 'pipeline');
    const mobile360 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'mobile_pipeline_after_click_360x800.png')});
    assert.equal(mobile360.pipelineVisible, true);
    assert.equal(mobile360.homeVisible, false);
    assert.equal(mobile360.overflow, 0);

    page = await restartBrowser();
    page.on('pageerror', error => pageErrors.push(error.message));
    await load(page, 768, 1024);
    await page.screenshot({path:join(evidenceDir,'tablet_static_home_before_768x1024.png')});
    await tapMobile(page, 'pipeline');
    const tablet = await audit(page);
    await page.screenshot({path:join(evidenceDir,'tablet_pipeline_after_click_768x1024.png')});
    assert.equal(tablet.pipelineVisible, true);
    assert.equal(tablet.homeVisible, false);
    assert.equal(tablet.overflow, 0);

    page = await restartBrowser();
    page.on('pageerror', error => pageErrors.push(error.message));
    await load(page, 1440, 900);
    await page.screenshot({path:join(evidenceDir,'desktop_static_home_before_1440x900.png')});
    await clickVisibleDesktop(page, 'pipeline');
    const desktop1440 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'desktop_pipeline_after_click_1440x900.png')});
    assert.equal(desktop1440.pipelineVisible, true);
    assert.equal(desktop1440.homeVisible, false);
    assert.equal(desktop1440.pipelineTitleCount, 1);
    assert.equal(desktop1440.shellCount, 1);
    assert.equal(desktop1440.overflow, 0);
    await clickVisibleDesktop(page, 'inicio');
    assert.equal((await audit(page)).homeVisible, true);

    page = await restartBrowser();
    page.on('pageerror', error => pageErrors.push(error.message));
    await load(page, 1366, 768);
    await clickVisibleDesktop(page, 'pipeline');
    const desktop1366 = await audit(page);
    await page.screenshot({path:join(evidenceDir,'desktop_pipeline_after_click_1366x768.png')});
    assert.equal(desktop1366.pipelineVisible, true);
    assert.equal(desktop1366.homeVisible, false);
    assert.equal(desktop1366.filterRowCount, 1);
    assert.equal(desktop1366.activeOutletCount, 1);
    await load(page, 390, 844, '?nav=pipeline&v=067g16a-1');
    const direct = await audit(page);
    assert.equal(direct.currentView, 'pipeline');
    assert.equal(direct.pipelineVisible, true);
    assert.ok(!direct.url.endsWith('/ForgeOS/'));

    await load(page, 390, 844);
    await tapMobile(page, 'clientes');
    assert.equal((await audit(page)).currentView, 'clientes');
    await tapMobile(page, 'mas');
    assert.equal((await audit(page)).currentView, 'mas');
    await tapMobile(page, 'inicio');
    assert.equal((await audit(page)).homeVisible, true);
    assert.ok(await page.$('[data-forge-nav-key="cotizaciones"][data-forge-open-saas-module-r16c5l]'));

    assert.deepEqual(pageErrors, []);
    console.log(JSON.stringify({
        status:'PASS',
        entrypoint:'docs/static-preview/forge-alive/index.html',
        localUrl:baseUrl,
        mobile390:{home:home390,pipeline:pipeline390,returned:returned390},
        mobile360,
        tablet,
        desktop1440,
        desktop1366,
        direct,
        repeatedSwitching:'PASS_3_CYCLES',
        screenshots:13,
    }, null, 2));
} finally {
    await closeBrowser();
    server.close();
}
