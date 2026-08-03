import { writeFile } from "node:fs/promises";

const port = process.env.FORGE_CDP_PORT || "9223";
const base = "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("CDP_PAGE_TARGET_REQUIRED");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "RUNTIME_EVALUATION_FAILED");
  return result.result.value;
}

async function navigate(route) {
  const url = new URL(base);
  url.searchParams.set("nav", route);
  url.searchParams.set("acceptance", `beta1-011-${Date.now()}`);
  await command("Page.navigate", { url: url.href });
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

await command("Page.enable");
await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});

await navigate("pipeline");
const bulkImport = await evaluate(`(async () => {
  const button = document.querySelector("[data-pipeline-bulk-import]");
  const before = {
    authBoundary: document.documentElement.dataset.forgeAuthBoundary || null,
    buttonVisible: Boolean(button && button.getClientRects().length),
    layerPresent: Boolean(document.querySelector("[data-pipeline-bulk-import-layer]")),
    fileInputPresent: Boolean(document.querySelector("[data-bulk-import-file]")),
  };
  button?.click();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const backdrop = document.querySelector(".forge-auth-backdrop-067g17b1");
  return {
    before,
    after: {
      authGate: document.documentElement.dataset.pipelineBulkImportAuthGate || null,
      layerPresent: Boolean(document.querySelector("[data-pipeline-bulk-import-layer]")),
      fileInputPresent: Boolean(document.querySelector("[data-bulk-import-file]")),
      authPanelVisible: Boolean(backdrop && !backdrop.hidden && backdrop.getClientRects().length),
    },
  };
})()`);

await navigate("actividad");
const activity = await evaluate(`(async () => {
  const root = document.querySelector("[data-forge-activity-module]");
  const before = root?.getBoundingClientRect();
  document.querySelector('[data-activity-view-tab="reportes"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const reports = document.querySelector("[data-activity-reports-root]");
  const after = root?.getBoundingClientRect();
  return {
    viewportWidth: innerWidth,
    activityRootWidth: before?.width || 0,
    reportsRootWidth: reports?.getBoundingClientRect().width || 0,
    routeRootWidthAfterTab: after?.width || 0,
    reportsSelected: document.querySelector('[data-activity-view-tab="reportes"]')?.getAttribute("aria-selected") === "true",
  };
})()`);

await navigate("comisiones");
const compensation = await evaluate(`(async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const root = document.querySelector("[data-forge-compensation-module]");
  const shell = root?.querySelector(".comp-shell");
  const heading = shell?.querySelector("h1");
  return {
    viewportWidth: innerWidth,
    routeRootWidth: root?.getBoundingClientRect().width || 0,
    shellWidth: shell?.getBoundingClientRect().width || 0,
    headingColor: heading ? getComputedStyle(heading).color : null,
    recoveryState: document.documentElement.dataset.advisorCompensationAuthRecovery || null,
    recoveryAttempt: document.documentElement.dataset.advisorCompensationAuthRecoveryAttempt || null,
    compensationState: root?.dataset.compensationState || null,
  };
})()`);

const acceptance = {
  capturedAt: new Date().toISOString(),
  bulkImport,
  activity,
  compensation,
  assertions: {
    anonymousBulkImportFailsClosed:
      bulkImport.after.authGate === "required"
      && bulkImport.after.layerPresent === false
      && bulkImport.after.fileInputPresent === false,
    activityAndReportsFullWidth:
      activity.activityRootWidth >= 1000
      && activity.routeRootWidthAfterTab >= 1000
      && activity.reportsSelected,
    compensationFullWidthAndReadable:
      compensation.routeRootWidth >= 1000
      && compensation.shellWidth >= 1000
      && compensation.headingColor !== "rgb(23, 32, 42)",
    anonymousCompensationDoesNotPoll:
      compensation.recoveryAttempt === null,
  },
};

await writeFile(
  "ForgeGemini/BETA1_011/runtime-acceptance.json",
  `${JSON.stringify(acceptance, null, 2)}\n`,
);
console.log(JSON.stringify(acceptance, null, 2));
if (Object.values(acceptance.assertions).some((value) => value !== true)) process.exitCode = 1;
socket.close();
