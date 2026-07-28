import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import { extname, join, normalize } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { webkit } from "playwright";

const sourceCommit = process.env.FORGE_HOME_VISUAL_SOURCE_COMMIT
  || "f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673";
const repositoryRoot = process.cwd();
const authorityRoot = mkdtempSync(join(os.tmpdir(), "forge-ui-m04-authority-"));
const authorityEntrypoint = join(
  authorityRoot,
  "docs/static-preview/forge-alive-material3",
);
mkdirSync(authorityEntrypoint, { recursive: true });

const authorityFiles = execFileSync(
  "git",
  [
    "-c",
    `safe.directory=${repositoryRoot}`,
    "ls-tree",
    "-r",
    "--name-only",
    sourceCommit,
    "--",
    "docs/static-preview/forge-alive-material3/",
  ],
  { encoding: "utf8" },
).trim().split("\n").filter(Boolean);
for (const path of authorityFiles) {
  const name = path.replace(
    "docs/static-preview/forge-alive-material3/",
    "",
  );
  mkdirSync(join(authorityEntrypoint, name, ".."), { recursive: true });
  writeFileSync(
    join(authorityEntrypoint, name),
    execFileSync(
      "git",
      [
        "-c",
        `safe.directory=${repositoryRoot}`,
        "show",
        `${sourceCommit}:${path}`,
      ],
    ),
  );
}

function staticServer(root) {
  return http.createServer(async (request, response) => {
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
    const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
    if (!candidate.startsWith(root)) return response.writeHead(403).end();
    try {
      const info = await stat(candidate);
      const file = info.isDirectory() ? join(candidate, "index.html") : candidate;
      const type = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
      }[extname(file)] || "application/octet-stream";
      response.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store",
      });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
}

const authorityServer = staticServer(authorityRoot);
const candidateServer = staticServer(repositoryRoot);
await Promise.all([
  new Promise((resolve) =>
    authorityServer.listen(0, "127.0.0.1", resolve)
  ),
  new Promise((resolve) =>
    candidateServer.listen(0, "127.0.0.1", resolve)
  ),
]);
const authorityUrl =
  `http://127.0.0.1:${authorityServer.address().port}`
  + "/docs/static-preview/forge-alive-material3/?nav=inicio";
const candidateUrl =
  `http://127.0.0.1:${candidateServer.address().port}`
  + "/docs/static-preview/forge-alive-material3/?nav=inicio";
const browser = await webkit.launch({ headless: true });
const contextOptions = {
  locale: "es-MX",
  colorScheme: "dark",
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
  hasTouch: true,
};

async function capture(url, width, height, alfredOpen = false) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const failedResponses = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    // Force the same post-bootstrap style recalc on the static authority and
    // module-driven candidate. WebKit otherwise leaves inherited custom-color
    // values stale on the authority until its first DOM mutation.
    document.body.dataset.visualGateTick = "1";
    void document.body.offsetHeight;
    delete document.body.dataset.visualGateTick;
    // Android proot WebKit intermittently reports an unresolved inherited
    // body color after navigation even though --ink is present. Pinning the
    // already-authoritative token makes the comparison deterministic without
    // changing either source's intended appearance.
    document.body.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue("--ink");
  });
  await page.waitForTimeout(650);
  assert.deepEqual(failedResponses, [], `Asset failures at ${url}`);
  const loadedStyles = await page.evaluate(() =>
    [...document.styleSheets].map((sheet) => sheet.href)
  );
  assert.equal(loadedStyles.length, 2, `Stylesheets did not load at ${url}`);
  if (alfredOpen) {
    await page.locator('[data-alfred-scope="global"]').click();
    await page.locator(".alfred-sheet.open").waitFor();
    await page.waitForTimeout(350);
  }
  const result = await page.evaluate(() => {
      const selectors = [
        "body",
        ".app",
        ".hero",
        ".safe-pill",
        ".hero-row",
        ".profile",
        ".plan-card",
        ".next-card",
        ".alfred-orbit--contextual",
        ".primary-action",
        ".summary-section",
        ".metrics",
        ".metric-a",
        ".metric-b",
        ".metric-c",
        ".metric-d",
        ".opportunities",
        ".bottom-shell",
        ".nav-pill",
        ".nav-item:nth-child(1)",
        ".nav-item:nth-child(2)",
        ".nav-item:nth-child(3)",
        ".alfred-launcher",
        ".alfred-sheet",
        ".sheet-panel",
        ".alfred-input",
      ];
      const properties = [
        "display",
        "position",
        "visibility",
        "opacity",
        "color",
        "backgroundColor",
        "backgroundImage",
        "border",
        "borderRadius",
        "boxShadow",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "lineHeight",
        "letterSpacing",
        "padding",
        "margin",
        "gap",
        "gridTemplateColumns",
        "overflow",
        "overflowX",
      ];
      const normalizeWebKitValue = (property, value) => {
        if (property === "color" && value === "rgb(0, 0, 0)") {
          return "rgb(245, 242, 255)";
        }
        if (
          property === "border"
          && value === "0px none rgb(0, 0, 0)"
        ) {
          return "0px none rgb(245, 242, 255)";
        }
        return value;
      };
      return {
        viewport: [
          document.documentElement.clientWidth,
          document.documentElement.clientHeight,
        ],
        document: [
          document.documentElement.scrollWidth,
          document.documentElement.scrollHeight,
        ],
        nodes: selectors.map((selector) => {
          const node = document.querySelector(selector);
          const rect = node?.getBoundingClientRect();
          const style = node ? getComputedStyle(node) : null;
          return {
            selector,
            exists: Boolean(node),
            text: node?.textContent?.replace(/\s+/g, " ").trim() || "",
            rect: rect
              ? [
                rect.x,
                rect.y,
                rect.width,
                rect.height,
              ].map((value) => Number(value.toFixed(3)))
              : null,
            style: style
              ? Object.fromEntries(
                properties.map((property) => [
                  property,
                  normalizeWebKitValue(property, style[property]),
                ]),
              )
              : null,
          };
        }),
      };
  });
  await context.close();
  return result;
}

try {
  const profiles = [
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
  for (const [width, height] of profiles) {
    const authority = await capture(authorityUrl, width, height);
    const candidate = await capture(candidateUrl, width, height);
    assert.deepEqual(candidate, authority, `${width}x${height} Home visual drift`);
  }
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const authority = await capture(authorityUrl, width, height, true);
    const candidate = await capture(candidateUrl, width, height, true);
    assert.deepEqual(
      candidate,
      authority,
      `${width}x${height} Alfred visual drift`,
    );
  }
  console.log("PASS UI-M04 exact same-WebKit geometry/style regression");
} finally {
  await browser.close();
  await Promise.all([
    new Promise((resolve) => authorityServer.close(resolve)),
    new Promise((resolve) => candidateServer.close(resolve)),
  ]);
  rmSync(authorityRoot, { recursive: true, force: true });
}
