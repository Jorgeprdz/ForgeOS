import assert from "node:assert/strict";
import fs from "node:fs";
import { renderAdvisorSalesNbaCard } from "../advisor-os/dashboard/advisor-sales-nba-consumer.js";

const recommendation = {
    recommendationId: "R1",
    recommendedAction: "Llamar",
    subjectId: "<P1>",
    whyNow: "Compromiso vigente",
    supportingSignals: [{ label: "Fecha comprometida" }],
    targetOutcome: "Acordar siguiente paso",
    uncertainty: ["Sin respuesta reciente"],
    suggestedChannel: "CALL",
    suggestedArgument: "Confirmar intención",
};

const html = renderAdvisorSalesNbaCard(recommendation);
assert.ok(html.includes("Haz esto hoy"));
assert.ok(html.includes("&lt;P1&gt;"));
assert.ok(html.includes("¿Por qué ahora?"));
assert.ok(html.includes("Objetivo"));
assert.ok(html.includes("Incertidumbre"));
assert.ok(html.includes('data-nba-response="MODIFIED"'));
assert.ok(html.includes('data-forge-route="advisor-sales-pipeline"'));
assert.ok(html.includes('data-forge-context-type="prospect"'));
assert.ok(html.includes("no contactará automáticamente"));

const limited = renderAdvisorSalesNbaCard(null);
assert.ok(limited.includes("evidencia suficiente"));

const dashboard = fs.readFileSync("dashboard.js", "utf8");
assert.ok(dashboard.indexOf("dash-sales-nba") < dashboard.indexOf("Hero Greeting Widget"));
assert.ok(dashboard.includes("renderAdvisorSalesNbaCard"));
console.log("067G15 ADVISOR DASHBOARD NBA CONSUMER: PASS");
