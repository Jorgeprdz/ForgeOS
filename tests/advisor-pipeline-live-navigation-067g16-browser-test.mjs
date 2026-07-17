import assert from 'node:assert/strict';
import http from 'node:http';
import { createReadStream, mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G16_EVIDENCE_DIR || '/data/data/com.termux/files/usr/tmp/067g16-evidence';
assert.ok(puppeteerPath, 'FORGE_PUPPETEER_CORE_PATH is required');
assert.ok(chromiumPath, 'FORGE_CHROMIUM_PATH is required');
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
mkdirSync(evidenceDir, { recursive: true });

const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };
const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname === '/env.js') {
        response.writeHead(200, { 'Content-Type':'text/javascript', 'Cache-Control':'no-store' });
        response.end("window.__ENV__={DEMO_MODE:'true'};");
        return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const candidate = normalize(join(root, relative));
    if (!candidate.startsWith(root)) return response.writeHead(403).end();
    try {
        const info = await stat(candidate);
        const file = info.isDirectory() ? join(candidate, 'index.html') : candidate;
        response.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
        createReadStream(file).pipe(response);
    } catch {
        response.writeHead(404).end();
    }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-breakpad','--disable-crash-reporter'],
});
const baseUrl = `http://127.0.0.1:${server.address().port}/`;

async function load(page, width, height) {
    await page.setViewport({ width, height, deviceScaleFactor:1, isMobile:width <= 430, hasTouch:width <= 430 });
    await page.goto(baseUrl, { waitUntil:'networkidle0', timeout:30000 });
    await page.waitForSelector('#dashboard-container', { timeout:15000 });
    await page.waitForSelector('.nav-btn[data-target="advisor-sales-pipeline"]', { visible:true, timeout:15000 });
}

async function state(page) {
    return page.evaluate(() => {
        const pipeline = document.querySelector('.forge-pipeline');
        const nav = document.querySelector('.nav-btn[data-target="advisor-sales-pipeline"]');
        const navBox = nav?.getBoundingClientRect();
        const hit = navBox ? document.elementFromPoint(navBox.left + navBox.width / 2, navBox.top + navBox.height / 2) : null;
        return {
            route:location.hash,
            pipelineVisible:Boolean(document.querySelector('#forge-pipeline-title')),
            mountId:pipeline?.dataset.pipelineMountId || null,
            mountState:pipeline?.dataset.pipelineMountState || null,
            activeTarget:document.querySelector('.nav-btn.active')?.dataset.target || null,
            navHitTarget:hit?.closest?.('.nav-btn')?.dataset.target || null,
            navHeight:navBox?.height || 0,
            overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
            limitation:pipeline?.querySelector('.forge-pipeline-state p')?.textContent || '',
        };
    });
}

