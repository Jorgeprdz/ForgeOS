'use strict';

const fs = require('fs');
const path = require('path');

const runtime = process.env.PW_RUNTIME;
const browserPath = process.env.PW_BROWSER;
const outputDir = process.env.PW_OUTPUT;
const url = process.env.FORGE_URL;
const sourceCommit = process.env.FORGE_SOURCE_COMMIT;
const profileRoot = process.env.PW_PROFILE_ROOT;

if (
  !runtime
  || !browserPath
  || !outputDir
  || !url
  || !sourceCommit
  || !profileRoot
) {
  throw new Error('Faltan variables requeridas para Playwright.');
}

const { chromium } = require(
  path.join(runtime, 'node_modules', 'playwright-core')
);

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(profileRoot, { recursive: true });

const screenshotProfiles = [
  {
    id: 'mobile-390x844',
    label: 'Mobile',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  },
  {
    id: 'tablet-portrait-800x1280',
    label: 'Tablet portrait',
    viewport: { width: 800, height: 1280 },
    hasTouch: true,
  },
  {
    id: 'tablet-landscape-1100x800',
    label: 'Tablet landscape',
    viewport: { width: 1100, height: 800 },
    hasTouch: true,
  },
  {
    id: 'desktop-1440x900',
    label: 'Desktop',
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
  },
  {
    id: 'desktop-wide-1920x1080',
    label: 'Desktop wide',
    viewport: { width: 1920, height: 1080 },
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

function withTimeout(promise, milliseconds, label) {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} excedió ${milliseconds} ms`)),
      milliseconds
    );
  });

  return Promise.race([promise, timeout])
    .finally(() => clearTimeout(timer));
}

function intersectionArea(a, b) {
  const width = Math.max(
    0,
    Math.min(a.right, b.right) - Math.max(a.left, b.left)
  );

  const height = Math.max(
    0,
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  );

  return width * height;
}

async function openContext(profile) {
  const profileDir = path.join(profileRoot, profile.id);

  fs.rmSync(profileDir, {
    recursive: true,
    force: true,
  });

  return withTimeout(
    chromium.launchPersistentContext(profileDir, {
      executablePath: browserPath,
      headless: false,
      chromiumSandbox: false,
      viewport: profile.viewport,
      screen: profile.viewport,
      deviceScaleFactor: 1,
      hasTouch: Boolean(profile.hasTouch),
      colorScheme: 'dark',
      locale: 'es-MX',
      reducedMotion: 'no-preference',
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-gpu-compositing',
        '--disable-gpu-rasterization',
        '--no-zygote',
        '--hide-scrollbars',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-default-apps',
        '--no-first-run',
      ],
    }),
    65000,
    `launchPersistentContext ${profile.id}`
  );
}

async function getPage(context) {
  return context.pages()[0]
    || withTimeout(
      context.newPage(),
      30000,
      'context.newPage'
    );
}

async function waitForStablePage(page) {
  await withTimeout(
    page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    }),
    35000,
    'page.goto'
  );

  await page.waitForSelector('.app', {
    state: 'visible',
    timeout: 10000,
  });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.waitForTimeout(450);
}

async function detectHaloMotion(page) {
  const halo = page.locator('.alfred-launcher .halo-a');

  await halo.waitFor({
    state: 'visible',
    timeout: 10000,
  });

  const before = await halo.evaluate(
    (element) => getComputedStyle(element).transform
  );

  await page.waitForTimeout(700);

  const after = await halo.evaluate(
    (element) => getComputedStyle(element).transform
  );

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
        animation-delay: -2.25s !important;
        animation-play-state: paused !important;
      }
    `,
  });

  await page.waitForTimeout(80);
}

async function collectLayout(page, profileId) {
  return page.evaluate(({ profileId }) => {
    const rect = (selector) => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

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

    const criticalSelectors = [
      '.plan-card',
      '.next-card',
      '.summary-section',
      '.opportunities',
      '.nav-pill',
      '.alfred-launcher',
    ];

    const opportunityCollisions = [
      ...document.querySelectorAll('.opportunity'),
    ].map((item, index) => {
      const copy = item
        .querySelector('.opportunity-copy')
        ?.getBoundingClientRect();

      const score = item
        .querySelector('.score')
        ?.getBoundingClientRect();

      if (!copy || !score) {
        return {
          index,
          overlap: false,
          area: 0,
        };
      }

      const width = Math.max(
        0,
        Math.min(copy.right, score.right)
          - Math.max(copy.left, score.left)
      );

      const height = Math.max(
        0,
        Math.min(copy.bottom, score.bottom)
          - Math.max(copy.top, score.top)
      );

      return {
        index,
        overlap: width * height > 1,
        area: width * height,
      };
    });

    return {
      profileId,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      document: {
        scrollWidth: Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ),
        scrollHeight: Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        ),
      },
      horizontalBounds: criticalSelectors.map((selector) => {
        const value = rect(selector);

        return {
          selector,
          exists: Boolean(value),
          withinViewport: value
            ? value.left >= -1
              && value.right <= window.innerWidth + 1
            : false,
        };
      }),
      opportunityCollisions,
      navRect: rect('.nav-pill'),
      alfredRect: rect('.alfred-launcher'),
      contextualAlfredRect: rect('.alfred-orbit--contextual'),
      nextCardRect: rect('.next-card'),
      media: {
        mobile:
          matchMedia('(max-width: 759px)').matches,
        tabletPortrait:
          matchMedia(
            '(min-width: 760px) and (max-width: 899px)'
          ).matches,
        tabletLandscape:
          matchMedia(
            '(min-width: 900px) and (max-width: 1199px)'
          ).matches,
        desktop:
          matchMedia('(min-width: 1200px)').matches,
      },
    };
  }, { profileId });
}

