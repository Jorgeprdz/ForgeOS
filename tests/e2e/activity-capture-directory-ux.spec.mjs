import { expect, test } from "@playwright/test";

test("capture directory supports name search and explicit retry without exposing ids", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
    <section data-activity-aura>
      <section data-capture-host>
        <button type="button" data-open-manual-activity>+ Registrar</button>
        <dialog data-manual-activity-dialog>
          <form data-manual-activity-form method="dialog">
            <label>Persona relacionada
              <select data-related-reference name="relatedReference">
                <option value="">Selecciona una persona o prospecto</option>
                <option value="person:opaque-a">María González</option>
                <option value="prospect:opaque-b">Carlos Pérez</option>
              </select>
            </label>
            <p data-manual-activity-status role="status"></p>
          </form>
        </dialog>
      </section>
    </section>
  </body></html>`);

  await page.evaluate(async () => {
    const launcher = document.querySelector("[data-open-manual-activity]");
    const dialog = document.querySelector("dialog");
    const select = document.querySelector("[data-related-reference]");
    let reloads = 0;
    launcher.addEventListener("click", () => {
      if (!dialog.open) dialog.showModal();
      if (select.dataset.loaded !== "true") {
        reloads += 1;
        select.replaceChildren(
          new Option("Selecciona una persona o prospecto", ""),
          new Option(reloads === 1 ? "María González" : "Ana López", `person:opaque-${reloads}`),
          new Option("Carlos Pérez", `prospect:opaque-${reloads}`),
        );
        select.dataset.loaded = "true";
        document.querySelector("[data-manual-activity-status]").textContent = "Listo para registrar.";
      }
    });
    await import(`/docs/static-preview/forge-aura/activity/activity-capture-directory-ux.js?directory=${Date.now()}`);
    window.__directoryReloads = () => reloads;
  });

  await page.getByRole("button", { name: "+ Registrar" }).click();
  const search = page.getByRole("searchbox", { name: "Buscar persona o prospecto" });
  await expect(search).toBeVisible();
  await expect(page.getByRole("button", { name: "Recargar lista" })).toBeVisible();

  await search.fill("maría");
  expect(await page.locator('option').evaluateAll(options => options.map(option => ({ text: option.textContent, hidden: option.hidden })))).toEqual([
    { text: "Selecciona una persona o prospecto", hidden: false },
    { text: "María González", hidden: false },
    { text: "Carlos Pérez", hidden: true },
  ]);

  await page.getByRole("button", { name: "Recargar lista" }).click();
  await expect(page.locator("[data-manual-activity-status]")).toHaveText("Listo para registrar.");
  await expect(page.locator("[data-related-reference]")).toContainText("Ana López");
  expect(await page.evaluate(() => window.__directoryReloads())).toBe(2);
  await expect(page.locator("body")).not.toContainText("opaque-");
  await page.screenshot({ path: testInfo.outputPath("ACTIVITY-CAPTURE-DIRECTORY-SEARCH-RETRY.png"), fullPage: true });
});
