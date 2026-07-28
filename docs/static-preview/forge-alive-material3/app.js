import { createForgeShell } from "./forge-shell.js";
import { createHomeModule } from "./home-module.js";

const application = document.querySelector("[data-forge-application]");
const moduleViewport = document.querySelector(
  "[data-forge-module-viewport]",
);
const homeRoot = document.querySelector("[data-forge-home-module]");

if (!application || !moduleViewport || !homeRoot) {
  throw new Error("UI-M04 canonical shell boundary is incomplete");
}

const shell = createForgeShell({
  root: application,
  moduleViewport,
});
const home = createHomeModule({
  root: homeRoot,
  shell,
});

shell.mountModule(home);
shell.initialize();

document.documentElement.dataset.forgeCleanHomeReady = "true";
document.documentElement.dataset.forgeShellReady = "true";