function evaluateChecks(layout) {
  const failures = [];

  const horizontalOverflow =
    layout.document.scrollWidth - layout.viewport.width;

  if (horizontalOverflow > 1) {
    failures.push(
      `document horizontal overflow: ${horizontalOverflow}px`
    );
  }

  for (const bound of layout.horizontalBounds) {
    if (!bound.exists) {
      failures.push(
        `missing critical element: ${bound.selector}`
      );
    } else if (!bound.withinViewport) {
      failures.push(
        `outside viewport: ${bound.selector}`
      );
    }
  }

  if (layout.navRect && layout.alfredRect) {
    const overlap = intersectionArea(
      layout.navRect,
      layout.alfredRect
    );

    if (overlap > 1) {
      failures.push(
        `nav pill overlaps Alfred launcher: ${overlap.toFixed(2)}px²`
      );
    }
  }

  if (layout.contextualAlfredRect && layout.nextCardRect) {
    const alfred = layout.contextualAlfredRect;
    const card = layout.nextCardRect;

    const inside =
      alfred.left >= card.left - 1
      && alfred.right <= card.right + 1
      && alfred.top >= card.top - 1
      && alfred.bottom <= card.bottom + 1;

    if (!inside) {
      failures.push(
        'contextual Alfred is outside next-card bounds'
      );
    }
  }

  for (const collision of layout.opportunityCollisions) {
    if (collision.overlap) {
      failures.push(
        `opportunity ${collision.index + 1} copy overlaps score`
      );
    }
  }

  return {
    pass: failures.length === 0,
    failures,
  };
}

async function captureProfile(profile, report) {
  console.log(`PROFILE_START=${profile.id}`);

  const context = await openContext(profile);

  try {
    const page = await getPage(context);

    await waitForStablePage(page);

    const haloMotion = await detectHaloMotion(page);

    await freezeMotion(page);

    const layout = await collectLayout(page, profile.id);
    const checks = evaluateChecks(layout);

    if (!haloMotion.moved) {
      checks.pass = false;
      checks.failures.push(
        'Alfred halo motion was not detected'
      );
    }

    const files = {
      viewport: `${profile.id}-viewport.png`,
      fullPage: `${profile.id}-full.png`,
      alfredOpen: `${profile.id}-alfred-open.png`,
    };

    await withTimeout(
      page.screenshot({
        path: path.join(outputDir, files.viewport),
        fullPage: false,
      }),
      40000,
      `viewport screenshot ${profile.id}`
    );

    await withTimeout(
      page.screenshot({
        path: path.join(outputDir, files.fullPage),
        fullPage: true,
      }),
      50000,
      `full screenshot ${profile.id}`
    );

    await page
      .locator('[data-alfred-scope="global"]')
      .click({
        force: true,
        timeout: 10000,
      });

    await page.waitForSelector('.alfred-sheet.open', {
      state: 'visible',
      timeout: 10000,
    });

    await page.waitForTimeout(300);

    await withTimeout(
      page.screenshot({
        path: path.join(outputDir, files.alfredOpen),
        fullPage: false,
      }),
      40000,
      `Alfred screenshot ${profile.id}`
    );

    report.screenshots.push({
      ...profile,
      files,
      haloMotion,
      layout,
      checks,
    });

    if (!checks.pass) {
      report.pass = false;
    }

    console.log(
      `PROFILE_DONE=${profile.id} RESULT=${
        checks.pass ? 'PASS' : 'FAIL'
      }`
    );
  } finally {
    await context.close();
  }
}

async function auditBoundary(profile, report) {
  console.log(`BOUNDARY_START=${profile.id}`);

  const context = await openContext({
    ...profile,
    hasTouch: false,
  });

  try {
    const page = await getPage(context);

    await waitForStablePage(page);

    const layout = await collectLayout(page, profile.id);
    const checks = evaluateChecks(layout);

    report.boundaries.push({
      ...profile,
      layout,
      checks,
    });

    if (!checks.pass) {
      report.pass = false;
    }

    console.log(
      `BOUNDARY_DONE=${profile.id} RESULT=${
        checks.pass ? 'PASS' : 'FAIL'
      }`
    );
  } finally {
    await context.close();
  }
}

