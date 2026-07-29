import { createForgeShell } from "./forge-shell.js";
import { createHomeModule } from "./home-module.js";
import { createQuotesModule } from "./quotes-module.js?v=ui-m05-006";
import { createPipelineModule } from "./pipeline-module.js?v=ui-m06-pipeline-005";

const application = document.querySelector("[data-forge-application]");
const moduleViewport = document.querySelector(
  "[data-forge-module-viewport]",
);
const homeRoot = document.querySelector("[data-forge-home-module]");
const quotesRoot = document.querySelector("[data-forge-quotes-module]");
const pipelineRoot = document.querySelector("[data-forge-pipeline-module]");

if (!application || !moduleViewport || !homeRoot || !quotesRoot || !pipelineRoot) {
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
const quotes = createQuotesModule({
  root: quotesRoot,
  shell,
});
const pipeline = createPipelineModule({
  root: pipelineRoot,
  shell,
});

shell
  .registerRouteModule("inicio", home)
  .registerRouteModule("pipeline", pipeline)
  .registerRouteModule("quotes", quotes);
shell.initialize();

document.documentElement.dataset.forgeCleanHomeReady = "true";
document.documentElement.dataset.forgeShellReady = "true";
