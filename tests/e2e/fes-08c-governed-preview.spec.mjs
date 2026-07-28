import { test, expect } from "@playwright/test";

const fixture =
  "/tests/e2e/fixtures/fes06c-productive-ui-binding/index.html";

const snapshot = {
  snapshot_version: "forge.projection_runtime_snapshot.v1",
  snapshot_id: "fes08c-preview-snapshot",
  snapshot_digest: "fes08c-preview-digest",
  bundles: [{
    prospect_id: "prospect-preview-001",
    activity: {
      items: [{
        activity_id: "activity-preview-001",
        event_id: "event-preview-001",
        category: "APPOINTMENT",
        title: "Cita inicial confirmada",
        occurred_at: "2026-07-28T20:00:00.000Z",
        confirmation_state: "CONFIRMED",
        pending_state: "NONE",
      }],
    },
    prospect_detail: {
      prospect_id: "prospect-preview-001",
      identity: { display_name: "Prospecto de evidencia" },
      counters: {
        context_count: 1,
        appointment_count: 1,
        due_action_count: 1,
        conflict_count: 0,
      },
      projection_digest: "detail-preview-digest",
    },
    pipeline_card: {
      prospect_id: "prospect-preview-001",
      stage: { code: "appointment_scheduled", label: "Cita" },
      last_activity: {
        title: "Cita inicial confirmada",
        occurred_at: "2026-07-28T20:00:00.000Z",
      },
      primary_attention: { label: "Preparar cita" },
      operational_status: "ACTIONABLE",
      conflict: false,
      projection_digest: "card-preview-digest",
    },
  }],
  mi_dia: { items: [] },
};

async function openFixture(page) {
  await page.addInitScript(value => {
    globalThis.__FES06C_INITIAL_SNAPSHOT__ = value;
  }, snapshot);
  await page.goto(fixture, { waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    globalThis.__FES06C_BINDING__?.current()?.state === "READY",
  );
}

test("production-equivalent branch bundle loads the productive Pipeline route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(
    "/ForgeOS/static-preview/forge-alive/?nav=pipeline",
    { waitUntil: "domcontentloaded" },
  );
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    path: "artifacts/fes08c-preview-screenshots/pipeline-route.png",
    fullPage: true,
  });
});

test("accepted Activity evidence renders Pipeline, Activity and Mi Día captures", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openFixture(page);

  await page.screenshot({
    path: "artifacts/fes08c-preview-screenshots/pipeline-state.png",
    fullPage: true,
  });
  await page.locator('[data-fes06b-surface="ACTIVITY"]').screenshot({
    path: "artifacts/fes08c-preview-screenshots/activity-state.png",
  });

  await page.evaluate(() => {
    dispatchEvent(new CustomEvent(
      "forge:accepted-activity-mi-dia-projected",
      {
        detail: {
          projection: {
            schemaVersion: "forge.mi_dia_accepted_activity_projection.v1",
            status: "PROJECTED",
            projectionId: "mi-dia:activity:activity-preview-002",
            sourceActivityId: "activity-preview-002",
            sourceEventId: "event-preview-002",
            prospectId: "prospect-preview-001",
            activityType: "INITIAL_APPOINTMENT_SCHEDULED",
            activityState: "SCHEDULED",
            label: "Cita inicial programada",
            priority: "ALTA",
            dueAt: "2026-07-29T18:00:00.000Z",
          },
        },
      },
    ));
  });

  await expect(
    page.locator('[data-fes06b-surface="MI_DIA"]'),
  ).toContainText("Cita inicial programada");
  await page.locator('[data-fes06b-surface="MI_DIA"]').screenshot({
    path: "artifacts/fes08c-preview-screenshots/mi-dia-state.png",
  });
  const geometry = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    homeHosts:
      document.querySelectorAll("[data-fes06b-home-binding]").length,
    pipelineHosts:
      document.querySelectorAll("[data-fes06b-pipeline-binding]").length,
  }));
  expect(geometry).toEqual({
    overflow: 0,
    homeHosts: 1,
    pipelineHosts: 1,
  });
});
