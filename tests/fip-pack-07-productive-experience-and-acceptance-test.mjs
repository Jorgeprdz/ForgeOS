import assert from "node:assert/strict";
import { createAlfredProductiveExperience } from "../platform/alfred/fip-pack-07-productive-experience-contract.js";
import { composeAlfredProductiveExperience } from "../advisor-os/alfred/fip-pack-07-productive-experience-service.js";

const experience = composeAlfredProductiveExperience({
  advisorReference: "advisor:jorge",
  generatedAt: "2026-08-02T15:30:00.000Z",
  packs: {
    relationship: { generatedAt: "2026-08-02T15:20:00.000Z", facts: [{ title: "Compromiso vencido", summary: "Seguimiento pendiente", evidence: ["commitment:1"] }] },
    advisor: { generatedAt: "2026-08-02T15:20:00.000Z", patterns: [{ title: "Mercado candidato", summary: "Referidos convierten mejor", confidence: "MEDIUM", evidence: ["sample:18"] }] },
    mick: { generatedAt: "2026-08-02T15:20:00.000Z", adjustments: [{ title: "Ventana de seguimiento", summary: "Revisar seguimientos de 3 a 6 días", evidence: ["activity-window"] }] },
    nash: { generatedAt: "2026-08-02T15:20:00.000Z", recommendations: [{ title: "Aclarar decisión", summary: "No enviar otra cotización todavía", confidence: "HIGH", evidence: ["objection:decision"] }] },
    operation: { generatedAt: "2026-08-02T15:20:00.000Z", priorities: [{ title: "Llamar a Ana", summary: "Compromiso vencido y riesgo de enfriamiento", actionId: "call:ana", evidence: ["priority:ana"] }] },
    business: { generatedAt: "2026-08-02T15:20:00.000Z", estimates: [{ title: "Proyección mensual", summary: "Estimación, no garantía", confidence: "MEDIUM", evidence: ["forecast:month"] }] },
  },
});

assert.equal(experience.contractVersion, "FIP-330-350-001");
assert.equal(experience.orchestration.alfredRole, "ORCHESTRATOR");
assert.equal(experience.boundaries.automaticMessage, false);
assert.equal(experience.boundaries.automaticPipelineAdvance, false);
assert.equal(experience.boundaries.humanApprovalRequired, true);
assert.equal(experience.boundaries.logoutScrubRequired, true);
assert.equal(experience.boundaries.lateResultRejectionRequired, true);
assert.equal(experience.boundaries.mobileSafeZoneRequired, true);
assert.ok(experience.insights.some(item => item.kind === "FACT"));
assert.ok(experience.insights.some(item => item.kind === "ESTIMATE"));
assert.ok(experience.insights.some(item => item.kind === "HYPOTHESIS"));
assert.ok(experience.insights.some(item => item.kind === "RECOMMENDATION"));
assert.ok(experience.insights.some(item => item.kind === "ACTION_REQUIRING_APPROVAL" && item.humanApprovalRequired));
assert.ok(experience.widgets.some(widget => widget.surface === "HOME"));
assert.ok(experience.widgets.some(widget => widget.surface === "PERSON"));
assert.ok(experience.widgets.some(widget => widget.surface === "ACTIVITY"));
assert.ok(experience.widgets.some(widget => widget.surface === "REPORTS"));
assert.ok(experience.widgets.some(widget => widget.surface === "ALFRED"));
assert.deepEqual(Object.keys(experience.responsiveAcceptance), ["MOBILE", "TABLET", "DESKTOP"]);

assert.throws(() => createAlfredProductiveExperience({
  advisorReference: "advisor:jorge",
  insights: [],
  widgets: [{ id: "bad", surface: "HOME", title: "Bad", insightIds: ["missing"] }],
}), /insight inexistente/);

console.log("FIP_PACK_07_PRODUCTIVE_EXPERIENCE_AND_ACCEPTANCE=PASS");
