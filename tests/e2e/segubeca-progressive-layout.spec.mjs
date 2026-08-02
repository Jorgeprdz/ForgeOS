import { expect, test } from "@playwright/test";

test("SeguBeca promotes the exact sum assured and keeps a progressive blue-gold layout", async ({ page, baseURL }) => {
  await page.goto(
    `${baseURL}/tests/e2e/fixtures/segubeca-progressive-layout/index.html`,
    { waitUntil: "domcontentloaded" },
  );

  await expect(page.locator("html")).toHaveAttribute(
    "data-segubeca-progressive-fixture-ready",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-segubeca-progressive-layout",
    "SEGUBECA-PROGRESSIVE-LAYOUT-001",
  );

  const result = await page.evaluate(() => {
    const projection = document.querySelector("[data-material3-quotes-projection]");
    const dashboard = projection?.querySelector('[data-forge-product-type="segubeca"]');
    const hero = dashboard?.querySelector('[data-forge-hero-metric="true"]');
    const source = projection?.querySelector('[data-quote-mandatory-metric="sum-assured"]');
    const sections = [...(dashboard?.children || [])].map((node) => ({
      kind:
        node.matches('[data-forge-hero-metric="true"]')
          ? "hero"
          : node.dataset.forgeProductSection,
      text: node.textContent.replace(/\s+/g, " ").trim(),
      span: node.dataset.forgeDesktopSpan || null,
    }));
    const heroStyle = getComputedStyle(hero);
    const titleStyle = getComputedStyle(
      dashboard.querySelector('[data-forge-product-section="summary"] h4'),
    );
    return {
      theme: projection?.dataset.segubecaTheme || null,
      dashboardTheme: dashboard?.dataset.forgeProductTheme || null,
      layout: dashboard?.dataset.forgeProductLayout || null,
      heroLabel: hero?.querySelector(".fq-benefit-hero-label-r16b")?.textContent || null,
      heroValue: hero?.querySelector(".fq-benefit-hero-value-r16b")?.textContent || null,
      heroSecondary:
        hero?.querySelector(".fq-benefit-hero-secondary-value-r16b")?.textContent || null,
      heroSource: hero?.dataset.forgeHeroSourceField || null,
      sourceHidden: source ? getComputedStyle(source).display === "none" : false,
      sectionKinds: sections.map((section) => section.kind),
      sectionTexts: sections.map((section) => section.text),
      spans: Object.fromEntries(sections.map((section) => [section.kind, section.span])),
      heroGridColumn: heroStyle.gridColumn,
      heroBackground: heroStyle.backgroundImage,
      titleColor: titleStyle.color,
      originalValuesPreserved: [
        "SeguBeca 18",
        "Juan Perez",
        "35,339 UDI",
        "30,000 UDI",
        "48 meses",
        "Protección por fallecimiento e invalidez",
        "ADAPTA",
        "Recuperación total final",
      ].every((value) => projection.innerText.includes(value)),
      wrongHeroVisible: projection.innerText.includes(
        "Beneficio de Pago de Suma Asegurada por Invalidez Total y Permanente",
      ),
    };
  });

  expect(result.theme).toBe("SEGUBECA_BLUE_GOLD");
  expect(result.dashboardTheme).toBe("segubeca_blue_gold");
  expect(result.layout).toBe("segubeca_progressive_001");
  expect(result.heroLabel).toBe("Suma asegurada");
  expect(result.heroValue).toBe("60,000 UDI");
  expect(result.heroSecondary).toBe("≈ $527,865 MXN");
  expect(result.heroSource).toBe("sum_assured_exact_display");
  expect(result.sourceHidden).toBe(true);
  expect(result.sectionKinds).toEqual([
    "hero",
    "summary",
    "participants",
    "contribution",
    "education_goal",
    "payout",
    "protection",
    "included_benefits",
    "additional_coverages",
    "secondary_details",
  ]);
  expect(result.spans.hero).toBe("12");
  expect(result.spans.summary).toBe("6");
  expect(result.spans.participants).toBe("6");
  expect(result.spans.contribution).toBe("6");
  expect(result.spans.education_goal).toBe("6");
  expect(result.spans.secondary_details).toBe("12");
  expect(result.heroGridColumn).toBe("1 / -1");
  expect(result.heroBackground).toContain("linear-gradient");
  expect(result.titleColor).toBe("rgb(91, 182, 255)");
  expect(result.originalValuesPreserved).toBe(true);
  expect(result.wrongHeroVisible).toBe(false);
});
