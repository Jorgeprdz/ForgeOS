'use strict';

const fs = require('fs');
const path = require('path');

const runtime = process.env.PW_RUNTIME;
const { chromium } = require(path.join(runtime, 'node_modules', 'playwright-core'));

const url = process.env.FORGE_URL;
const outputDir = process.env.FORGE_OUTPUT;
const executablePath = process.env.FORGE_BROWSER;
const sourceCommit = process.env.FORGE_SOURCE_COMMIT;

const screenshotProfiles = [
  {
    id: 'mobile-390x844',
    label: 'Mobile',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'tablet-portrait-800x1280',
    label: 'Tablet portrait',
    viewport: { width: 800, height: 1280 },
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'tablet-landscape-1100x800',
    label: 'Tablet landscape',
    viewport: { width: 1100, height: 800 },
    isMobile: false,
    hasTouch: true,
  },
  {
    id: 'desktop-1440x900',
    label: 'Desktop',
    viewport: { width: 1440, height: 900 },
    isMobile: false,
    hasTouch: false,
  },
  {
    id: 'desktop-wide-1920x1080',
    label: 'Desktop wide',
    viewport: { width: 1920, height: 1080 },
    isMobile: false,
    hasTouch: false,
  },
];

const boundaryProfiles = [
  { id: 'boundary-759x900', viewport: { width: 759, height: 900 } },
  { id: 'boundary-760x900', viewport: { width: 760, height: 900 } },
  { id: 'boundary-899x900', viewport: { width: 899, height: 900 } },
  { id: 'boundary-900x800', viewport: { width: 900, height: 800 } },
  { id: 'boundary-1199x800', viewport: { width: 1199, height: 800 } },
  { id: 'boundary-1200x800', viewport: { width: 1200, height: 800 } },
];

fs.mkdirSync(outputDir, { recursive: true });

function intersectionArea(a, b) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

async function collectLayout(page, profile) {
  return page.evaluate(({ profileId }) => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return {
        left: value.left,
        top: value.top,
        right: value.right,
        bottom: value.bottom,
        width: value.width,
        height: value.height,
      };
    };

    const visible = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const style = getComputedStyle(element);
      const value = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && value.width > 0
        && value.height > 0;
    };

    const opportunityCollisions = [...document.querySelectorAll('.opportunity')]
      .map((item, index) => {
        const copy = item.querySelector('.opportunity-copy')?.getBoundingClientRect();
        const score = item.querySelector('.score')?.getBoundingClientRect();

        if (!copy || !score) {
          return { index, overlap: false, area: 0 };
        }

        const width = Math.max(0, Math.min(copy.right, score.right) - Math.max(copy.left, score.left));
        const height = Math.max(0, Math.min(copy.bottom, score.bottom) - Math.max(copy.top, score.top));

        return {
          index,
          overlap: width * height > 1,
          area: width * height,
        };
      });

    const criticalSelectors = [
      '.plan-card',
      '.next-card',
      '.summary-section',
      '.opportunities',
      '.nav-pill',
      '.alfred-launcher',
    ];

    const horizontalBounds = criticalSelectors.map((selector) => {
      const value = rect(selector);
      return {
        selector,
        exists: Boolean(value),
        left: value?.left ?? null,
        right: value?.right ?? null,
        withinViewport: value
          ? value.left >= -1 && value.right <= window.innerWidth + 1
          : false,
      };
    });

    return {
      profileId,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      document: {
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
        horizontalOverflow:
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
          - window.innerWidth,
      },
      horizontalBounds,
      opportunityCollisions,
      navRect: rect('.nav-pill'),
      alfredRect: rect('.alfred-launcher'),
      contextualAlfredRect: rect('.alfred-orbit--contextual'),
      nextCardRect: rect('.next-card'),
      alfredSheetVisible: visible('.alfred-sheet.open'),
      media: {
        mobile: matchMedia('(max-width: 759px)').matches,
        tabletPortrait: matchMedia('(min-width: 760px) and (max-width: 899px)').matches,
        tabletLandscape: matchMedia('(min-width: 900px) and (max-width: 1199px)').matches,
        desktop: matchMedia('(min-width: 1200px)').matches,
      },
    };
  }, { profileId: profile.id });
}

