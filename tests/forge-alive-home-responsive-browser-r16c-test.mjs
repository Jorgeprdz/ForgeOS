import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(puppeteerPath, "FORGE_PUPPETEER_CORE_PATH is required");
assert.ok(chromiumPath, "FORGE_CHROMIUM_PATH is required");
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();

const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, "index.html") : candidate;
    const type = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json" }[extname(file)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type":type, "Cache-Control":"no-store" });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end(); }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--single-process", "--no-zygote", "--disable-breakpad", "--disable-crash-reporter"],
});

try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const home = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive/index.html`;

  async function load(width, height = 844) {
    await page.setViewport({ width, height, deviceScaleFactor:1 });
    await page.goto(home, { waitUntil:"networkidle0", timeout:30000 });
    await page.waitForFunction(() => document.documentElement.dataset.forgeHomeR16c === "ready");
  }

  async function auditMobile(width) {
    return page.evaluate((viewportWidth) => {
      const visible = (node) => {
        if (!node) return false;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
      };
      const rect = (node) => node ? node.getBoundingClientRect().toJSON() : null;
      const widget = document.querySelector(".forge-smart-widget-static-056u");
      const nav = document.querySelector(".bottom-nav");
      const orb = document.querySelector("[data-command-orb-layer]");
      const primaryCta = document.querySelector(".primary-card .fake-cta");
      const controls = Array.from(document.querySelectorAll(".forge-home-carousel-controls-r16c button"));
      const ids = Array.from(document.querySelectorAll("[id]")).map((node) => node.id);
      const visibleFollowupTitles = Array.from(document.querySelectorAll("h1,h2,h3")).filter((node) => visible(node) && /seguimiento prioritario/i.test(node.textContent || ""));
      return {
        viewportWidth,
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth,
        navigationCount:document.querySelectorAll(".bottom-nav").length,
        navigationVisible:visible(nav),
        navigationBox:rect(nav),
        navigationTargets:Array.from(nav?.querySelectorAll("button") || []).map((node) => ({ height:node.getBoundingClientRect().height, current:node.getAttribute("aria-current") })),
        orbCount:document.querySelectorAll("[data-command-orb-layer]").length,
        orbVisible:visible(orb),
        orbBox:rect(orb),
        primaryCtaBox:rect(primaryCta),
        widgetHostCount:document.querySelectorAll(".forge-smart-widget-static-056u").length,
        widgetVisibleCount:Array.from(document.querySelectorAll(".forge-smart-widget-static-056u")).filter(visible).length,
        widgetCanonical:widget?.dataset.forgeHomeSmartWidgetR16c,
        widgetBox:rect(widget),
        widgetHidden:widget?.hidden || widget?.getAttribute("aria-hidden") === "true",
        dynamicStackVisible:visible(document.querySelector("#smart-widget-stack")),
        visibleFollowupTitles:visibleFollowupTitles.length,
        duplicateIds:ids.filter((id, index) => ids.indexOf(id) !== index),
        controls:controls.map((node) => ({ visible:visible(node), height:node.getBoundingClientRect().height })),
        dotsVisible:Array.from(document.querySelectorAll(".forge-smart-widget-static-dot-056u")).every(visible),
        state:window.ForgeAliveHomeR16C,
      };
    }, width);
  }

  const audits = [];
  for (const width of [320, 360, 375, 390, 430]) {
    await load(width);
    const audit = await auditMobile(width);
    audits.push(audit);
    assert.equal(audit.scrollWidth <= audit.clientWidth, true, `${width}px horizontal overflow`);
    assert.equal(audit.navigationCount, 1, `${width}px navigation count`);
    assert.equal(audit.navigationVisible, true, `${width}px navigation visible`);
    assert.equal(audit.navigationTargets.length, 5, `${width}px navigation destinations`);
    assert.equal(audit.navigationTargets.every((target) => target.height >= 44), true, `${width}px navigation touch targets`);
    assert.equal(audit.orbCount, 1, `${width}px orb count`);
    assert.equal(audit.orbVisible, true, `${width}px orb visible`);
    assert.equal(audit.primaryCtaBox.width > 0 && audit.primaryCtaBox.height > 0, true, `${width}px CTA remains present`);
    assert.equal(audit.widgetHostCount, 1, `${width}px canonical widget host count`);
    assert.equal(audit.widgetVisibleCount, 1, `${width}px canonical widget visible count`);
    assert.equal(audit.widgetCanonical, "canonical", `${width}px canonical marker`);
    assert.equal(audit.widgetHidden, false, `${width}px widget hidden state`);
    assert.equal(audit.widgetBox.width > 0 && audit.widgetBox.height > 0, true, `${width}px widget dimensions`);
    assert.equal(audit.widgetBox.x >= 0 && audit.widgetBox.x + audit.widgetBox.width <= width + 0.5, true, `${width}px widget within viewport`);
    assert.equal(audit.widgetBox.bottom > 844, true, `${width}px page remains scrollable past the widget`);
    assert.equal(audit.dynamicStackVisible, false, `${width}px dynamic stack hidden`);
    assert.equal(audit.visibleFollowupTitles, 1, `${width}px visible Seguimiento prioritario count`);
    assert.deepEqual(audit.duplicateIds, [], `${width}px duplicate IDs`);
    assert.equal(audit.controls.length, 2, `${width}px carousel controls`);
    assert.equal(audit.controls.every((control) => control.visible && control.height >= 44), true, `${width}px carousel touch targets`);
    assert.equal(audit.dotsVisible, true, `${width}px indicators visible`);
  }

  await load(390);
  await page.click("[data-forge-home-carousel-next-r16c]");
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await page.$eval(".forge-smart-widget-static-056u", (node) => node.dataset.index056u), "1", "next control changes card");
  const nextCard = await page.$eval(".forge-smart-widget-static-056u", (node) => {
    const cards = Array.from(node.querySelectorAll(".forge-smart-widget-static-card-056u"));
    return {
      activeText:cards.find((card) => card.getAttribute("aria-hidden") === "false")?.querySelector("h3")?.textContent?.trim(),
      visibleCount:cards.filter((card) => !card.hidden && card.getAttribute("aria-hidden") === "false").length,
    };
  });
  assert.equal(nextCard.activeText, "Señales para decidir", "next control exposes the second canonical card");
  assert.equal(nextCard.visibleCount, 1, "next control keeps exactly one canonical card visible");
  await page.click("[data-forge-home-carousel-previous-r16c]");
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await page.$eval(".forge-smart-widget-static-056u", (node) => node.dataset.index056u), "0", "previous control changes card");

  await page.setViewport({ width:1024, height:1366, deviceScaleFactor:1 });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.setViewport({ width:390, height:844, deviceScaleFactor:1 });
  await new Promise((resolve) => setTimeout(resolve, 500));
  let roundtrip = await auditMobile(390);
  assert.equal(roundtrip.widgetVisibleCount, 1, "390→1024→390 widget persists exactly once");
  assert.equal(roundtrip.dynamicStackVisible, false, "desktop stack does not remain visible after roundtrip");

  await page.goto(`http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive/nueva-cotizacion/`, { waitUntil:"networkidle0" });
  await page.goBack({ waitUntil:"networkidle0" });
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted:true }));
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const back = await auditMobile(390);
  assert.equal(back.widgetVisibleCount, 1, "back/pageshow persisted widget count");
  assert.equal(back.visibleFollowupTitles, 1, "back/pageshow persisted duplicate count");
  assert.equal(back.navigationCount, 1, "back/pageshow navigation count");
  assert.equal(back.orbCount, 1, "back/pageshow orb count");
  assert.deepEqual(pageErrors, []);

  console.log("PASS R16C Forge Alive home responsive browser contract", audits);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
