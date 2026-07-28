import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const puppeteerPath = process.env.FORGE_PUPPETEER_CORE_PATH;
assert.ok(puppeteerPath, "FORGE_PUPPETEER_CORE_PATH is required");
const puppeteer = (await import(puppeteerPath)).default;
const root = process.cwd();
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};
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
      "Content-Type": contentTypes[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const executablePath = process.env.FORGE_CHROMIUM_PATH;
const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
  ],
});

try {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "dark" },
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const home =
    `http://127.0.0.1:${server.address().port}`
    + "/docs/static-preview/forge-alive-material3/?nav=inicio";

  async function audit(width, height) {
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1,
      hasTouch: width < 1200,
    });
    await page.goto(home, { waitUntil: "networkidle0" });
    await page.waitForFunction(
      () => document.documentElement.dataset.forgeShellReady === "true",
    );
    return page.evaluate(() => {
      const visible = (node) => {
        if (!node) return false;
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity) > 0
          && box.width > 0
          && box.height > 0;
      };
      return {
        route: document.body.dataset.forgeRoute,
        overflow:
          document.documentElement.scrollWidth
          > document.documentElement.clientWidth,
        navCount: document.querySelectorAll("[data-forge-nav-pill]").length,
        navVisible: visible(document.querySelector("[data-forge-nav-pill]")),
        orbCount: document.querySelectorAll("[data-forge-command-orb]").length,
        orbVisible: visible(document.querySelector("[data-forge-command-orb]")),
        sheetCount: document.querySelectorAll("[data-forge-alfred-sheet]").length,
        moduleCount: document.querySelectorAll("[data-forge-home-module]").length,
        activeCount: document.querySelectorAll(
          '[data-route-id][aria-current="page"]',
        ).length,
        activeRoute: document.querySelector(
          '[data-route-id][aria-current="page"]',
        )?.dataset.routeId,
        navTargets: Array.from(
          document.querySelectorAll("[data-route-id]"),
        ).map((node) => {
          const box = node.getBoundingClientRect();
          return Math.min(box.width, box.height);
        }),
        scrollable:
          document.documentElement.scrollHeight
          > document.documentElement.clientHeight,
      };
    });
  }

  const viewports = [
    [320, 568],
    [360, 800],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [844, 390],
  ];
  for (const [width, height] of viewports) {
    const result = await audit(width, height);
    assert.equal(result.route, "inicio", `${width}x${height} route`);
    assert.equal(result.overflow, false, `${width}x${height} overflow`);
    assert.equal(result.navCount, 1, `${width}x${height} nav`);
    assert.equal(result.navVisible, true, `${width}x${height} nav visible`);
    assert.equal(result.orbCount, 1, `${width}x${height} orb`);
    assert.equal(result.orbVisible, true, `${width}x${height} orb visible`);
    assert.equal(result.sheetCount, 1, `${width}x${height} sheet`);
    assert.equal(result.moduleCount, 1, `${width}x${height} module`);
    assert.equal(result.activeCount, 1, `${width}x${height} active count`);
    assert.equal(result.activeRoute, "inicio", `${width}x${height} active route`);
    assert.equal(
      result.navTargets.every((size) => size >= 44),
      true,
      `${width}x${height} touch targets`,
    );
    assert.equal(result.scrollable, true, `${width}x${height} scrolling`);
  }

  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    hasTouch: true,
  });
  await page.goto(home, { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => document.documentElement.dataset.forgeShellReady === "true",
  );
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pageshow", {
      persisted: true,
    }));
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new Event("orientationchange"));
    window.dispatchEvent(new Event("resize"));
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.setViewport({ width: 390, height: 844, hasTouch: true });
  const restored = await page.evaluate(() => ({
    nav: document.querySelectorAll("[data-forge-nav-pill]").length,
    orb: document.querySelectorAll("[data-forge-command-orb]").length,
    sheet: document.querySelectorAll("[data-forge-alfred-sheet]").length,
    module: document.querySelectorAll("[data-forge-home-module]").length,
  }));
  assert.deepEqual(restored, { nav: 1, orb: 1, sheet: 1, module: 1 });

  await page.click("[data-forge-command-orb]");
  await page.waitForSelector("[data-forge-alfred-sheet].open");
  assert.equal(
    await page.$$eval(
      "[data-forge-alfred-sheet].open",
      (nodes) => nodes.length,
    ),
    1,
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.$$eval(
      "[data-forge-alfred-sheet].open",
      (nodes) => nodes.length,
    ),
    0,
  );
  assert.deepEqual(errors, []);
  console.log("PASS UI-M04 Chromium responsive shell contract");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