try {
    const page = await browser.newPage();
    const fatalErrors = [];
    page.on('pageerror', error => {
        if (!/Network\.subscribe is not a function/.test(error.message)) fatalErrors.push(error.message);
    });

    await load(page, 390, 844);
    await page.screenshot({ path:join(evidenceDir, 'mobile_before_click_390x844.png') });
    const mobileBefore = await state(page);
    const mobileNav = await page.$('.nav-btn[data-target="advisor-sales-pipeline"]');
    const mobileBox = await mobileNav.boundingBox();
    await page.touchscreen.tap(mobileBox.x + mobileBox.width / 2, mobileBox.y + mobileBox.height / 2);
    await page.waitForSelector('#forge-pipeline-title', { timeout:10000 });
    const mobileAfter = await state(page);
    await page.screenshot({ path:join(evidenceDir, 'mobile_after_click_390x844.png') });
    assert.equal(mobileBefore.route, '#dashboard');
    assert.equal(mobileBefore.navHitTarget, 'advisor-sales-pipeline');
    assert.ok(mobileBefore.navHeight >= 44);
    assert.equal(mobileAfter.route, '#advisor-sales-pipeline');
    assert.equal(mobileAfter.pipelineVisible, true);
    assert.equal(mobileAfter.activeTarget, 'advisor-sales-pipeline');
    assert.equal(mobileAfter.overflow, 0);
    await page.touchscreen.tap(mobileBox.x + mobileBox.width / 2, mobileBox.y + mobileBox.height / 2);
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal((await state(page)).mountId, mobileAfter.mountId, 'same-route activation does not remount');

    await page.goBack({ waitUntil:'networkidle0' });
    await page.waitForSelector('#dashboard-container');
    assert.equal((await state(page)).route, '#dashboard');
    await page.goForward({ waitUntil:'networkidle0' });
    await page.waitForSelector('#forge-pipeline-title');
    assert.equal((await state(page)).route, '#advisor-sales-pipeline');

    await load(page, 360, 800);
    const touch360 = await page.$('.nav-btn[data-target="advisor-sales-pipeline"]');
    const touch360Box = await touch360.boundingBox();
    await page.touchscreen.tap(touch360Box.x + touch360Box.width / 2, touch360Box.y + touch360Box.height / 2);
    await page.waitForSelector('#forge-pipeline-title');
    assert.equal((await state(page)).pipelineVisible, true);
    await page.goBack({ waitUntil:'networkidle0' });
    await page.waitForSelector('#dashboard-container');
    const keyboardNav = await page.$('.nav-btn[data-target="advisor-sales-pipeline"]');
    await keyboardNav.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('#forge-pipeline-title');
    assert.equal((await state(page)).pipelineVisible, true);
    await keyboardNav.dispose();
    await load(page, 360, 800);
    const spaceNav = await page.$('.nav-btn[data-target="advisor-sales-pipeline"]');
    await spaceNav.focus();
    await page.keyboard.press('Space');
    await page.waitForSelector('#forge-pipeline-title');
    assert.equal((await state(page)).overflow, 0);

    await load(page, 1440, 900);
    await page.screenshot({ path:join(evidenceDir, 'desktop_before_click_1440x900.png') });
    await page.click('.nav-btn[data-target="advisor-sales-pipeline"]');
    await page.waitForSelector('#forge-pipeline-title');
    const desktopAfter = await state(page);
    await page.screenshot({ path:join(evidenceDir, 'desktop_after_click_1440x900.png') });
    assert.equal(desktopAfter.route, '#advisor-sales-pipeline');
    assert.equal(desktopAfter.activeTarget, 'advisor-sales-pipeline');
    assert.equal(desktopAfter.overflow, 0);

    await load(page, 1366, 768);
    await page.click('.nav-btn[data-target="advisor-sales-pipeline"]');
    await page.waitForSelector('#forge-pipeline-title');
    assert.equal((await state(page)).pipelineVisible, true);

    await page.goto(`${baseUrl}#advisor-sales-pipeline`, { waitUntil:'networkidle0', timeout:30000 });
    await page.waitForSelector('#forge-pipeline-title', { timeout:15000 });
    assert.equal((await state(page)).route, '#advisor-sales-pipeline');

    await load(page, 390, 844);
    await page.click('[data-forge-route="advisor-sales-pipeline"]');
    await page.waitForSelector('#forge-pipeline-title');
    await page.screenshot({ path:join(evidenceDir, 'dashboard_open_pipeline_after_click.png') });
    const dashboardOpen = await state(page);
    assert.equal(dashboardOpen.pipelineVisible, true);

    await load(page, 390, 844);
    await page.$eval('[data-forge-route="advisor-sales-pipeline"]', button => {
        button.dataset.forgeContextType = 'prospect';
        button.dataset.forgeContextId = 'P-MISSING';
    });
    await page.click('[data-forge-route="advisor-sales-pipeline"]');
    await page.waitForSelector('#forge-pipeline-title');
    const prospectOpen = await state(page);
    assert.match(prospectOpen.limitation, /prospecto P-MISSING no puede resolverse/);

    await load(page, 390, 844);
    await page.$eval('[data-forge-route="advisor-sales-pipeline"]', button => {
        button.dataset.forgeContextType = 'opportunity';
        button.dataset.forgeContextId = 'O-MISSING';
    });
    await page.click('[data-forge-route="advisor-sales-pipeline"]');
    await page.waitForSelector('#forge-pipeline-title');
    const opportunityOpen = await state(page);
    assert.match(opportunityOpen.limitation, /oportunidad O-MISSING no puede resolverse/);

    assert.deepEqual(fatalErrors, []);
    console.log(JSON.stringify({
        status:'PASS',
        mobile390:{ before:mobileBefore, after:mobileAfter },
        desktop1440:desktopAfter,
        dashboardOpen,
        prospectOpen,
        opportunityOpen,
        backForward:'PASS',
        screenshots:5,
    }, null, 2));
} finally {
    await browser.close();
    server.close();
}
