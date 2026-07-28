import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const { comparePair } = require("./ui-m03-image-comparator.cjs");

const authorityRoot = process.env.FORGE_UI_M03_AUTHORITY_ROOT;
const candidateRoot = process.env.FORGE_UI_M03_CANDIDATE_ROOT;
const outputRoot = process.env.FORGE_UI_M03_OUTPUT;
const sourceCommit = process.env.FORGE_UI_M03_AUTHORITY_COMMIT;
const candidateCommit = process.env.GITHUB_SHA || "local-diagnostic";

if (!authorityRoot || !candidateRoot || !outputRoot || !sourceCommit) {
  throw new Error("Missing UI-M03 same-environment gate configuration");
}

const authorityDirectory = path.join(outputRoot, "authority");
const candidateDirectory = path.join(outputRoot, "candidate");
const diffsDirectory = path.join(outputRoot, "diffs");
const reportsDirectory = path.join(outputRoot, "reports");
const environmentDirectory = path.join(outputRoot, "environment");
const scratchDirectory = path.join(outputRoot, ".scratch");
for (const directory of [
  authorityDirectory,
  candidateDirectory,
  diffsDirectory,
  reportsDirectory,
  environmentDirectory,
  scratchDirectory,
]) {
  fs.mkdirSync(directory, { recursive: true });
}

const profiles = [
  ["mobile-390x844", 390, 844, true],
  ["tablet-portrait-800x1280", 800, 1280, true],
  ["tablet-landscape-1100x800", 1100, 800, true],
  ["desktop-1440x900", 1440, 900, false],
  ["desktop-wide-1920x1080", 1920, 1080, false],
].map(([id, width, height, hasTouch]) => ({
  id,
  viewport: { width, height },
  hasTouch,
}));

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

function serverFor(root, defaultDocument) {
  const requests = [];
  const server = http.createServer((request, response) => {
    const parsed = new URL(
      request.url || "/",
      `http://${request.headers.host || "127.0.0.1"}`,
    );
    const decoded = decodeURIComponent(parsed.pathname);
    const relative = decoded === "/" ? defaultDocument : decoded.slice(1);
    const absolute = path.resolve(root, relative);
    const withinRoot =
      absolute === path.resolve(root)
      || absolute.startsWith(`${path.resolve(root)}${path.sep}`);
    const exists =
      withinRoot
      && fs.existsSync(absolute)
      && fs.statSync(absolute).isFile();
    requests.push({
      path: parsed.pathname,
      status: exists ? 200 : 404,
    });
    if (!exists) {
      response.writeHead(404, {
        "content-type": "text/plain; charset=utf-8",
      });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "content-type":
        contentTypes.get(path.extname(absolute).toLowerCase())
        || "application/octet-stream",
      "cache-control": "no-store",
    });
    fs.createReadStream(absolute).pipe(response);
  });
  return { server, requests };
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}/`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function sourceAudit() {
  const authorityCss = path.join(
    authorityRoot,
    "examples",
    "home-mobile-md3-alfred.css",
  );
  const authorityTokens = path.join(
    authorityRoot,
    "forge-material3-tokens.css",
  );
  const candidateCss = path.join(candidateRoot, "app.css");
  const candidateTokens = path.join(candidateRoot, "tokens.css");
  const files = {
    authorityHtml: path.join(
      authorityRoot,
      "examples",
      "home-mobile-md3-alfred.html",
    ),
    authorityCss,
    authorityTokens,
    candidateHtml: path.join(candidateRoot, "index.html"),
    candidateCss,
    candidateTokens,
    candidateScript: path.join(candidateRoot, "app.js"),
  };
  for (const [name, file] of Object.entries(files)) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing source-audit file ${name}: ${file}`);
    }
  }
  const audit = {
    sourceCommit,
    candidateCommit,
    authorityCssSha256: sha256(authorityCss),
    candidateCssSha256: sha256(candidateCss),
    authorityTokensSha256: sha256(authorityTokens),
    candidateTokensSha256: sha256(candidateTokens),
  };
  audit.cssMatch =
    audit.authorityCssSha256 === audit.candidateCssSha256;
  audit.tokensMatch =
    audit.authorityTokensSha256 === audit.candidateTokensSha256;
  audit.pass = audit.cssMatch && audit.tokensMatch;
  fs.writeFileSync(
    path.join(reportsDirectory, "source-audit.json"),
    `${JSON.stringify(audit, null, 2)}\n`,
  );
  return audit;
}

async function stablePage(context, url) {
  const page = await context.newPage();
  const failedRequests = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });
  await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.locator(".app").waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(530);
  if (failedRequests.length > 0) {
    throw new Error(
      `Asset failures at ${url}: ${JSON.stringify(failedRequests)}`,
    );
  }
  return page;
}

