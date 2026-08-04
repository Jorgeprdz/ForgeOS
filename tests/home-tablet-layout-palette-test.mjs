import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("tablet repair is mounted from the canonical runtime graph", async () => {
  const [legacy, runtime] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
    read("docs/static-preview/forge-alive-material3/home-tablet-layout-palette.js"),
  ]);

  assert.match(legacy, /import "\.\/home-tablet-layout-palette\.js\?v=home-tablet-layout-palette-001"/);
  assert.match(runtime, /home-tablet-layout-palette\.css\?v=home-tablet-layout-palette-001/);
  assert.match(runtime, /data\.homeTabletLayoutPalette = CONTRACT_ID/);
});

test("converted opportunity surface cannot retain the static hidden state", async () => {
  const runtime = await read("docs/static-preview/forge-alive-material3/home-tablet-layout-palette.js");

  assert.match(runtime, /\.opportunities\[data-home-live-opportunities\]/);
  assert.match(runtime, /opportunities\.hidden = false/);
  assert.match(runtime, /removeAttribute\("hidden"\)/);
  assert.match(runtime, /removeAttribute\("aria-hidden"\)/);
  assert.doesNotMatch(runtime, /location\.(?:assign|replace)|supabase|\.from\(|fetch\(/);
});

test("tablet and compact desktop use readable two-column cards", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/home-tablet-layout-palette.css");
  const tablet = css.match(/@media \(min-width: 760px\) and \(max-width: 1539px\) \{([\s\S]*?)\n\}/)?.[1] || "";

  assert.ok(tablet, "tablet breakpoint is required");
  assert.match(tablet, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(tablet, /\.is-primary[\s\S]*grid-column:\s*1 \/ -1 !important/);
  assert.match(tablet, /home-recovery-access[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tablet, /data-home-grid-span="4x2"[\s\S]*grid-column:\s*span 2 !important/);
});

test("Home surfaces share one blue surface authority and bounded typography", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/home-tablet-layout-palette.css");

  assert.match(css, /productive-smart-widget,[\s\S]*home-recovery-access button,[\s\S]*opportunities\[data-home-live-opportunities\][\s\S]*background:\s*var\(--home-card-surface\) !important/);
  assert.match(css, /--home-card-surface:[\s\S]*rgb\(19 35 59 \/ 98%\)[\s\S]*rgb\(8 21 39 \/ 99%\)/);
  assert.match(css, /productive-smart-widget-metric[\s\S]*font-size:\s*clamp\(2rem, 2\.4vw, 2\.75rem\) !important/);
  assert.doesNotMatch(css, /brown|saddlebrown|peru|chocolate/i);
});

test("summary does not reserve empty desktop columns", async () => {
  const css = await read("docs/static-preview/forge-alive-material3/home-tablet-layout-palette.css");

  assert.match(css, /:not\(:has\(> \.opportunities\[data-home-live-opportunities\]:not\(\[hidden\]\)\)\)[\s\S]*grid-column:\s*1 \/ -1 !important/);
  assert.match(css, /@media \(min-width: 1200px\) and \(max-width: 1539px\)/);
  assert.match(css, /opportunities\[data-home-live-opportunities\]:not\(\[hidden\]\)[\s\S]*grid-column:\s*9 \/ -1 !important/);
});
