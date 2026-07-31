import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildGoogleCalendarTemplateUrl,
} from "../docs/static-preview/forge-alive-material3/pipeline-calendar-action.js";

const runtimePath = new URL(
  "../docs/static-preview/forge-alive-material3/pipeline-calendar-action.js",
  import.meta.url,
);
const cssPath = new URL(
  "../docs/static-preview/forge-alive-material3/pipeline-calendar-action.css",
  import.meta.url,
);
const appPath = new URL(
  "../docs/static-preview/forge-alive-material3/app.js",
  import.meta.url,
);

test("builds a review-first Google Calendar template URL", () => {
  const href = buildGoogleCalendarTemplateUrl({
    title: "Cita con Ana Pérez",
    date: "2026-08-03",
    time: "10:30",
    durationMinutes: 45,
    timezone: "America/Mexico_City",
    location: "Oficina Reforma",
    details: "Preparado desde ForgeOS.",
    attendee: "ana@example.com",
  });
  const url = new URL(href);

  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.pathname, "/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), "Cita con Ana Pérez");
  assert.equal(url.searchParams.get("dates"), "20260803T103000/20260803T111500");
  assert.equal(url.searchParams.get("ctz"), "America/Mexico_City");
  assert.equal(url.searchParams.get("location"), "Oficina Reforma");
  assert.equal(url.searchParams.get("details"), "Preparado desde ForgeOS.");
  assert.deepEqual(url.searchParams.getAll("add"), ["ana@example.com"]);
});

test("rolls the event end into the next day without changing wall-clock timezone semantics", () => {
  const url = new URL(buildGoogleCalendarTemplateUrl({
    title: "Cita nocturna",
    date: "2026-08-03",
    time: "23:30",
    durationMinutes: 60,
  }));

  assert.equal(url.searchParams.get("dates"), "20260803T233000/20260804T003000");
  assert.equal(url.searchParams.get("ctz"), "America/Mexico_City");
});

test("fails closed for invalid scheduling data", () => {
  assert.throws(
    () => buildGoogleCalendarTemplateUrl({
      title: "Cita",
      date: "2026-02-30",
      time: "10:00",
      durationMinutes: 45,
    }),
    error => error?.code === "GOOGLE_CALENDAR_DATE_TIME_INVALID",
  );
  assert.throws(
    () => buildGoogleCalendarTemplateUrl({
      title: "Cita",
      date: "2026-08-03",
      time: "10:00",
      durationMinutes: 17,
    }),
    error => error?.code === "GOOGLE_CALENDAR_DURATION_INVALID",
  );
});

test("publishes an enabled Material 3 handoff without mutating Pipeline truth", async () => {
  const [runtime, css, app] = await Promise.all([
    readFile(runtimePath, "utf8"),
    readFile(cssPath, "utf8"),
    readFile(appPath, "utf8"),
  ]);

  assert.match(app, /pipeline-calendar-action\.js\?v=pipeline-calendar-action-001/);
  assert.match(runtime, /button\.disabled = false/);
  assert.match(runtime, /Agendar en Google Calendar/);
  assert.match(runtime, /data-pipeline-calendar-workspace/);
  assert.match(runtime, /calendar\.google\.com\/calendar\/render/);
  assert.match(runtime, /Google Calendar se abrirá en otra pestaña/);
  assert.match(runtime, /Invitar a/);
  assert.doesNotMatch(runtime, /forge_pipeline_update_prospect_stage/);
  assert.doesNotMatch(runtime, /APPOINTMENT_SCHEDULED/);
  assert.doesNotMatch(runtime, /forge:auth-state-changed/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 560px\)/);
});
