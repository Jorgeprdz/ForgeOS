import test from "node:test";
import assert from "node:assert/strict";
import { createCrs10ExistingRelationshipIntelligenceService } from "../advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js";

function client({ advisorId = "advisor-1", personAdvisorId = "advisor-1", lifecycleState = "CONFIRMED" } = {}) {
  const builder = {
    select() { return this; },
    eq() { return this; },
    single: async () => ({
      data: {
        id: "person-row-1",
        advisor_id: personAdvisorId,
        person_reference: "person-1",
        lifecycle_state: lifecycleState,
        archived_at: null,
      },
      error: null,
    }),
  };
  return {
    auth: { getUser: async () => ({ data: { user: { id: advisorId } }, error: null }) },
    from: () => builder,
    rpc: async () => ({ data: {}, error: null }),
  };
}

function services(overrides = {}) {
  return {
    futureRadarService: {
      loadFutureRadar: async () => ({
        items: [{
          signalReference: "signal-1",
          personReference: "person-1",
          signalType: "ANNUAL_REVIEW",
          whyThisPerson: "Existe una revisión confirmada.",
          whyNow: "La fecha está próxima.",
          eventDate: "2026-08-10",
          advisorConfirmationRequired: true,
          uncertainty: "No implica prioridad final.",
          smallestUsefulAction: "Revisar contexto.",
          evidenceSummary: ["policy-1"],
        }],
      }),
    },
    growthService: {
      loadGrowthReviews: async () => ({
        items: [{
          candidateReference: "growth-1",
          growthClass: "PROTECTION_REVIEW",
          personReference: "person-1",
          whyThisPerson: "Existe una brecha revisable.",
          whyNow: "El contexto está vigente.",
          uncertainty: "No prueba intención de compra.",
          smallestUsefulAction: "Preparar revisión.",
          evidence: [{ reference: "e-1" }],
        }],
      }),
    },
    activationService: {
      loadActivationDeck: async () => ({
        items: [{
          actionReference: "action-1",
          actionClass: "SCHEDULE_REVIEW",
          actionLabel: "Preparar revisión",
          personReference: "person-1",
          whyThisPerson: "Hay un compromiso vigente.",
          whyNow: "La fecha se aproxima.",
          eventDate: "2026-08-09",
          uncertainty: "Requiere confirmación.",
          smallestUsefulAction: "Confirmar disponibilidad.",
          evidence: [{ reference: "e-2" }],
        }],
      }),
    },
    relationshipMemoryService: { loadRelationshipBrief: async () => ({}) },
    relationshipCapitalService: {
      loadRelationshipCapital: async () => ({
        items: [{
          capitalReference: "capital-1",
          capitalClass: "RELATIONSHIP_CONTINUITY",
          personReference: "person-1",
          whyThisRelationship: "Existe contexto confirmado.",
          whyNow: "Conviene validar vigencia.",
          uncertainty: "No prueba influencia.",
          smallestUsefulAction: "Revisar el rol.",
          evidence: [{ reference: "e-3" }],
        }],
      }),
    },
    productivityProofService: {
      loadProductivityProof: async () => ({
        statement: { state: "EVIDENCE_AVAILABLE", text: "2 acciones mínimas útiles completadas." },
        metrics: {
          actions: { evidenceReferences: ["obs-1", "obs-2"] },
        },
      }),
    },
    economicConnectionReader: async () => [{
      evidenceId: "economic-1",
      status: "review_required",
      evidence: {
        evidenceId: "economic-1",
        claimedPersonReference: "person-1",
        receivedAt: "2026-08-01T10:00:00.000Z",
        attachmentReferences: ["attachment-1"],
        uncertainty: "Falta confirmar coincidencia.",
      },
    }],
    ...overrides,
  };
}

test("composes person intelligence from existing 050-100 services", async () => {
  const service = createCrs10ExistingRelationshipIntelligenceService({
    client: client(),
    ...services(),
  });
  const composition = await service.loadRelationshipIntelligence({
    personReference: "person-1",
    asOfDate: "2026-08-01",
  });
  assert.equal(composition.itemCount, 6);
  assert.equal(composition.reviewCount, 5);
  assert.equal(composition.domains.FUTURE_RADAR.items[0].personReference, "person-1");
  assert.equal(composition.domains.PRODUCTIVITY_PROOF.scope, "ADVISOR");
  assert.equal(composition.domains.PRODUCTIVITY_PROOF.items[0].personReference, null);
  assert.match(composition.domains.PRODUCTIVITY_PROOF.items[0].summary, /No atribuida a person-1/);
  assert.equal(composition.boundaries.secondScoreEngine, false);
});