function evaluateChecks(layout) {
  const failures = [];

  if (layout.document.horizontalOverflow > 1) {
    failures.push(`document horizontal overflow: ${layout.document.horizontalOverflow}px`);
  }

  for (const bound of layout.horizontalBounds) {
    if (!bound.exists) {
      failures.push(`missing critical element: ${bound.selector}`);
    } else if (!bound.withinViewport) {
      failures.push(`outside viewport: ${bound.selector} [${bound.left}, ${bound.right}]`);
    }
  }

  if (layout.navRect && layout.alfredRect) {
    const overlap = intersectionArea(layout.navRect, layout.alfredRect);
    if (overlap > 1) {
      failures.push(`nav pill overlaps Alfred launcher: ${overlap.toFixed(2)}px²`);
    }
  }

  if (layout.contextualAlfredRect && layout.nextCardRect) {
    const a = layout.contextualAlfredRect;
    const c = layout.nextCardRect;
    const inside =
      a.left >= c.left - 1
      && a.right <= c.right + 1
      && a.top >= c.top - 1
      && a.bottom <= c.bottom + 1;

    if (!inside) {
      failures.push('contextual Alfred is outside next-card bounds');
    }
  }

  for (const collision of layout.opportunityCollisions) {
    if (collision.overlap) {
      failures.push(`opportunity ${collision.index + 1} copy overlaps score`);
    }
  }

  return {
    pass: failures.length === 0,
    failures,
  };
}

