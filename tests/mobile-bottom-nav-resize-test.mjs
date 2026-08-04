import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("compact mobile navigation is mounted from the canonical graph", async () => {
  const [legacy, runtime] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
    read("docs/static-preview/forge-alive-material3/mobile-bottom-nav-resize.js"),
  ]);

  assert.match(
    legacy,
    /import "\.\/mobile-bottom-nav-resize\.js\?v=mobile-bottom-nav-resize-001"/,
  );
  assert.match(
    runtime,
    /mobile-bottom-nav-resize\.css\?v=mobile-bottom-nav-resize-001/,
  );
  assert.match(runtime, /FORGE_MOBILE_BOTTOM_NAV_RESIZE_V1/);
});

test("mobile pill and Alfred are reduced without merging them", async () => {
  const css = await read(
    "docs/static-preview/forge-alive-material3/mobile-bottom-nav-resize.css",
  );
  const mobile = css.match(
    /@media \(max-width: 759px\) \{([\s\S]*?)\n\}\n\n@media \(max-width: 380px\)/,
  )?.[1] || "";

  assert.ok(mobile, "mobile override is required");
  assert.match(mobile, /--forge-mobile-nav-height:\s*60px/);
  assert.match(mobile, /--forge-mobile-nav-clearance:\s*28px/);
  assert.match(
    mobile,
    /\.bottom-shell[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 64px !important/,
  );
  assert.match(
    mobile,
    /\.nav-pill[\s\S]*max-height:\s*58px !important/,
  );
  assert.match(
    mobile,
    /\.nav-item[\s\S]*min-height:\s*50px !important/,
  );
  assert.match(
    mobile,
    /\.alfred-launcher[\s\S]*width:\s*64px !important[\s\S]*height:\s*64px !important/,
  );
  assert.doesNotMatch(mobile, /\.nav-pill[^}]*\.alfred-launcher/);
});

test("resize is mobile-only and preserves usable touch targets", async () => {
  const css = await read(
    "docs/static-preview/forge-alive-material3/mobile-bottom-nav-resize.css",
  );

  assert.match(css, /@media \(max-width: 759px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(css, /min-height:\s*50px !important/);
  assert.match(css, /min-width:\s*40px !important/);
  assert.doesNotMatch(css, /@media \(min-width:/);
  assert.doesNotMatch(css, /display:\s*none|visibility:\s*hidden|pointer-events:\s*none/);
});
