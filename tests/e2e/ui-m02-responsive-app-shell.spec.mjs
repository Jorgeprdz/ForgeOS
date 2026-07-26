import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const artifactRoot = path.resolve(
  "artifacts/ui-m02",
);

const screenshotsRoot = path.join(
  artifactRoot,
  "screenshots",
);

fs.mkdirSync(
  screenshotsRoot,
  {
    recursive: true,
  },
);

const intersectionArea = (left, right) => {
  const width = Math.max(
    0,
    Math.min(left.right, right.right)
      - Math.max(left.left, right.left),
  );

  const height = Math.max(
    0,
    Math.min(left.bottom, right.bottom)
      - Math.max(left.top, right.top),
  );

  return width * height;
};

const shellState = async (page) =>
  page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const value = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        left: value.left,
        top: value.top,
        right: value.right,
        bottom: value.bottom,
        width: value.width,
        height: value.height,
        display: style.display,
        visibility: style.visibility,
        opacity: Number(style.opacity),
      };
    };

    const shell = document.querySelector(
      "[data-forge-m3-shell]",
    );

    const content = document.querySelector(
      "[data-forge-m3-content]",
    );

    const product = document.querySelector(
      '[data-forge-m3-product-surface="true"]',
    );

    const legacyMobileNav = document.querySelector(
      ".forge-mobile-nav-r16c5j",
    );

    const legacySidebar = document.querySelector(
      ".dw-sidebar-056y",
    );

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      scrollWidth: Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ),
      shellCount: document.querySelectorAll(
        "[data-forge-m3-shell]",
      ).length,
      ready: shell?.getAttribute(
        "data-forge-m3-shell-ready",
      ),
      layout: shell?.getAttribute(
        "data-forge-m3-layout",
      ),
      activeRoute: shell?.getAttribute(
        "data-forge-m3-active-route",
      ),
      runtime:
        document.documentElement.getAttribute(
          "data-forge-ui-runtime",
        ),
      productExists: Boolean(product),
      productInsideContent: Boolean(
        content
        && product
        && content.contains(product),
      ),
      legacyMobileNavDisplay: legacyMobileNav
        ? getComputedStyle(legacyMobileNav).display
        : null,
      legacySidebarDisplay: legacySidebar
        ? getComputedStyle(legacySidebar).display
        : null,
      header: rect("[data-forge-m3-header]"),
      navRegion: rect("[data-forge-m3-nav-region]"),
      navPill: rect(".forge-m3-shell__nav-pill"),
      launcher: rect("[data-forge-m3-open-alfred]"),
    };
  });

const expectInsideViewport = (
  value,
  viewport,
  name,
) => {
  expect(value, `${name} missing`).not.toBeNull();

  expect(
    value.left,
    `${name} left`,
  ).toBeGreaterThanOrEqual(-1);

  expect(
    value.top,
    `${name} top`,
  ).toBeGreaterThanOrEqual(-1);

  expect(
    value.right,
    `${name} right`,
  ).toBeLessThanOrEqual(viewport.width + 1);

  expect(
    value.bottom,
    `${name} bottom`,
  ).toBeLessThanOrEqual(viewport.height + 1);

  expect(
    value.display,
    `${name} display`,
  ).not.toBe("none");

  expect(
    value.visibility,
    `${name} visibility`,
  ).toBe("visible");

  expect(
    value.opacity,
    `${name} opacity`,
  ).toBeGreaterThan(0);
};

test(
  "legacy route remains the default",
  async ({ page }) => {
    await page.goto("?nav=inicio");

    await page.waitForLoadState(
      "domcontentloaded",
    );

    const state = await page.evaluate(() => ({
      shellCount: document.querySelectorAll(
        "[data-forge-m3-shell]",
      ).length,
      runtime:
        document.documentElement.getAttribute(
          "data-forge-ui-runtime",
        ),
      flagEnabled:
        window.ForgeUiRuntimeFlag?.enabled ?? null,
      productExists: Boolean(
        document.querySelector(".phone-shell"),
      ),
    }));

    expect(state.shellCount).toBe(0);
    expect(state.runtime).toBeNull();
    expect(state.flagEnabled).toBe(false);
    expect(state.productExists).toBe(true);
  },
);

test(
  "Material 3 shell is responsive and Alfred is actionable",
  async ({ page }, testInfo) => {
    await page.goto(
      "?nav=inicio&forgeUi=material3",
    );

    await page.waitForSelector(
      '[data-forge-m3-shell-ready="true"]',
    );

    await page.addStyleTag({
      content: `
        .forge-m3-shell__halo,
        .forge-m3-shell__halo--soft {
          animation-delay: -2.2s !important;
          animation-play-state: paused !important;
        }
      `,
    });

    const state = await shellState(page);

    expect(state.shellCount).toBe(1);
    expect(state.ready).toBe("true");
    expect(state.layout).toBe(testInfo.project.metadata.layout);
    expect(state.activeRoute).toBe("inicio");
    expect(state.runtime).toBe("material3");
    expect(state.productExists).toBe(true);
    expect(state.productInsideContent).toBe(true);

    expect(
      state.scrollWidth - state.viewport.width,
    ).toBeLessThanOrEqual(1);

    if (state.legacyMobileNavDisplay !== null) {
      expect(state.legacyMobileNavDisplay).toBe("none");
    }

    if (
      testInfo.project.use.viewport.width >= 901
      && state.legacySidebarDisplay !== null
    ) {
      expect(state.legacySidebarDisplay).toBe("none");
    }

    expectInsideViewport(
      state.header,
      state.viewport,
      "header",
    );

    expectInsideViewport(
      state.navRegion,
      state.viewport,
      "navigation region",
    );

    expectInsideViewport(
      state.navPill,
      state.viewport,
      "navigation pill",
    );

    expectInsideViewport(
      state.launcher,
      state.viewport,
      "Alfred launcher",
    );

    expect(
      intersectionArea(
        state.navPill,
        state.launcher,
      ),
    ).toBeLessThanOrEqual(1);

    const shellScreenshot = path.join(
      screenshotsRoot,
      `${testInfo.project.name}-shell.png`,
    );

    const alfredScreenshot = path.join(
      screenshotsRoot,
      `${testInfo.project.name}-alfred-open.png`,
    );

    await page.screenshot({
      path: shellScreenshot,
      fullPage: false,
    });

    const launcher = page.locator(
      "[data-forge-m3-open-alfred]",
    );

    await expect(launcher).toBeVisible();
    await launcher.click();

    const sheet = page.locator(
      "[data-forge-m3-alfred-sheet]",
    );

    const panel = page.locator(
      ".forge-m3-shell__alfred-panel",
    );

    await expect(sheet).toHaveClass(/is-open/);
    await expect(sheet).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    await expect(panel).toBeVisible();

    await page.screenshot({
      path: alfredScreenshot,
      fullPage: false,
    });

    await page.keyboard.press("Escape");

    await expect(sheet).not.toHaveClass(/is-open/);
    await expect(sheet).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
);
