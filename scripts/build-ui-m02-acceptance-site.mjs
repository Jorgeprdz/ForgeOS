import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = path.join(root, "_ui_m02_site");

const publicExtensions = new Set([
  ".css",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".map",
  ".png",
  ".svg",
  ".txt",
  ".webmanifest",
  ".webp",
]);

const publicRootFiles = new Set([
  ".nojekyll",
  "_redirects",
  "manifest.json",
]);

const isPublicFile = (file) => {
  if (file.startsWith(".github/")) {
    return false;
  }

  if (file.startsWith("docs/evidence/")) {
    return false;
  }

  if (file.startsWith("advisor-os/sales-pipeline/")) {
    return publicExtensions.has(
      path.extname(file).toLowerCase(),
    );
  }

  if (!file.startsWith("docs/")) {
    return publicRootFiles.has(file);
  }

  if (file.includes("/tests/")) {
    return false;
  }

  if (
    /(^|\/)([^/]*-)?(master-)?test(s)?\.(js|json)$/i
      .test(file)
  ) {
    return false;
  }

  if (/\.(pdf|xlsx|zip)$/i.test(file)) {
    return false;
  }

  if (publicRootFiles.has(file)) {
    return true;
  }

  return publicExtensions.has(
    path.extname(file).toLowerCase(),
  );
};

const gitOutput = (...args) =>
  execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${root}`,
      ...args,
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

const trackedFiles = gitOutput(
  "ls-files",
  "-z",
)
  .split("\0")
  .filter(Boolean);

fs.rmSync(
  site,
  {
    recursive: true,
    force: true,
  },
);

fs.mkdirSync(
  site,
  {
    recursive: true,
  },
);

let copied = 0;

for (const file of trackedFiles.filter(isPublicFile)) {
  const publicPath = file.startsWith("docs/")
    ? file.slice("docs/".length)
    : file;

  const source = path.join(root, file);
  const target = path.join(site, publicPath);

  fs.mkdirSync(
    path.dirname(target),
    {
      recursive: true,
    },
  );

  fs.copyFileSync(source, target);
  copied += 1;
}

const buildSha =
  process.env.GITHUB_SHA
  || gitOutput(
    "rev-parse",
    "HEAD",
  ).trim();

for (
  const htmlFile of trackedFiles.filter(
    (file) =>
      file.startsWith("docs/")
      && file.endsWith(".html"),
  )
) {
  const target = path.join(
    site,
    htmlFile.slice("docs/".length),
  );

  if (!fs.existsSync(target)) {
    continue;
  }

  const html = fs
    .readFileSync(target, "utf8")
    .replaceAll("__FORGE_BUILD_SHA__", buildSha);

  fs.writeFileSync(target, html);
}

fs.writeFileSync(
  path.join(site, "env.js"),
  `window.__ENV__ = Object.freeze(${JSON.stringify({
    SUPABASE_URL: "",
    SUPABASE_KEY: "",
    DEMO_MODE: "false",
    ENABLE_TEST_ADVISOR_LOGIN: "false",
  }, null, 2)});\n`,
);

const required = [
  "static-preview/forge-alive/index.html",
  (
    "static-preview/forge-alive/"
    + "ui-material3-runtime/"
    + "forge-material3-responsive-shell.css"
  ),
  (
    "static-preview/forge-alive/"
    + "ui-material3-runtime/"
    + "forge-material3-responsive-shell.js"
  ),
  (
    "advisor-os/sales-pipeline/"
    + "sales-stage-registry.js"
  ),
  (
    "advisor-os/sales-pipeline/"
    + "pipeline-stage-read-model.js"
  ),
  (
    "advisor-os/sales-pipeline/"
    + "pipeline-ui.js"
  ),
  (
    "static-preview/quote-preview-live/"
    + "forge-quote-intake-ui-simplification-r16j1c1.css"
  ),
  "env.js",
];

for (const relative of required) {
  const target = path.join(site, relative);

  if (!fs.existsSync(target)) {
    throw new Error(
      `UI_M02_SITE_FILE_MISSING:${relative}`,
    );
  }
}

console.log("UI_M02_ACCEPTANCE_SITE=PASS");
console.log(`PUBLIC_FILES=${copied + 1}`);
console.log(`BUILD_SHA=${buildSha}`);
console.log(`SITE=${site}`);