test("filters portfolio-wide signals so another person never enters the workspace", async () => {
  const configured = services();
  configured.futureRadarService.loadFutureRadar = async () => ({
    items: [
      {
        signalReference: "other-signal",
        personReference: "person-2",
        signalType: "ANNUAL_REVIEW",
        whyThisPerson: "Otra persona.",
        whyNow: "Ahora.",
        eventDate: "2026-08-10",
        advisorConfirmationRequired: true,
        uncertainty: "N/A",
        smallestUsefulAction: "N/A",
        evidenceSummary: ["e"],
      },
    ],
  });
  const service = createCrs10ExistingRelationshipIntelligenceService({ client: client(), ...configured });
  const composition = await service.loadRelationshipIntelligence({ personReference: "person-1", asOfDate: "2026-08-01" });
  assert.equal(composition.domains.FUTURE_RADAR.status, "EMPTY");
  assert.equal(composition.domains.FUTURE_RADAR.count, 0);
});

test("degrades one failed source without hiding the remaining authorities", async () => {
  const configured = services({
    activationService: { loadActivationDeck: async () => { throw Object.assign(new Error("offline"), { code: "CARTERA070_OFFLINE" }); } },
  });
  const service = createCrs10ExistingRelationshipIntelligenceService({ client: client(), ...configured });
  const composition = await service.loadRelationshipIntelligence({ personReference: "person-1", asOfDate: "2026-08-01" });
  assert.equal(composition.domains.RELATIONAL_ACTIVATION.status, "DEGRADED");
  assert.equal(composition.domains.RELATIONSHIP_GROWTH.status, "AVAILABLE");
  assert.equal(composition.domains.PRODUCTIVITY_PROOF.status, "AVAILABLE");
});

test("economic connection is explicitly unavailable when its projection reader is absent", async () => {
  const configured = services();
  delete configured.economicConnectionReader;
  const service = createCrs10ExistingRelationshipIntelligenceService({ client: client(), ...configured });
  const composition = await service.loadRelationshipIntelligence({ personReference: "person-1", asOfDate: "2026-08-01" });
  assert.equal(composition.domains.ECONOMIC_CONNECTION.status, "UNAVAILABLE");
  assert.equal(composition.domains.ECONOMIC_CONNECTION.reason, "SOURCE_READER_NOT_CONNECTED");
});

test("fails closed for cross-advisor or inactive CommercialPerson", async () => {
  const crossAdvisor = createCrs10ExistingRelationshipIntelligenceService({
    client: client({ personAdvisorId: "advisor-2" }),
    ...services(),
  });
  await assert.rejects(
    () => crossAdvisor.loadRelationshipIntelligence({ personReference: "person-1" }),
    error => error.code === "CRS10_PERSON_NOT_OWNED",
  );

  const inactive = createCrs10ExistingRelationshipIntelligenceService({
    client: client({ lifecycleState: "ARCHIVED" }),
    ...services(),
  });
  await assert.rejects(
    () => inactive.loadRelationshipIntelligence({ personReference: "person-1" }),
    error => error.code === "CRS10_PERSON_NOT_ACTIVE",
  );
});

test("diagnostics expose no mutation or duplicate intelligence authority", () => {
  const service = createCrs10ExistingRelationshipIntelligenceService({ client: client(), ...services() });
  const diagnostics = service.diagnostics();
  assert.deepEqual(diagnostics.existingCarteraServicesReused, ["040", "050", "060", "070", "080", "090", "100"]);
  assert.equal(diagnostics.secondScoreEngine, false);
  assert.equal(diagnostics.secondRelationshipMemoryAuthority, false);
  assert.equal(diagnostics.secondActivationStack, false);
  assert.equal(diagnostics.automaticBusinessMutation, false);
  assert.equal("record" in service, false);
});
