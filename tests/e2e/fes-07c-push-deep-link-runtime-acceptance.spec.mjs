import { expect, test } from "@playwright/test";

const fixture =
  "/tests/e2e/fixtures/fes07c-push-deep-link-runtime/index.html";

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`${viewport.name} accepts the isolated local runtime`, async ({ page }) => {
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    await page.setViewportSize(viewport);
    await page.goto(fixture, { waitUntil: "networkidle" });
    await expect(page.locator("[data-fes07c-status]"))
      .toHaveAttribute("data-fes07c-ready", "true");

    const audit = await page.evaluate(() => {
      const state = globalThis.__FORGE_FES07C_ACCEPTANCE__;
      return {
        runtimeVersion: state.runtimeVersion,
        hostCount: document.querySelectorAll("[data-fes07c-host]").length,
        overflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        promptExecuted: state.explanation.permission_prompt_executed,
        pushExecuted: state.intent.push_execution,
        providerCalled: state.intent.external_provider_call,
        deliveryClaimed: state.intent.delivery_claimed,
        browserNavigation: state.resolved.browser_navigation_executed,
        truthMutation: state.resolved.canonical_truth_mutation,
        frozen:
          Object.isFrozen(state.intent) &&
          Object.isFrozen(state.intent.target),
      };
    });

    expect(audit).toEqual({
      runtimeVersion: "FES-07B.1",
      hostCount: 1,
      overflow: false,
      promptExecuted: false,
      pushExecuted: false,
      providerCalled: false,
      deliveryClaimed: false,
      browserNavigation: false,
      truthMutation: false,
      frozen: true,
    });
    expect(
      requests.every(url => new URL(url).origin === "http://127.0.0.1:4173"),
    ).toBe(true);
  });
}

test("repeated page lifecycle creates one isolated host", async ({ page }) => {
  await page.goto(fixture);
  await page.reload({ waitUntil: "networkidle" });
  await page.goBack({ waitUntil: "networkidle" });
  await page.goForward({ waitUntil: "networkidle" });
  await expect(page.locator("[data-fes07c-host]")).toHaveCount(1);
});
