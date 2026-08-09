import { test, expect } from "@playwright/test";

function filePayload() {
  return {
    name: "cotizacion-mobile-geometry-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  };
}

async function openCalculatedQuote(page, width) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/tests/fixtures/aura-quotes-premium-decision-experience-002.html");
  await expect(page.getByRole("heading", { name: "Cotizaciones", exact: true })).toBeVisible();
  await page.locator("[data-quotes-file]").setInputFiles(filePayload());
  await expect(page.locator("[data-aura-quotes]")).toHaveAttribute("data-state", /READY|PARTIAL/);
  await expect(page.locator(".aura-quotes__result")).toBeVisible();
}

async function forceLongCalculatedContent(page) {
  await page.evaluate(() => {
    const heroMetric = document.querySelector(".aura-quotes__hero-metric strong");
    if (heroMetric) heroMetric.textContent = "MXN\u00A0123,456,789,012,345.67";

    const heroStatus = document.querySelector(".aura-quotes__hero-status strong");
    if (heroStatus) heroStatus.textContent = "COTIZACION_PRODUCT_SPECIFIC_RESULTADO_VALIDADO_EXTENDIDO";

    const fact = document.querySelector(".aura-quotes__facts dd");
    if (fact) fact.textContent = "VALOR_CONTRACTUAL_PRODUCT_SPECIFIC_SIN_PUNTOS_DE_CORTE_12345678901234567890";

    const scenario = document.querySelector(".aura-quotes__scenario strong");
    if (scenario) scenario.textContent = "MXN\u00A0123,456,789,012,345.67";
  });
}

async function expectNoPageOverflow(page) {
  const geometry = await page.evaluate(() => {
    const root = document.documentElement;
    const selectors = [
      ".aura-quotes",
      ".aura-quotes__result",
      ".aura-quotes__hero",
      ".aura-quotes__workspace",
      ".aura-quotes__contextual-cta",
    ];
    return {
      viewport: root.clientWidth,
      scrollWidth: root.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      boxes: selectors
        .map(selector => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { selector, left: rect.left, right: rect.right, width: rect.width };
        })
        .filter(Boolean),
    };
  });

  expect(geometry.scrollWidth - geometry.viewport).toBeLessThanOrEqual(2);
  expect(geometry.bodyScrollWidth - geometry.viewport).toBeLessThanOrEqual(2);
  for (const box of geometry.boxes) {
    expect(box.left, `${box.selector} left edge`).toBeGreaterThanOrEqual(-2);
    expect(box.right, `${box.selector} right edge`).toBeLessThanOrEqual(geometry.viewport + 2);
  }
}

for (const width of [320, 360, 390]) {
  test(`calculated quote preserves mobile geometry at ${width}px with long product-specific values`, async ({ page }) => {
    await openCalculatedQuote(page, width);
    await forceLongCalculatedContent(page);
    await expectNoPageOverflow(page);

    await page.getByRole("tab", { name: "Beneficios" }).click();
    await expectNoPageOverflow(page);

    await page.getByRole("tab", { name: "Proyección" }).click();
    await expectNoPageOverflow(page);
  });
}
