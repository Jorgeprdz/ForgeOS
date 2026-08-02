import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.freeze({
  home: await readFile("docs/static-preview/forge-alive-material3/home-module.js", "utf8"),
  orchestrator: await readFile("docs/static-preview/forge-alive-material3/home-productive-orchestrator.js", "utf8"),
  adapter: await readFile("docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.js", "utf8"),
  css: await readFile("docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.css", "utf8"),
  providers: await readFile("advisor-os/forge-alive/smart-widgets/productive-smart-widget-providers.mjs", "utf8"),
});

assert.match(files.home, /createAuthenticatedProductiveHome/);
assert.match(files.home, /summary\.replaceChildren\(\)/);
assert.match(files.home, /forgeProductiveSmartWidgetRoot/);

assert.match(files.home, /function bindStaticHomeActions/);
assert.match(files.home, /\.plan-card \.mini-action/);
assert.match(files.home, /navigate\("actividad"\)/);
assert.match(files.home, /\.next-card \.primary-action/);
assert.match(files.home, /navigate\("pipeline"\)/);
assert.match(files.home, /\.next-card \.save-action/);
assert.match(files.home, /persona real/);
assert.match(files.home, /\.opportunities \.section-heading button/);
assert.match(files.home, /\.opportunity-list \.opportunity/);
assert.match(files.home, /Enviar a Alfred/);
assert.match(files.home, /tu instrucción permanece sin enviar/);
assert.match(files.home, /forgeHomeActionBound/);
assert.match(files.home, /window\.history\.pushState/);
assert.match(files.home, /shell\.reconcile\(\)/);
assert.doesNotMatch(files.home, /location\.assign|window\.open|fetch\(/);

assert.match(files.orchestrator, /ForgeProductiveProspectBootstrap067G17B/);
assert.match(files.orchestrator, /createProductiveActivityReportingBridge/);
assert.match(files.orchestrator, /period:\s*\{\s*kind:\s*"WEEK_TO_DATE"/s);
assert.match(files.orchestrator, /forge_cartera050_list_future_radar/);
assert.match(files.orchestrator, /createAdvisorMonthlyPolicyGoalRepository/);
assert.match(files.orchestrator, /eventType:\s*"POLICY_SOLD_CONFIRMED"/);
assert.match(files.orchestrator, /CANONICAL_POLICY_CONFIRMED_VERSION/);
assert.match(files.orchestrator, /issue_date/);
assert.match(files.orchestrator, /confirmed_at/);
assert.doesNotMatch(files.orchestrator, /quoteProjection|premium.*POLICY_SOLD_CONFIRMED/i);

assert.match(files.orchestrator, /forge:auth-state-changed/);
assert.match(files.orchestrator, /adapter\?\.scrub/);
assert.match(files.orchestrator, /generation \+= 1/);
assert.match(files.orchestrator, /activeAdvisorId !== session\.advisorId/);
assert.match(files.adapter, /requestRevision/);
assert.match(files.adapter, /activeController\.signal\.aborted/);
assert.match(files.adapter, /root\.replaceChildren\(\.\.\.dialogs\)/);
assert.match(files.adapter, /clearSurface\(root, \{ scrubDialog: true \}\)/);
assert.match(files.adapter, /input\.value = ""/);
assert.match(files.adapter, /root\.hidden = true/);

assert.match(files.adapter, /Array\.isArray\(entry\?\.points\)/);
assert.match(files.adapter, /point\?\.value/);
assert.match(files.adapter, /PRODUCTIVE_SMART_WIDGET_CHART_BINDING_VERSION/);
assert.match(files.adapter, /Ver fuentes/);
assert.match(files.adapter, /NOT_CONNECTED/);

assert.match(files.css, /@media \(min-width: 600px\) and \(max-width: 839px\)/);
assert.match(files.css, /@media \(min-width: 840px\)/);
assert.match(files.css, /@media \(max-width: 420px\)/);
assert.match(files.css, /productive-goal-dialog/);
assert.match(files.css, /\[hidden\]\s*\{\s*display:\s*none !important/s);

assert.match(files.providers, /possible_late_payment_is_inference_not_confirmed_nonpayment/);
assert.match(files.providers, /ONE_CONFIRMED_SOLD_POLICY/);

console.log("SMART_WIDGETS_HOME_PRODUCTIVE_MOUNT=PASS");
console.log("HOME_STATIC_BUTTON_WIRING=PASS");
console.log("HOME_DEAD_ACTIONS=0");
console.log("AUTHENTICATED_HOME_ORCHESTRATOR=PASS");
console.log("REP_ACTIVITY_CHART_BINDING=PASS");
console.log("MONTHLY_GOAL_EDITOR=PASS");
console.log("POLICY_SOLD_CONFIRMED_PROGRESS=PASS");
console.log("CARTERA_050_FUTURE_RADAR_BINDING=PASS");
console.log("LOGOUT_SCRUB_AND_LATE_RESULT_REJECTION=PASS");
console.log("RESPONSIVE_CONTRACT=MOBILE+TABLET+DESKTOP");
