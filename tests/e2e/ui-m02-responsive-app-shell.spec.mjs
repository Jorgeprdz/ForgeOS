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

const rectState = async (page, selector) =>
  page.locator(selector).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return {
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom,
      width: bounds.width,
      height: bounds.height,
      display: style.display,
      visibility: style.visibility,
      opacity: Number(style.opacity),
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
  "legacy mode remains the default",
  async ({ page }) => {
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto("?nav=inicio");
    await page.waitForLoadState("domcontentloaded");

    const state = await page.evaluate(() => ({
      fixtureReady:
        document.documentElement.getAttribute(
          "data-ui-m02-fixture-ready",
        ),
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
      productMarked: Boolean(
        document.querySelector(
          '[data-forge-m3-product-surface="true"]',
        ),
      ),
    }));

    expect(state.fixtureReady).toBe("true");
    expect(state.shellCount).toBe(0);
    expect(state.runtime).toBeNull();
    expect(state.flagEnabled).toBe(false);
    expect(state.productExists).toBe(true);
    expect(state.productMarked).toBe(false);
    expect(pageErrors).toEqual([]);
  },
);

test(
  "Material 3 shell is responsive and actionable",
  async ({ page }, testInfo) => {
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

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

    const state = await page.evaluate(() => {
      const shell = document.querySelector(
        "[data-forge-m3-shell]",
      );

      const content = document.querySelector(
        "[data-forge-m3-content]",
      );

      const product = document.querySelector(
        '[data-forge-m3-product-surface="true"]',
      );

      const legacyMobileVisible = [
        ...document.querySelectorAll(
          ".forge-mobile-nav-r16c5j",
        ),
      ].filter((element) => {
        const style = getComputedStyle(element);

        return (
          style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity) > 0
          && element.getBoundingClientRect().width > 0
          && element.getBoundingClientRect().height > 0
        );
      }).length;

      const legacySidebar =
        document.querySelector(".dw-sidebar-056y");

      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        scrollWidth: Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        ),
        fixtureReady:
          document.documentElement.getAttribute(
            "data-ui-m02-fixture-ready",
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
        productInsideContent: Boolean(
          content
          && product
          && content.contains(product),
        ),
        legacyMobileVisible,
        legacySidebarDisplay: legacySidebar
          ? getComputedStyle(legacySidebar).display
          : null,
      };
    });

    expect(state.fixtureReady).toBe("true");
    expect(state.shellCount).toBe(1);
    expect(state.ready).toBe("true");
    expect(state.layout).toBe(
      testInfo.project.metadata.layout,
    );
    expect(state.activeRoute).toBe("inicio");
    expect(state.runtime).toBe("material3");
    expect(state.productInsideContent).toBe(true);

    expect(
      state.scrollWidth - state.viewport.width,
    ).toBeLessThanOrEqual(1);

    expect(state.legacyMobileVisible).toBe(0);

    if (
      testInfo.project.use.viewport.width >= 901
      && state.legacySidebarDisplay !== null
    ) {
      expect(state.legacySidebarDisplay).toBe("none");
    }

    const header = await rectState(
      page,
      "[data-forge-m3-header]",
    );

    const navRegion = await rectState(
      page,
      "[data-forge-m3-nav-region]",
    );

    const navPill = await rectState(
      page,
      ".forge-m3-shell__nav-pill",
    );

    const launcher = await rectState(
      page,
      "[data-forge-m3-open-alfred]",
    );

    expectInsideViewport(
      header,
      state.viewport,
      "header",
    );

    expectInsideViewport(
      navRegion,
      state.viewport,
      "navigation region",
    );

    expectInsideViewport(
      navPill,
      state.viewport,
      "navigation pill",
    );

    expectInsideViewport(
      launcher,
      state.viewport,
      "Alfred launcher",
    );

    expect(
      intersectionArea(navPill, launcher),
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

    const alfredLauncher = page.locator(
      "[data-forge-m3-open-alfred]",
    );

    await expect(alfredLauncher).toBeVisible();
    await alfredLauncher.click();

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

    await page
      .locator('[data-forge-m3-nav="pipeline"]')
      .click();

    await expect(
      page.locator("[data-forge-m3-shell]"),
    ).toHaveAttribute(
      "data-forge-m3-active-route",
      "pipeline",
    );

    const navigationState = await page.evaluate(() => ({
      nav: new URL(location.href).searchParams.get("nav"),
      events:
        window.UiM02AcceptanceFixture
          ?.navigationEvents
          ?.map((event) => event.key)
          ?? [],
      alfred:
        window.UiM02AcceptanceFixture
          ?.alfredEvents
          ?.map((event) => event.open)
          ?? [],
    }));

    expect(navigationState.nav).toBe("pipeline");
    expect(navigationState.events).toContain("pipeline");
    expect(navigationState.alfred).toContain(true);
    expect(navigationState.alfred).toContain(false);
    expect(pageErrors).toEqual([]);
  },
);
