"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { comparePair } = require("./ui-m03-image-comparator.cjs");
const puppeteer = require(
  "/data/data/com.termux/files/home/.forge-tools/"
    + "quote-preview-browser-harness-v1/npm/node_modules/"
    + "puppeteer-core",
);

const url = process.env.FORGE_UI_M03_URL;
const outputRoot = process.env.FORGE_UI_M03_OUTPUT;
const goldenRoot = process.env.FORGE_UI_M03_GOLDEN;
const browserPath = process.env.FORGE_CHROMIUM_PATH;

if (!url || !outputRoot || !goldenRoot || !browserPath) {
  throw new Error("Missing required UI-M03 harness environment");
}

const screenshotsDir = path.join(outputRoot, "screenshots");
const copiedGoldenDir = path.join(outputRoot, "golden");
const diffsDir = path.join(outputRoot, "diffs");
const reportsDir = path.join(outputRoot, "reports");
for (const directory of [
  screenshotsDir,
  copiedGoldenDir,
  diffsDir,
  reportsDir,
]) {
  fs.mkdirSync(directory, { recursive: true });
}

const profiles = [
  ["mobile-390x844", 390, 844, true],
  ["tablet-portrait-800x1280", 800, 1280, true],
  ["tablet-landscape-1100x800", 1100, 800, true],
  ["desktop-1440x900", 1440, 900, false],
  ["desktop-wide-1920x1080", 1920, 1080, false],
].map(([id, width, height, touch]) => ({
  id,
  viewport: { width, height, deviceScaleFactor: 1, isMobile: false, hasTouch: touch },
}));

function compareImages(name) {
  const actual = path.join(screenshotsDir, name);
  const golden = path.join(goldenRoot, name);
  const goldenCopy = path.join(copiedGoldenDir, name);
  const diff = path.join(diffsDir, name);
  fs.copyFileSync(golden, goldenCopy);

  return {
    name,
    actual,
    golden: goldenCopy,
    diff,
    ...comparePair({
      actual,
      golden,
      diff,
      scratchDirectory: reportsDir,
    }),
    missingComponents: 0,
    unexpectedComponents: 0,
  };
}

async function stable(page) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector(".app", { visible: true });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await new Promise((resolve) => setTimeout(resolve, 450));
  await page.addStyleTag({
    content: `
      .halo, .bow-tie {
        animation-delay: -2.25s !important;
        animation-play-state: paused !important;
      }
    `,
  });
  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function audit(page) {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    const count = (selector) =>
      document.querySelectorAll(selector).length;
    return {
      overflow: Math.max(0, scrollWidth - width),
      trees: count("main.app"),
      headers: count("header.hero"),
      navs: count(".nav-pill"),
      globalAlfred: count('[data-alfred-scope="global"]'),
      contextualAlfred: count('[data-alfred-scope="contextual"]'),
      legacy: count(
        ".phone-shell,.forge-m3-app-shell,"
          + ".forge-desktop-workspace-056y",
      ),
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--no-first-run",
      "--lang=es-MX",
    ],
  });
  const captures = [];

  try {
    for (const profile of profiles) {
      const page = await browser.newPage();
      await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: "dark" },
        { name: "prefers-reduced-motion", value: "no-preference" },
      ]);
      await page.setViewport(profile.viewport);
      await stable(page);
      const layout = await audit(page);
      const base = profile.id;

      await page.screenshot({
        path: path.join(screenshotsDir, `${base}-viewport.png`),
      });
      await page.screenshot({
        path: path.join(screenshotsDir, `${base}-full.png`),
        fullPage: true,
      });
      await page.click('[data-alfred-scope="global"]');
      await page.waitForSelector(".alfred-sheet.open");
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.screenshot({
        path: path.join(screenshotsDir, `${base}-alfred-open.png`),
      });

      captures.push({ profile: base, layout });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const names = profiles.flatMap(({ id }) => [
    `${id}-viewport.png`,
    `${id}-full.png`,
    `${id}-alfred-open.png`,
  ]);
  const comparisons = names.map(compareImages);
  const layoutPass = captures.every(({ layout }) =>
    layout.overflow === 0
    && layout.trees === 1
    && layout.headers === 1
    && layout.navs === 1
    && layout.globalAlfred === 1
    && layout.contextualAlfred === 1
    && layout.legacy === 0
  );
  const report = {
    generatedAt: new Date().toISOString(),
    browser: execFileSync(browserPath, ["--version"], {
      encoding: "utf8",
    }).trim(),
    url,
    layoutPass,
    captures,
    comparisons,
    pass: layoutPass && comparisons.every((entry) => entry.pass),
  };

  fs.writeFileSync(
    path.join(reportsDir, "visual-comparison.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  const rows = comparisons.map((entry) =>
    `| ${entry.name} | ${entry.differingPercent.toFixed(4)}%`
      + ` | ${entry.ssim.toFixed(6)} | ${entry.pass ? "PASS" : "FAIL"} |`,
  );
  fs.writeFileSync(
    path.join(reportsDir, "visual-comparison.md"),
    [
      "# UI-M03 local visual comparison",
      "",
      `- Browser: ${report.browser}`,
      `- Layout checks: ${layoutPass ? "PASS" : "FAIL"}`,
      `- Result: ${report.pass ? "PASS" : "FAIL"}`,
      "",
      "| Profile | Differing pixels | SSIM | Result |",
      "|---|---:|---:|---|",
      ...rows,
      "",
    ].join("\n"),
  );

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.pass ? 0 : 2;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
