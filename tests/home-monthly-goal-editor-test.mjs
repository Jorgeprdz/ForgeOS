import assert from "node:assert/strict";
import fs from "node:fs";

const editor = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/home-monthly-goal-editor.js",
  "utf8",
);
const homeModule = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/home-module.js",
  "utf8",
);

assert.match(editor, /root\.addEventListener\("click", handleActionCapture, true\)/);
assert.match(editor, /event\.preventDefault\(\)/);
assert.match(editor, /event\.stopImmediatePropagation\(\)/);
assert.match(editor, /document\.body\.appendChild\(dialog\)/);
assert.doesNotMatch(editor, /method=["']dialog["']/);
assert.match(editor, /¿Cuánto quieres ganar este mes\?/);
assert.match(editor, /¿Cuántas pólizas quieres vender\?/);
assert.match(editor, /Guardar metas/);
assert.match(editor, /forge_set_monthly_policy_goal/);
assert.match(editor, /HOME_MONTHLY_GOALS_V2:/);
assert.match(editor, /p_target_policy_count: targetPolicyCount/);
assert.match(editor, /targetMonthlyIncomeMxn/);
assert.match(editor, /productiveHome\?\.refresh\?\.\(\)/);
assert.match(editor, /MONTHLY_POLICY_GOAL_WIDGET/);

assert.match(homeModule, /import \{ createHomeMonthlyGoalEditor \}/);
assert.match(homeModule, /monthlyGoalEditor\.mount\(\)/);
assert.match(homeModule, /monthlyGoalEditor\.close\(\)/);
assert.match(homeModule, /monthlyGoalEditor\.diagnostics/);

console.log("HOME_MONTHLY_GOAL_INPUT_REFRESH=BLOCKED");
console.log("HOME_MONTHLY_ECONOMIC_GOAL=CONNECTED");
console.log("HOME_MONTHLY_POLICY_GOAL=CONNECTED");
