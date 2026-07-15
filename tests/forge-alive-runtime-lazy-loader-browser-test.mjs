import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, webkit } from "playwright";

const url = process.env.FORGE_LOCAL_URL;
const evidence = process.env.FORGE_EVIDENCE_DIR;

if (!url || !evidence) {
  throw new Error("FORGE_LOCAL_URL and FORGE_EVIDENCE_DIR required");
}

fs.mkdirSync(evidence, { recursive: true });

const engines = [
  ["chromium", chromium],
  ["webkit", webkit],
];

const results = [];

for (const [name, browserType] of engines) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 780 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    globalThis.__forgeDocumentIdentity =
      `${Date.now()}-${Math.random()}`;
  });

  try {
    await page.goto(url, {
      waitUntil: "load",
      timeout: 120000,
    });

    await page.waitForFunction(() =>
      globalThis.ForgeRuntimeLazyLoaderR16J1C1
        ?.version === "R16J1C1_RUNTIME_LAZY_NAV_SYNC_03A3",
    );

    await page.waitForTimeout(3000);

    const home = await page.evaluate(() => ({
      documentIdentity: globalThis.__forgeDocumentIdentity,
      resources: performance
        .getEntriesByType("resource")
        .map((entry) => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
        })),
      scripts: document.scripts.length,
      styles: document.querySelectorAll(
        'link[rel="stylesheet"]',
      ).length,
      idlePrefetchLinks: document.querySelectorAll(
        'link[data-forge-quote-prefetch-r16j1c1="true"]',
      ).length,
    }));

    for (const asset of [
      "forge-quote-preview-bundle.js",
      "forge-quote-calculators.js",
      "forge-udi-mxn-runtime.js",
      "forge-quote-benefit-summary.js",
    ]) {
      const match = home.resources.find(
        (entry) => entry.name.includes(asset),
      );
      if (match) {
        throw new Error(
          `${asset} transferred on Home via ${match.initiatorType}`,
        );
      }
    }

    if (home.idlePrefetchLinks !== 0) {
      throw new Error(
        `Home created ${home.idlePrefetchLinks} quote prefetch links`,
      );
    }

    const firstStarted = Date.now();
    const firstBrowserClickMs = await page.evaluate(() => {
      const item = document.querySelector(
        'a[data-forge-nav-key="cotizaciones"]',
      );
      if (!item) throw new Error("Cotizaciones nav item missing");
      const started = performance.now();
      item.click();
      return performance.now() - started;
    });

    await page.waitForFunction(() => {
      const input = document.querySelector(
        "#fq-solution-online-pdf-105dr",
      );
      return Boolean(input && input.getClientRects().length > 0);
    });

    const firstOpenMs = Date.now() - firstStarted;

    await page.waitForFunction(() =>
      document.body.dataset
        .forgeQuoteRuntimeStateR16j1c1 === "shell-ready",
      null,
      { timeout: 30000 },
    );

    const shell = await page.evaluate(() => ({
      runtimeState:
        document.body.dataset
          .forgeQuoteRuntimeStateR16j1c1,
      resources: performance
        .getEntriesByType("resource")
        .map((entry) => entry.name),
    }));

    for (const asset of [
      "forge-quote-preview-bundle.js",
      "forge-quote-calculators.js",
      "forge-udi-mxn-runtime.js",
      "forge-quote-benefit-summary.js",
    ]) {
      if (shell.resources.some((entry) => entry.includes(asset))) {
        throw new Error(
          `${asset} transferred while opening quote shell`,
        );
      }
    }

    const selectorSynchronized = await page
      .waitForFunction(() => {
        const nav = document.querySelector(
          ".forge-mobile-nav-r16c5k-home-visual",
        );
        const active = nav?.querySelector(
          ":scope > .forge-mobile-nav-r16c5j__items > " +
          '.forge-mobile-nav-r16c5j__item' +
          '[data-forge-nav-key="cotizaciones"]',
        );
        const selector = nav?.querySelector(
          ":scope > .forge-mobile-nav-r16c5j__selector",
        );
        const rect = selector?.getBoundingClientRect();

        return Boolean(
          active?.getAttribute("aria-current") === "page" &&
          nav?.dataset.forgeMobileNavReadyR16c5j === "true" &&
          rect &&
          rect.width >= 20 &&
          rect.height >= 20,
        );
      }, null, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    const quote = await page.evaluate(() => {
      const nav = document.querySelector(
        ".forge-mobile-nav-r16c5k-home-visual",
      );
      const active = nav?.querySelector(
        ":scope > .forge-mobile-nav-r16c5j__items > " +
        '.forge-mobile-nav-r16c5j__item' +
        '[data-forge-nav-key="cotizaciones"]',
      );
      const selector = nav?.querySelector(
        ":scope > .forge-mobile-nav-r16c5j__selector",
      );
      const selectorRect = selector?.getBoundingClientRect();
      const activeRect = active?.getBoundingClientRect();

      return {
        documentIdentity: globalThis.__forgeDocumentIdentity,
        active:
          active?.getAttribute("aria-current") === "page",
        activeClass:
          active?.classList.contains("active") || false,
        activeWidth: activeRect?.width || 0,
        activeHeight: activeRect?.height || 0,
        ready:
          nav?.dataset.forgeMobileNavReadyR16c5j === "true",
        activeKey:
          nav?.dataset.forgeActiveKey || "",
        selectorExists: Boolean(selector),
        selectorWidth: selectorRect?.width || 0,
        selectorHeight: selectorRect?.height || 0,
        selectorOpacity: selector
          ? getComputedStyle(selector).opacity
          : "",
        selectorDisplay: selector
          ? getComputedStyle(selector).display
          : "",
        selectorVisibility: selector
          ? getComputedStyle(selector).visibility
          : "",
        selectorInlineWidth:
          selector?.style.getPropertyValue("width") || "",
        selectorInlineHeight:
          selector?.style.getPropertyValue("height") || "",
        selectorInlineOpacity:
          selector?.style.getPropertyValue("opacity") || "",
        selectorInlineTransform:
          selector?.style.getPropertyValue("transform") || "",
        selectorInlineWidthPriority:
          selector?.style.getPropertyPriority("width") || "",
        selectorInlineOpacityPriority:
          selector?.style.getPropertyPriority("opacity") || "",
        selectorTransform: selector
          ? getComputedStyle(selector).transform
          : "",
      };
    });

    console.log(
      `SELECTOR_STATE_${name.toUpperCase()}=` +
      JSON.stringify(quote),
    );

    if (quote.documentIdentity !== home.documentIdentity) {
      throw new Error("document reloaded Home to Quotes");
    }
    if (
      !selectorSynchronized ||
      !quote.active ||
      !quote.ready ||
      quote.selectorWidth < 20 ||
      quote.selectorHeight < 20 ||
      quote.selectorOpacity !== "1" ||
      quote.selectorDisplay === "none" ||
      quote.selectorVisibility !== "visible" ||
      quote.selectorInlineWidthPriority !== "important" ||
      quote.selectorInlineOpacityPriority !== "important"
    ) {
      throw new Error(
        "selector bubble not synchronized: " +
        JSON.stringify(quote),
      );
    }

    const chooserStarted = Date.now();
    const chooserPromise = page.waitForEvent(
      "filechooser",
      { timeout: 30000 },
    );
    await page.locator(
      'label[for="fq-solution-online-pdf-105dr"]',
    ).click({ force: true });
    await chooserPromise;
    const chooserMs = Date.now() - chooserStarted;

    const homeStarted = Date.now();
    const homeBrowserClickMs = await page.evaluate(() => {
      const item = document.querySelector(
        'a[data-forge-nav-key="inicio"]',
      );
      if (!item) throw new Error("Inicio nav item missing");
      const started = performance.now();
      item.click();
      return performance.now() - started;
    });

    await page.waitForFunction(() =>
      [...document.querySelectorAll("h1, h2, h3")]
        .some((node) =>
          /Buenos días,\s*Jorge/i.test(node.textContent || "") &&
          node.getClientRects().length > 0,
        ),
    );

    const homeRouteMs = Date.now() - homeStarted;

    const identityAfterHome = await page.evaluate(
      () => globalThis.__forgeDocumentIdentity,
    );
    if (identityAfterHome !== home.documentIdentity) {
      throw new Error("document reloaded Quotes to Home");
    }

    const warmStarted = Date.now();
    const warmBrowserClickMs = await page.evaluate(() => {
      const item = document.querySelector(
        'a[data-forge-nav-key="cotizaciones"]',
      );
      if (!item) throw new Error("Cotizaciones nav item missing");
      const started = performance.now();
      item.click();
      return performance.now() - started;
    });
    await page.waitForFunction(() => {
      const input = document.querySelector(
        "#fq-solution-online-pdf-105dr",
      );
      return Boolean(input && input.getClientRects().length > 0);
    });
    const warmOpenMs = Date.now() - warmStarted;

    const performanceAssessment = {
      firstShellRouteMs: firstOpenMs,
      warmShellRouteMs: warmOpenMs,
      quotesToHomeMs: homeRouteMs,
      fileChooserMs: chooserMs,
      firstBrowserClickMs:
        Number(firstBrowserClickMs.toFixed(2)),
      homeBrowserClickMs:
        Number(homeBrowserClickMs.toFixed(2)),
      warmBrowserClickMs:
        Number(warmBrowserClickMs.toFixed(2)),
      thresholdsAreBlocking: false,
      note:
        "Performance is observational. Functional correctness gates commit.",
    };

    console.log(
      `PERFORMANCE_${name.toUpperCase()}=` +
      JSON.stringify(performanceAssessment),
    );

    const runtimeStarted = Date.now();
    await page.evaluate(() =>
      globalThis.ForgeRuntimeLazyLoaderR16J1C1
        .loadQuoteRuntime(),
    );
    await page.waitForFunction(() =>
      document.body.dataset
        .forgeQuoteRuntimeStateR16j1c1 === "ready",
      null,
      { timeout: 120000 },
    );
    const runtimeLoadMs = Date.now() - runtimeStarted;

    const runtimeState = await page.evaluate(() =>
      globalThis.ForgeRuntimeLazyLoaderR16J1C1.getState(),
    );
    if (runtimeState.quoteRuntime !== "ready") {
      throw new Error("quote runtime did not reach ready");
    }

    await page.screenshot({
      path: path.join(evidence, `${name}-quotes-ready.png`),
      fullPage: true,
    });

    results.push({
      engine: name,
      status: "PASS",
      firstOpenMs,
      warmOpenMs,
      chooserMs,
      runtimeLoadMs,
      homeRouteMs,
      firstBrowserClickMs:
        Number(firstBrowserClickMs.toFixed(2)),
      homeBrowserClickMs:
        Number(homeBrowserClickMs.toFixed(2)),
      warmBrowserClickMs:
        Number(warmBrowserClickMs.toFixed(2)),
      performanceAssessment,
      homeScripts: home.scripts,
      homeStyles: home.styles,
      homeIdlePrefetchLinks: home.idlePrefetchLinks,
      sameDocument: true,
      selectorBubble: true,
    });
  } finally {
    await browser.close();
  }
}

fs.writeFileSync(
  path.join(evidence, "local-browser-results.json"),
  JSON.stringify(results, null, 2) + "\n",
);

console.log("PASS R16J1C1 local browser gate", results);
