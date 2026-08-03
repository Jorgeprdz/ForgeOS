import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const profiles = [
  ['mobile-390x844', 390, 844, true],
  ['tablet-portrait-800x1280', 800, 1280, true],
  ['tablet-landscape-1100x800', 1100, 800, true],
  ['desktop-1440x900', 1440, 900, false],
  ['desktop-wide-1920x1080', 1920, 1080, false],
].map(([id, width, height, hasTouch]) => ({ id, width, height, hasTouch }));

const surfaces = ['home', 'activity', 'cartera'];
const screenshotRoot = path.resolve('artifacts/forge-ui-recovery/screenshots');
const reportRoot = path.resolve('artifacts/forge-ui-recovery/reports');

function px(value) {
  return Number.parseFloat(String(value || '0')) || 0;
}

test.beforeAll(() => {
  fs.mkdirSync(screenshotRoot, { recursive: true });
  fs.mkdirSync(reportRoot, { recursive: true });
});

test('Home, Activity and Cartera recover hierarchy in five responsive profiles', async ({ browser, baseURL }) => {
  const report = {
    sourceCommit: process.env.GITHUB_SHA || 'local',
    profiles: [],
    status: 'PASS',
  };

  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      screen: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
      hasTouch: profile.hasTouch,
      colorScheme: 'dark',
      locale: 'es-MX',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    try {
      for (const surface of surfaces) {
        await page.goto(
          `${baseURL}/tests/e2e/fixtures/forge-ui-recovery/index.html?surface=${surface}`,
          { waitUntil: 'networkidle' },
        );
        await expect(page.locator(`body[data-surface="${surface}"]`)).toBeVisible();

        const metrics = await page.evaluate((selectedSurface) => {
          const app = document.querySelector('.forge-module-viewport');
          const root = selectedSurface === 'home'
            ? document.querySelector('[data-surface="home"] .hero')
            : document.querySelector(`[data-surface="${selectedSurface}"]`);
          const heading = selectedSurface === 'cartera'
            ? document.querySelector('#cartera-title')
            : selectedSurface === 'activity'
              ? document.querySelector('.activity-hero h1')
              : document.querySelector('.hero h1');
          const control = selectedSurface === 'cartera'
            ? document.querySelector('[data-radar-horizon]')
            : selectedSurface === 'activity'
              ? document.querySelector('.activity-period')
              : document.querySelector('.acceptance-rail button');
          const appRect = app.getBoundingClientRect();
          const rootRect = root.getBoundingClientRect();
          const headingStyle = getComputedStyle(heading);
          const controlStyle = getComputedStyle(control);
          const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
          return {
            viewportWidth: document.documentElement.clientWidth,
            scrollWidth,
            appWidth: appRect.width,
            rootWidth: rootRect.width,
            rootLeft: rootRect.left,
            rootRight: rootRect.right,
            headingFont: headingStyle.fontFamily,
            headingLineHeight: headingStyle.lineHeight,
            headingHeight: heading.getBoundingClientRect().height,
            controlFont: controlStyle.fontFamily,
            appPaddingBottom: getComputedStyle(app).paddingBottom,
          };
        }, surface);

        expect(metrics.scrollWidth, `${profile.id}/${surface}: horizontal overflow`).toBeLessThanOrEqual(metrics.viewportWidth + 1);
        expect(metrics.rootWidth, `${profile.id}/${surface}: route collapsed`).toBeGreaterThan(metrics.appWidth * 0.82);
        expect(metrics.headingFont).toContain('Iowan Old Style');
        expect(metrics.controlFont).toContain('Inter');

        if (surface === 'activity') {
          const estimatedLines = metrics.headingHeight / px(metrics.headingLineHeight);
          expect(estimatedLines, `${profile.id}: Activity hero is too tall`).toBeLessThanOrEqual(3.1);
        }

        if (profile.width < 1200) {
          expect(px(metrics.appPaddingBottom), `${profile.id}: safe bottom reserve`).toBeGreaterThan(110);
        }

        if (surface === 'cartera') {
          const carteraChrome = await page.evaluate(() => {
            const summary = document.querySelector('[data-calendar-summary="today"]');
            const inactiveRadar = document.querySelector('[data-radar-horizon="TODAY"]');
            const summaryStyle = getComputedStyle(summary);
            const radarStyle = getComputedStyle(inactiveRadar);
            return {
              summaryBackground: summaryStyle.backgroundColor,
              summaryRadius: summaryStyle.borderRadius,
              summaryShadow: summaryStyle.boxShadow,
              radarBackground: radarStyle.backgroundColor,
              radarRadius: radarStyle.borderRadius,
              radarHeight: inactiveRadar.getBoundingClientRect().height,
            };
          });
          expect(carteraChrome.summaryBackground).toBe('rgba(0, 0, 0, 0)');
          expect(px(carteraChrome.summaryRadius)).toBe(0);
          expect(carteraChrome.summaryShadow).toBe('none');
          expect(carteraChrome.radarBackground).toBe('rgba(0, 0, 0, 0)');
          expect(px(carteraChrome.radarRadius)).toBeLessThanOrEqual(10);
          expect(carteraChrome.radarHeight).toBeLessThanOrEqual(36);
        }

        const dir = path.join(screenshotRoot, profile.id);
        fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({
          path: path.join(dir, `${surface}-viewport.png`),
          fullPage: false,
        });
        await page.screenshot({
          path: path.join(dir, `${surface}-full.png`),
          fullPage: true,
        });

        report.profiles.push({ profile: profile.id, surface, metrics, pass: true });
      }
    } finally {
      await context.close();
    }
  }

  fs.writeFileSync(
    path.join(reportRoot, 'acceptance.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
});