async function auditPage(page) {
  return page.evaluate(() => {
    const count = (selector) =>
      document.querySelectorAll(selector).length;
    const viewportWidth = document.documentElement.clientWidth;
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    return {
      overflow: Math.max(0, scrollWidth - viewportWidth),
      trees: count("main.app"),
      headers: count("header.hero"),
      navs: count(".nav-pill"),
      globalAlfred: count('[data-alfred-scope="global"]'),
      contextualAlfred: count('[data-alfred-scope="contextual"]'),
      sheets: count(".alfred-sheet"),
      legacy: count(
        ".phone-shell,.forge-m3-app-shell,"
          + ".forge-desktop-workspace-056y",
      ),
      scrollWidth,
      scrollHeight: Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      ),
    };
  });
}

function structuralComparison(authority, candidate) {
  const countFields = [
    "trees",
    "headers",
    "navs",
    "globalAlfred",
    "contextualAlfred",
    "sheets",
    "legacy",
  ];
  let structuralDiff = 0;
  let missingComponents = 0;
  let unexpectedComponents = 0;
  for (const field of countFields) {
    const delta = candidate[field] - authority[field];
    if (delta !== 0) structuralDiff += 1;
    if (delta < 0) missingComponents += Math.abs(delta);
    if (delta > 0) unexpectedComponents += delta;
  }
  return {
    structuralDiff,
    missingComponents,
    unexpectedComponents,
    overflow: Math.max(authority.overflow, candidate.overflow),
  };
}

async function captureState(page, file, fullPage = false) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(40);
  await page.screenshot({
    path: file,
    fullPage,
    type: "png",
  });
}

async function openAlfred(page) {
  await page.locator('[data-alfred-scope="global"]').click({
    force: true,
  });
  await page.locator(".alfred-sheet.open").waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await page.waitForTimeout(300);
}

function reportMarkdown(report) {
  const rows = report.comparisons.map((entry) => [
    entry.profile,
    entry.dimensions.authority.join("x"),
    entry.dimensions.candidate.join("x"),
    entry.dimensions.widthDelta,
    entry.dimensions.heightDelta,
    entry.differingPixels,
    `${entry.differingPercent.toFixed(4)}%`,
    entry.ssim.toFixed(6),
    entry.visualResult,
  ]);
  return [
    "# UI-M03 same-environment source-authority comparison",
    "",
    `- Authority commit: \`${report.authoritySourceCommit}\``,
    `- Candidate commit: \`${report.candidateCommit}\``,
    `- Browser: ${report.environment.browserVersion}`,
    `- Result: ${report.pass ? "PASS" : "FAIL"}`,
    `- Visual failures: ${report.visualFailures}`,
    "",
    "| Profile | Authority | Candidate | Width delta | Height delta | Differing pixels | Differing percentage | SSIM | Result |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
  ].join("\n");
}

const authorityServer = serverFor(
  authorityRoot,
  "examples/home-mobile-md3-alfred.html",
);
const candidateServer = serverFor(candidateRoot, "index.html");
const authorityUrl = await listen(authorityServer.server);
const candidateUrl = await listen(candidateServer.server);
const source = sourceAudit();
let browser;

