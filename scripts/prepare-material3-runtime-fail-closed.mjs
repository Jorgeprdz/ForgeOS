import { readFile, writeFile } from "node:fs/promises";

const pagesRuntime =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_PAGES === "true"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

if (!pagesRuntime) {
  console.log("MATERIAL3_RUNTIME_HYDRATION_GATE=SKIPPED_NOT_PAGES");
} else {
  const indexPath = new URL(
    "../docs/static-preview/forge-alive-material3/index.html",
    import.meta.url,
  );
  let index = await readFile(indexPath, "utf8");

  const style = `
  <style data-forge-runtime-hydration-gate="FORGE_RUNTIME_HYDRATION_FAIL_CLOSED_V1">
    html:not([data-forge-shell-ready="true"]) [data-forge-module-viewport] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    [data-forge-runtime-status] {
      display: none;
      box-sizing: border-box;
      width: min(34rem, calc(100% - 2rem));
      margin: 18vh auto 0;
      padding: 1.25rem 1.4rem;
      border: 1px solid rgba(155, 232, 255, .24);
      border-radius: 1rem;
      background: #101b2d;
      color: #f7fbff;
      font: 500 1rem/1.5 system-ui, sans-serif;
      text-align: center;
    }
    [data-forge-runtime-status] strong,
    [data-forge-runtime-status] span { display: block; }
    [data-forge-runtime-status] span { margin-top: .35rem; opacity: .78; }
    html[data-forge-auth-boundary="authenticated"]:not([data-forge-shell-ready="true"])
      [data-forge-runtime-status] { display: block; }
  </style>`;

  const status = `
  <section data-forge-runtime-status role="status" aria-live="polite">
    <strong data-forge-runtime-status-title>Iniciando ForgeOS…</strong>
    <span data-forge-runtime-status-detail>Estamos preparando tu espacio de trabajo.</span>
  </section>`;

  const watchdog = `
  <script data-forge-runtime-watchdog="FORGE_RUNTIME_WATCHDOG_V1">
    (() => {
      const root = document.documentElement;
      let timer = null;
      const ready = () => root.dataset.forgeShellReady === "true";
      const renderFailure = () => {
        if (ready() || root.dataset.forgeAuthBoundary !== "authenticated") return;
        root.dataset.forgeRuntimeFailed = "true";
        const title = document.querySelector("[data-forge-runtime-status-title]");
        const detail = document.querySelector("[data-forge-runtime-status-detail]");
        if (title) title.textContent = "No se pudo iniciar ForgeOS";
        if (detail) detail.textContent = "Recarga la página. La interfaz anterior permanecerá bloqueada.";
      };
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(renderFailure, 12000);
      };
      window.addEventListener("error", renderFailure, true);
      window.addEventListener("unhandledrejection", renderFailure);
      new MutationObserver(() => {
        if (ready()) {
          clearTimeout(timer);
          delete root.dataset.forgeRuntimeFailed;
        } else if (root.dataset.forgeAuthBoundary === "authenticated") {
          arm();
        }
      }).observe(root, { attributes: true });
      arm();
    })();
  </script>`;

  if (!index.includes("data-forge-runtime-hydration-gate")) {
    index = index.replace("</head>", `${style}\n${watchdog}\n</head>`);
  }
  if (!index.includes("data-forge-runtime-status")) {
    index = index.replace(
      '<body data-forge-application>',
      `<body data-forge-application>${status}`,
    );
  }

  for (const required of [
    'data-forge-runtime-hydration-gate="FORGE_RUNTIME_HYDRATION_FAIL_CLOSED_V1"',
    'data-forge-runtime-watchdog="FORGE_RUNTIME_WATCHDOG_V1"',
    "data-forge-runtime-status",
    'data-forge-shell-ready="true"',
  ]) {
    if (!index.includes(required)) {
      throw new Error(`MATERIAL3_RUNTIME_GATE_REQUIRED=${required}`);
    }
  }

  await writeFile(indexPath, index);
  console.log("MATERIAL3_RUNTIME_HYDRATION_GATE=PASS");
  console.log("MATERIAL3_OLD_SKELETON_FAIL_CLOSED=PASS");
}
