import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const playwrightPath = process.env.FORGE_PLAYWRIGHT_PATH;
assert.ok(playwrightPath, "FORGE_PLAYWRIGHT_PATH is required");
const { webkit } = await import(playwrightPath);
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
const browser = await webkit.launch({ headless:true });
try {
  const context = await browser.newContext({ isMobile:true, hasTouch:true, deviceScaleFactor:1, colorScheme:"dark" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const home = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive/index.html`;

  async function audit(width, height) {
    await page.setViewportSize({ width, height });
    await page.goto(home, { waitUntil:"load" });
    await page.waitForFunction(() => document.documentElement.dataset.forgeHomeR16c === "ready");
    return page.evaluate(() => {
      const visible = (node) => {
        if (!node) return false;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
      };
      const box = (node) => node ? node.getBoundingClientRect().toJSON() : null;
      const nav = document.querySelector(".bottom-nav");
      const orb = document.querySelector("[data-command-orb-layer]");
      const primaryCta = document.querySelector(".primary-card .fake-cta");
      const widget = document.querySelector(".forge-smart-widget-static-056u");
      const ids = Array.from(document.querySelectorAll("[id]")).map((node) => node.id);
      return {
        overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth,
        navigationCount:document.querySelectorAll(".bottom-nav").length,
        navigationVisible:visible(nav),
        navigationBox:box(nav),
        navigationTargets:Array.from(nav?.querySelectorAll("button") || []).map((node) => node.getBoundingClientRect().height),
        orbCount:document.querySelectorAll("[data-command-orb-layer]").length,
        orbVisible:visible(orb),
        orbBox:box(orb),
        primaryCtaBox:box(primaryCta),
        widgetCount:document.querySelectorAll(".forge-smart-widget-static-056u").length,
        widgetVisible:visible(widget),
        widgetBox:box(widget),
        widgetCanonical:widget?.dataset.forgeHomeSmartWidgetR16c,
        dynamicStackVisible:visible(document.querySelector("#smart-widget-stack")),
        duplicateIds:ids.filter((id, index) => ids.indexOf(id) !== index),
        visibleFollowupTitles:Array.from(document.querySelectorAll("h1,h2,h3")).filter((node) => visible(node) && /seguimiento prioritario/i.test(node.textContent || "")).length,
        carouselControls:Array.from(document.querySelectorAll(".forge-home-carousel-controls-r16c button")).map((node) => ({visible:visible(node),height:node.getBoundingClientRect().height})),
        indicators:Array.from(document.querySelectorAll(".forge-smart-widget-static-dot-056u")).filter(visible).length,
        colorScheme:getComputedStyle(document.documentElement).colorScheme,
      };
    });
  }

  for (const [width,height,label] of [[375,667,"iPhone SE"],[390,844,"iPhone 13/14"],[430,932,"iPhone Pro Max"],[844,390,"iPhone landscape"]]) {
    const result = await audit(width,height);
    assert.equal(result.overflow, false, `${label} overflow`);
    assert.equal(result.navigationCount, 1, `${label} navigation count`);
    assert.equal(result.navigationVisible, true, `${label} navigation visible`);
    assert.equal(result.navigationTargets.every((target) => target >= 44), true, `${label} navigation touch targets`);
    assert.equal(result.orbCount, 1, `${label} orb count`);
    assert.equal(result.orbVisible, true, `${label} orb visible`);
    assert.equal(result.primaryCtaBox.width > 0 && result.primaryCtaBox.height > 0, true, `${label} CTA remains present`);
    assert.equal(result.widgetCount, 1, `${label} widget count`);
    assert.equal(result.widgetVisible, true, `${label} widget visible`);
    assert.equal(result.widgetCanonical, "canonical", `${label} canonical 056U`);
    assert.equal(result.widgetBox.x >= 0 && result.widgetBox.x + result.widgetBox.width <= width + 0.5, true, `${label} widget in viewport`);
    assert.equal(result.widgetBox.bottom > height, true, `${label} page remains scrollable`);
    assert.equal(result.dynamicStackVisible, false, `${label} dynamic stack hidden`);
    assert.deepEqual(result.duplicateIds, [], `${label} duplicate IDs`);
    assert.equal(result.visibleFollowupTitles, 1, `${label} visible follow-up title`);
    assert.equal(result.carouselControls.length, 2, `${label} carousel controls`);
    assert.equal(result.carouselControls.every((control) => control.visible && control.height >= 44), true, `${label} carousel touch targets`);
    assert.equal(result.indicators, 4, `${label} carousel indicators`);
    assert.match(result.colorScheme, /dark/, `${label} dark color scheme`);
  }

  await page.setViewportSize({width:390,height:844});
  await page.goto(home, { waitUntil:"load" });
  await page.waitForFunction(() => document.documentElement.dataset.forgeHomeR16c === "ready");
  await page.locator("[data-forge-home-carousel-next-r16c]").click({ force:true });
  await page.waitForTimeout(600);
  const nextCard = await page.locator(".forge-smart-widget-static-056u").evaluate((node) => {
    const cards = Array.from(node.querySelectorAll(".forge-smart-widget-static-card-056u"));
    return {
      index:node.dataset.index056u,
      activeText:cards.find((card) => card.getAttribute("aria-hidden") === "false")?.querySelector("h3")?.textContent?.trim(),
      visibleCount:cards.filter((card) => !card.hidden && card.getAttribute("aria-hidden") === "false").length,
    };
  });
  assert.equal(nextCard.index, "1", "WebKit next index");
  assert.equal(nextCard.activeText, "Señales para decidir", "WebKit next card visible");
  assert.equal(nextCard.visibleCount, 1, "WebKit one canonical card visible");
  await page.evaluate(() => {
    const pageshow = new Event("pageshow");
    Object.defineProperty(pageshow, "persisted", { value:true });
    window.dispatchEvent(pageshow);
    window.dispatchEvent(new PopStateEvent("popstate"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(300);
  assert.equal(await page.locator(".forge-smart-widget-static-056u").count(), 1, "WebKit bfcache widget count");
  assert.equal(await page.locator(".bottom-nav").count(), 1, "WebKit bfcache navigation count");
  assert.equal(await page.locator("[data-command-orb-layer]").count(), 1, "WebKit bfcache orb count");
  assert.deepEqual(errors, []);
  console.log("PASS R16C iOS contract using Playwright WebKit");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