async function waitForStablePage(page) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('.app', { state: 'visible' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(500);
}

async function testHaloMotion(page) {
  const halo = page.locator('.alfred-launcher .halo-a');
  const before = await halo.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(650);
  const after = await halo.evaluate((element) => getComputedStyle(element).transform);

  return {
    before,
    after,
    moved: before !== after,
  };
}

async function freezeMotion(page) {
  await page.addStyleTag({
    content: `
      .halo,
      .bow-tie {
        animation-delay: -2.15s !important;
        animation-play-state: paused !important;
      }
    `,
  });
  await page.waitForTimeout(80);
}

async function run() {
  const report = {
    sourceCommit,
    url,
    generatedAt: new Date().toISOString(),
    browserExecutable: executablePath,
    screenshots: [],
    boundaries: [],
    pass: true,
  };

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
    ],
  });

  try {
    for (const profile of screenshotProfiles) {
      const context = await browser.newContext({
        viewport: profile.viewport,
        screen: profile.viewport,
        deviceScaleFactor: 1,
        isMobile: profile.isMobile,
        hasTouch: profile.hasTouch,
        locale: 'es-MX',
        colorScheme: 'dark',
        reducedMotion: 'no-preference',
      });

      const page = await context.newPage();
      await waitForStablePage(page);

      const haloMotion = await testHaloMotion(page);
      await freezeMotion(page);

      const layout = await collectLayout(page, profile);
      const checks = evaluateChecks(layout);

      if (!haloMotion.moved) {
        checks.pass = false;
        checks.failures.push('Alfred halo motion was not detected');
      }

      const viewportFile = `${profile.id}-viewport.png`;
      const fullPageFile = `${profile.id}-full.png`;
      const alfredFile = `${profile.id}-alfred-open.png`;

      await page.screenshot({
        path: path.join(outputDir, viewportFile),
        fullPage: false,
      });

      await page.screenshot({
        path: path.join(outputDir, fullPageFile),
        fullPage: true,
      });

      await page.locator('.alfred-launcher').click();
      await page.waitForSelector('.alfred-sheet.open', { state: 'visible' });
      await page.waitForTimeout(280);
      await page.screenshot({
        path: path.join(outputDir, alfredFile),
        fullPage: false,
      });

      report.screenshots.push({
        ...profile,
        files: {
          viewport: viewportFile,
          fullPage: fullPageFile,
          alfredOpen: alfredFile,
        },
        layout,
        haloMotion,
        checks,
      });

      if (!checks.pass) report.pass = false;
      await context.close();
    }

    for (const profile of boundaryProfiles) {
      const context = await browser.newContext({
        viewport: profile.viewport,
        screen: profile.viewport,
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });

      const page = await context.newPage();
      await waitForStablePage(page);

      const layout = await collectLayout(page, profile);
      const checks = evaluateChecks(layout);

      report.boundaries.push({
        ...profile,
        layout,
        checks,
      });

      if (!checks.pass) report.pass = false;
      await context.close();
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(outputDir, 'responsive-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  const rows = [
    ...report.screenshots.map((entry) => ({
      id: entry.id,
      type: 'Screenshot',
      viewport: `${entry.viewport.width}×${entry.viewport.height}`,
      pass: entry.checks.pass,
      failures: entry.checks.failures.join('; ') || '—',
    })),
    ...report.boundaries.map((entry) => ({
      id: entry.id,
      type: 'Boundary',
      viewport: `${entry.viewport.width}×${entry.viewport.height}`,
      pass: entry.checks.pass,
      failures: entry.checks.failures.join('; ') || '—',
    })),
  ];

  const markdown = [
    '# Forge UI — Playwright responsive report',
    '',
    `- Source commit: \`${sourceCommit}\``,
    `- Generated: ${report.generatedAt}`,
    `- Result: **${report.pass ? 'PASS' : 'FAIL'}**`,
    '',
    '| Profile | Type | Viewport | Result | Findings |',
    '|---|---|---:|---|---|',
    ...rows.map((row) =>
      `| ${row.id} | ${row.type} | ${row.viewport} | ${row.pass ? 'PASS' : 'FAIL'} | ${row.failures.replace(/\|/g, '\\|')} |`
    ),
    '',
    '## Captures',
    '',
    ...report.screenshots.flatMap((entry) => [
      `### ${entry.label} — ${entry.viewport.width}×${entry.viewport.height}`,
      '',
      `- Viewport: \`${entry.files.viewport}\``,
      `- Full page: \`${entry.files.fullPage}\``,
      `- Alfred open: \`${entry.files.alfredOpen}\``,
      `- Halo motion: ${entry.haloMotion.moved ? 'PASS' : 'FAIL'}`,
      '',
    ]),
    '## Scope',
    '',
    '- Horizontal overflow.',
    '- Critical surfaces inside the viewport.',
    '- Separation between navigation and Alfred.',
    '- Alfred contextual inside the next-action card.',
    '- Opportunity text/score collisions.',
    '- Alfred halo motion.',
    '',
    'Virtual keyboards, Samsung Browser chrome and Android system bars still require real-device validation.',
    '',
  ].join('\n');

  fs.writeFileSync(
    path.join(outputDir, 'responsive-report.md'),
    markdown,
    'utf8'
  );

  const cards = report.screenshots.map((entry) => `
    <section>
      <h2>${entry.label} — ${entry.viewport.width}×${entry.viewport.height}</h2>
      <p class="${entry.checks.pass ? 'pass' : 'fail'}">
        ${entry.checks.pass ? 'PASS' : `FAIL: ${entry.checks.failures.join('; ')}`}
      </p>
      <div class="grid">
        <figure><img src="${entry.files.viewport}" alt=""><figcaption>Viewport</figcaption></figure>
        <figure><img src="${entry.files.fullPage}" alt=""><figcaption>Full page</figcaption></figure>
        <figure><img src="${entry.files.alfredOpen}" alt=""><figcaption>Alfred open</figcaption></figure>
      </div>
    </section>
  `).join('');

  const gallery = `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Forge UI Playwright Evidence</title>
<style>
  body { margin: 0; padding: 28px; background: #06101f; color: #f5f2ff; font-family: system-ui, sans-serif; }
  h1, h2 { letter-spacing: -.03em; }
  section { margin: 28px 0 48px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; align-items: start; }
  figure { margin: 0; padding: 12px; border: 1px solid #2c3f60; border-radius: 24px; background: #0d1b31; }
  img { width: 100%; height: auto; border-radius: 15px; display: block; }
  figcaption { padding: 10px 4px 2px; color: #aeb8d0; }
  .pass { color: #52e6df; }
  .fail { color: #ff9b7a; }
</style>
</head>
<body>
  <h1>Forge UI — Playwright Evidence</h1>
  <p>Source commit: <code>${sourceCommit}</code></p>
  ${cards}
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'index.html'), gallery, 'utf8');

  console.log(`PLAYWRIGHT_AUDIT=${report.pass ? 'PASS' : 'FAIL'}`);
  console.log(`OUTPUT=${outputDir}`);

  if (!report.pass) {
    process.exitCode = 2;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
