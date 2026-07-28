import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { webkit } from "playwright";

const root = process.cwd();
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://127.0.0.1").pathname,
  );
  const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? join(candidate, "index.html") : candidate;
    response.writeHead(200, {
      "Content-Type": {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
      }[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await webkit.launch({
  headless: true,
  ...(process.env.FORGE_WEBKIT_PATH
    ? { executablePath: process.env.FORGE_WEBKIT_PATH }
    : {}),
});
try {
  const context = await browser.newContext({
    locale: "es-MX",
    colorScheme: "dark",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const home =
    `http://127.0.0.1:${server.address().port}`
    + "/docs/static-preview/forge-alive-material3/?nav=inicio";

  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [430, 932],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(home, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.documentElement.dataset.forgeShellReady === "true",
    );
    const audit = await page.evaluate(() => ({
      overflow:
        document.documentElement.scrollWidth
        > document.documentElement.clientWidth,
      nav: document.querySelectorAll("[data-forge-nav-pill]").length,
      orb: document.querySelectorAll("[data-forge-command-orb]").length,
      sheet: document.querySelectorAll("[data-forge-alfred-sheet]").length,
      module: document.querySelectorAll("[data-forge-home-module]").length,
      active: document.querySelectorAll(
        '[data-route-id="inicio"][aria-current="page"]',
      ).length,
      scrollable:
        document.documentElement.scrollHeight
        > document.documentElement.clientHeight,
    }));
    assert.deepEqual(
      audit,
      {
        overflow: false,
        nav: 1,
        orb: 1,
        sheet: 1,
        module: 1,
        active: 1,
        scrollable: true,
      },
      `${width}x${height} WebKit audit`,
    );
  }

  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pageshow", {
      persisted: true,
    }));
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new Event("orientationchange"));
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(100);
  assert.deepEqual(
    await page.evaluate(() => ({
      nav: document.querySelectorAll("[data-forge-nav-pill]").length,
      orb: document.querySelectorAll("[data-forge-command-orb]").length,
      sheet: document.querySelectorAll("[data-forge-alfred-sheet]").length,
      module: document.querySelectorAll("[data-forge-home-module]").length,
    })),
    { nav: 1, orb: 1, sheet: 1, module: 1 },
  );
  await page.locator("[data-forge-command-orb]").click();
  await page.locator("[data-forge-alfred-sheet].open").waitFor();
  await page.keyboard.press("Escape");
  await page.locator("[data-forge-alfred-sheet]:not(.open)").waitFor();
  const quotes = home.replace("nav=inicio", "nav=cotizaciones");
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.goto(quotes, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => document.querySelector("[data-forge-quotes-module]")?.dataset.runtimeMounted === "true",
    );
    const audit = await page.evaluate(() => ({
      route: document.body.dataset.forgeRoute,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      nav: document.querySelectorAll("[data-forge-nav-pill]").length,
      orb: document.querySelectorAll("[data-forge-command-orb]").length,
      sheet: document.querySelectorAll("[data-forge-alfred-sheet]").length,
      legacy: document.querySelectorAll(".dw-sidebar-056y,[data-forge-legacy-sidebar]").length,
    }));
    assert.deepEqual(audit, {
      route: "quotes", overflow: false, nav: 1, orb: 1, sheet: 1, legacy: 0,
    }, `${width}x${height} Quotes WebKit audit`);
  }
  assert.deepEqual(errors, []);
  console.log("PASS UI-M05D ForgeShell and Quotes Playwright WebKit simulation");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
