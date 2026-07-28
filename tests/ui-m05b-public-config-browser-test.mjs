import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import { extname, join, normalize } from "node:path";
import puppeteer from "puppeteer-core";

const browserPath = process.env.FORGE_CHROMIUM_PATH;
assert.ok(browserPath, "FORGE_CHROMIUM_PATH is required");
const artifact = mkdtempSync(join(os.tmpdir(), "forge-ui-m05b-site-"));
const canonical = join(artifact, "static-preview", "forge-alive");
mkdirSync(join(artifact, "static-preview"), { recursive: true });
cpSync("docs/static-preview/forge-alive-material3", canonical, { recursive: true });
cpSync(
  "docs/static-preview/quote-preview-live",
  join(artifact, "static-preview", "quote-preview-live"),
  { recursive: true },
);
writeFileSync(
  join(artifact, "env.js"),
  'window.__ENV__=Object.freeze({"SUPABASE_URL":"https://rmlxigxysujsuwzgoimv.supabase.co","SUPABASE_KEY":"public-test-value","DEMO_MODE":"false"});',
);

const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json",
};
function serverFor(root, omitEnv = false) {
  return http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname,
    );
    if (omitEnv && pathname === "/env.js") return response.writeHead(404).end();
    let file = normalize(join(root, pathname.replace(/^\/+/, "")));
    if (!file.startsWith(root)) return response.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const content = await readFile(file);
      response.writeHead(200, { "Content-Type": types[extname(file)] || "text/plain" });
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
}
const validServer = serverFor(artifact);
const missingServer = serverFor(artifact, true);
await Promise.all([
  new Promise((resolve) => validServer.listen(0, "127.0.0.1", resolve)),
  new Promise((resolve) => missingServer.listen(0, "127.0.0.1", resolve)),
]);
const browser = await puppeteer.launch({
  executablePath: browserPath, headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
try {
  const page = await browser.newPage();
  const validUrl = `http://127.0.0.1:${validServer.address().port}/static-preview/forge-alive/?nav=cotizaciones`;
  await page.goto(validUrl, { waitUntil: "networkidle0" });
  await page.waitForSelector('[data-forge-quotes-module][data-runtime-mounted="true"]');
  assert.deepEqual(await page.evaluate(() => ({
    valid: globalThis.__FORGE_PUBLIC_CONFIG_STATE__?.valid,
    ref: globalThis.__FORGE_PUBLIC_CONFIG_STATE__?.projectRef,
    banner: document.querySelectorAll("[data-forge-public-config-notice]").length,
  })), { valid: true, ref: "rmlxigxysujsuwzgoimv", banner: 0 });

  const missingUrl = `http://127.0.0.1:${missingServer.address().port}/static-preview/forge-alive/?nav=inicio`;
  await page.goto(missingUrl, { waitUntil: "networkidle0" });
  assert.deepEqual(await page.evaluate(() => ({
    valid: globalThis.__FORGE_PUBLIC_CONFIG_STATE__?.valid,
    reason: globalThis.__FORGE_PUBLIC_CONFIG_STATE__?.reason,
    banner: document.querySelectorAll("[data-forge-public-config-notice]").length,
  })), { valid: false, reason: "PUBLIC_CONFIG_MISSING", banner: 1 });
  console.log("PASS UI-M05B built Pages public configuration");
} finally {
  await browser.close();
  await Promise.all([
    new Promise((resolve) => validServer.close(resolve)),
    new Promise((resolve) => missingServer.close(resolve)),
  ]);
  rmSync(artifact, { recursive: true, force: true });
}