try {
  browser = await chromium.launch({
    headless: true,
  });
  const browserVersion = browser.version();
  const comparisons = [];

  for (const profile of profiles) {
    const contextOptions = {
      viewport: profile.viewport,
      screen: profile.viewport,
      deviceScaleFactor: 1,
      hasTouch: profile.hasTouch,
      colorScheme: "dark",
      locale: "es-MX",
      timezoneId: "America/Mexico_City",
      reducedMotion: "reduce",
    };
    const authorityContext = await browser.newContext(contextOptions);
    const candidateContext = await browser.newContext(contextOptions);

    try {
      const authorityPage = await stablePage(
        authorityContext,
        authorityUrl,
      );
      const candidatePage = await stablePage(
        candidateContext,
        candidateUrl,
      );
      const authorityAudit = await auditPage(authorityPage);
      const candidateAudit = await auditPage(candidatePage);
      const structural = structuralComparison(
        authorityAudit,
        candidateAudit,
      );

      for (const state of ["viewport", "full", "alfred-open"]) {
        if (state === "alfred-open") {
          await openAlfred(authorityPage);
          await openAlfred(candidatePage);
        }
        const authorityName =
          `authority-${profile.id}-${state}.png`;
        const candidateName =
          `candidate-${profile.id}-${state}.png`;
        const diffName = `${profile.id}-${state}.png`;
        const authorityFile = path.join(
          authorityDirectory,
          authorityName,
        );
        const candidateFile = path.join(
          candidateDirectory,
          candidateName,
        );
        const diffFile = path.join(diffsDirectory, diffName);
        const fullPage = state === "full";

        await captureState(authorityPage, authorityFile, fullPage);
        await captureState(candidatePage, candidateFile, fullPage);

        const pixel = comparePair({
          actual: candidateFile,
          golden: authorityFile,
          diff: diffFile,
          scratchDirectory,
        });
        const visualResult =
          pixel.pass
          && structural.structuralDiff === 0
          && structural.missingComponents === 0
          && structural.unexpectedComponents === 0
          && structural.overflow === 0
            ? "PASS"
            : "FAIL";
        comparisons.push({
          profile: `${profile.id}-${state}`,
          authority: authorityFile,
          candidate: candidateFile,
          diff: diffFile,
          authorityAudit,
          candidateAudit,
          dimensions: {
            authority: pixel.dimensions.golden,
            candidate: pixel.dimensions.actual,
            match: pixel.dimensions.match,
            widthDelta: pixel.dimensions.widthDelta,
            heightDelta: pixel.dimensions.heightDelta,
          },
          differingPixels: pixel.differingPixels,
          differingPercent: pixel.differingPercent,
          ssim: pixel.ssim,
          ...structural,
          visualResult,
          pass: visualResult === "PASS",
        });
      }
    } finally {
      await authorityContext.close();
      await candidateContext.close();
    }
  }

  const environment = {
    os: `${process.platform}-${process.arch}`,
    node: process.version,
    playwright: JSON.parse(
      fs.readFileSync(
        new URL("../node_modules/playwright/package.json", import.meta.url),
        "utf8",
      ),
    ).version,
    browserVersion,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    colorScheme: "dark",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  };
  const requestAudit = {
    authority: authorityServer.requests,
    candidate: candidateServer.requests,
    authority404: authorityServer.requests.filter(
      (entry) => entry.status === 404,
    ).length,
    candidate404: candidateServer.requests.filter(
      (entry) => entry.status === 404,
    ).length,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    gateModel: "SAME_ENVIRONMENT_SOURCE_AUTHORITY",
    authoritySourceCommit: sourceCommit,
    candidateCommit,
    authorityUrl,
    candidateUrl,
    sourceAudit: source,
    environment,
    requestAudit,
    thresholds: {
      dimensionMatch: true,
      widthDelta: 0,
      heightDelta: 0,
      structuralDiff: 0,
      missingComponents: 0,
      unexpectedComponents: 0,
      overflow: 0,
      ssimMinimum: 0.995,
      differingPercentMaximum: 0.5,
    },
    authorityScreenshotCount:
      fs.readdirSync(authorityDirectory).filter(
        (name) => name.endsWith(".png"),
      ).length,
    candidateScreenshotCount:
      fs.readdirSync(candidateDirectory).filter(
        (name) => name.endsWith(".png"),
      ).length,
    comparisons,
  };
  report.visualFailures = comparisons.filter(
    (entry) => !entry.pass,
  ).length;
  report.dimensionMatchCount = comparisons.filter(
    (entry) => entry.dimensions.match,
  ).length;
  report.pass =
    source.pass
    && requestAudit.authority404 === 0
    && requestAudit.candidate404 === 0
    && report.authorityScreenshotCount === 15
    && report.candidateScreenshotCount === 15
    && report.visualFailures === 0;

  fs.writeFileSync(
    path.join(environmentDirectory, "environment.json"),
    `${JSON.stringify(environment, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(reportsDirectory, "visual-comparison.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(reportsDirectory, "visual-comparison.md"),
    reportMarkdown(report),
  );
  process.stdout.write(
    [
      `AUTHORITY_SERVER=${requestAudit.authority404 === 0 ? "PASS" : "FAIL"}`,
      `CANDIDATE_SERVER=${requestAudit.candidate404 === 0 ? "PASS" : "FAIL"}`,
      `AUTHORITY_SCREENSHOT_COUNT=${report.authorityScreenshotCount}`,
      `CANDIDATE_SCREENSHOT_COUNT=${report.candidateScreenshotCount}`,
      `SAME_ENV_VISUAL_FAILURES=${report.visualFailures}`,
      `SAME_ENV_VISUAL_COMPARISON=${report.pass ? "PASS" : "FAIL"}`,
      "",
    ].join("\n"),
  );
  process.exitCode = report.pass ? 0 : 2;
} finally {
  if (browser) await browser.close();
  await close(authorityServer.server);
  await close(candidateServer.server);
  fs.rmSync(scratchDirectory, { recursive: true, force: true });
}
