import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { webkit } from "playwright";

const root = process.cwd();
const types = {
  ".html": "text/html", ".js": "text/javascript",
  ".css": "text/css", ".json": "application/json",
};
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://127.0.0.1").pathname,
  );
  if (pathname.endsWith("/env.js")) {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end(
      'window.__ENV__=Object.freeze({"SUPABASE_URL":"https://rmlxigxysujsuwzgoimv.supabase.co","SUPABASE_KEY":"public-test-value"});',
    );
    return;
  }
  let file = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!file.startsWith(root)) return response.writeHead(403).end();
  try {
    if (!extname(file)) file = join(file, "index.html");
    const content = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/docs/static-preview/forge-alive-material3/?nav=cotizaciones`;
const browser = await webkit.launch({ headless: true });
try {
  const context = await browser.newContext({
    locale: "es-MX",
    colorScheme: "dark",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const [width, height] of [
    [320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator('[data-forge-quotes-module][data-runtime-mounted="true"]')
      .waitFor();
    const state = await page.evaluate(() => ({
      homeVisible: Boolean(
        document.querySelector("[data-forge-home-module]")?.getClientRects().length,
      ),
      route: document.body.dataset.forgeRoute,
      active: document.querySelector("[data-forge-nav-pill] [aria-current=page]")
        ?.dataset.routeId,
      navs: document.querySelectorAll("[data-forge-nav-pill]").length,
      orbs: document.querySelectorAll("[data-forge-command-orb]").length,
      sheets: document.querySelectorAll("[data-forge-alfred-sheet]").length,
      overflow: document.documentElement.scrollWidth
        > document.documentElement.clientWidth,
      legacySidebar: document.querySelectorAll(
        ".dw-sidebar-056y,.sidebar,[data-forge-legacy-sidebar]",
      ).length,
      legacyBack: [...document.querySelectorAll("a,button")].filter(
        (node) => /volver a (inicio|cotizaciones)/i.test(node.textContent),
      ).length,
      publicBanner: document.querySelectorAll(
        "[data-forge-public-config-notice]",
      ).length,
    }));
    assert.deepEqual(state, {
      homeVisible: false, route: "quotes", active: "quotes", navs: 1, orbs: 1,
      sheets: 1, overflow: false, legacySidebar: 0, legacyBack: 0,
      publicBanner: 0,
    });
  }
  await context.close();
  console.log("PASS UI-M05 Playwright WebKit simulation");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
