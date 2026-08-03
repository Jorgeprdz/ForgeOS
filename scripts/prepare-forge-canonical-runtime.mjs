import { cp, writeFile } from "node:fs/promises";

const productive = new URL("../docs/static-preview/forge-alive/", import.meta.url);
const staging = new URL("../docs/static-preview/forge-alive-material3/", import.meta.url);
const productiveIndexAuthority =
  "https://raw.githubusercontent.com/Jorgeprdz/ForgeOS/5e7974152aee9bbe7256a6396ece42cabe934df9/docs/static-preview/forge-alive/index.html";

// Overlay the productive shell and its navigation/auth assets without deleting
// modern Material 3 modules, recovery assets, or Beta 1 intake/AI files.
await cp(productive, staging, { recursive: true, force: true });

const response = await fetch(productiveIndexAuthority, {
  headers: { "user-agent": "ForgeOS-Pages-Builder" },
});
if (!response.ok) {
  throw new Error(`PRODUCTIVE_INDEX_FETCH_FAILED_${response.status}`);
}

let index = await response.text();
if (!index.includes("forge-alive-auth-entry-067g17b1.js")) {
  throw new Error("PRODUCTIVE_AUTH_ENTRY_MISSING");
}
if (!index.includes("data-forge-static-view=\"pipeline\"")) {
  throw new Error("PRODUCTIVE_NAV_AUTHORITY_MISSING");
}

index = index.replace(
  "</head>",
  '  <link rel="stylesheet" href="./pipeline-bulk-import-mount.css">\n</head>',
);
index = index.replace(
  "</body>",
  '  <script type="module" src="./pipeline-stage-filter-authority.js"></script>\n</body>',
);
index = index.replace(
  "<title>Forge Alive Vista Estática</title>",
  "<title>ForgeOS</title>",
);
index = index.replace(
  '<main class="phone-shell" aria-label="Forge Alive vista estática">',
  '<main class="phone-shell" aria-label="ForgeOS">',
);
index = index.replaceAll("Vista estática segura", "");
index = index.replaceAll("Solo lectura", "");
index = index.replaceAll("Miércoles, 26 de julio", "");
index = index.replace(
  "<head>",
  '<head>\n  <meta name="forge-build-authority" content="PRODUCTIVE_CANONICAL_RUNTIME">',
);

await writeFile(new URL("index.html", staging), index);
console.log("FORGE_CANONICAL_RUNTIME_AUTHORITY=PRODUCTIVE");
console.log("FORGE_MATERIAL3_STATIC_SHELL_REPLACED=YES");