function writeReports(report) {
  fs.writeFileSync(
    path.join(outputDir, 'responsive-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  const rows = [
    ...report.screenshots.map((entry) => ({
      profile: entry.id,
      type: 'Screenshot',
      viewport:
        `${entry.viewport.width}×${entry.viewport.height}`,
      result: entry.checks.pass ? 'PASS' : 'FAIL',
      findings:
        entry.checks.failures.join('; ') || '—',
    })),
    ...report.boundaries.map((entry) => ({
      profile: entry.id,
      type: 'Boundary',
      viewport:
        `${entry.viewport.width}×${entry.viewport.height}`,
      result: entry.checks.pass ? 'PASS' : 'FAIL',
      findings:
        entry.checks.failures.join('; ') || '—',
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
      `| ${row.profile} | ${row.type} | ${row.viewport} | ${row.result} | ${row.findings.replace(/\|/g, '\\|')} |`
    ),
    '',
    '## Capturas',
    '',
    ...report.screenshots.flatMap((entry) => [
      `### ${entry.label}`,
      '',
      `- Viewport: \`${entry.files.viewport}\``,
      `- Full page: \`${entry.files.fullPage}\``,
      `- Alfred open: \`${entry.files.alfredOpen}\``,
      `- Halo motion: ${entry.haloMotion.moved ? 'PASS' : 'FAIL'}`,
      '',
    ]),
    '## Scope',
    '',
    '- Cinco viewports deterministas.',
    '- Tres capturas PNG por viewport.',
    '- Seis límites responsive.',
    '- Overflow horizontal.',
    '- Separación entre navegación y Alfred.',
    '- Alfred contextual dentro de su tarjeta.',
    '- Colisiones de Oportunidades.',
    '- Movimiento del halo.',
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
        ${entry.checks.pass
          ? 'PASS'
          : `FAIL: ${entry.checks.failures.join('; ')}`
        }
      </p>
      <div class="grid">
        <figure>
          <img src="${entry.files.viewport}" alt="">
          <figcaption>Viewport</figcaption>
        </figure>
        <figure>
          <img src="${entry.files.fullPage}" alt="">
          <figcaption>Full page</figcaption>
        </figure>
        <figure>
          <img src="${entry.files.alfredOpen}" alt="">
          <figcaption>Alfred open</figcaption>
        </figure>
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
  body {
    margin: 0;
    padding: 28px;
    background: #06101f;
    color: #f5f2ff;
    font-family: system-ui, sans-serif;
  }
  h1, h2 { letter-spacing: -.03em; }
  section { margin: 28px 0 48px; }
  .grid {
    display: grid;
    grid-template-columns:
      repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
    align-items: start;
  }
  figure {
    margin: 0;
    padding: 12px;
    border: 1px solid #2c3f60;
    border-radius: 24px;
    background: #0d1b31;
  }
  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 15px;
  }
  figcaption {
    padding: 10px 4px 2px;
    color: #aeb8d0;
  }
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

  fs.writeFileSync(
    path.join(outputDir, 'index.html'),
    gallery,
    'utf8'
  );
}

async function run() {
  const report = {
    sourceCommit,
    url,
    generatedAt: new Date().toISOString(),
    browserExecutable: browserPath,
    screenshots: [],
    boundaries: [],
    pass: true,
  };

  fs.writeFileSync(
    path.join(outputDir, 'capture-started.json'),
    JSON.stringify(
      {
        sourceCommit,
        startedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );

  for (const profile of screenshotProfiles) {
    await captureProfile(profile, report);
  }

  for (const profile of boundaryProfiles) {
    await auditBoundary(profile, report);
  }

  writeReports(report);

  const pngCount = fs
    .readdirSync(outputDir)
    .filter((name) => name.endsWith('.png'))
    .length;

  fs.writeFileSync(
    path.join(outputDir, 'capture-complete.json'),
    JSON.stringify(
      {
        sourceCommit,
        completedAt: new Date().toISOString(),
        pngCount,
        screenshotProfiles: report.screenshots.length,
        boundaryProfiles: report.boundaries.length,
        pass: report.pass,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `CAPTURE_COMPLETE PNG=${pngCount} RESULT=${
      report.pass ? 'PASS' : 'FAIL'
    }`
  );

  if (!report.pass) {
    process.exitCode = 2;
  }
}

const watchdog = setTimeout(() => {
  console.error('ERROR: watchdog global de 10 minutos.');
  process.exitCode = 124;
}, 600000);

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    clearTimeout(watchdog);
  });
