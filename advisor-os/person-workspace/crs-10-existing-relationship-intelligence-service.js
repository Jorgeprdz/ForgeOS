import {
  createRelationshipIntelligenceComposition,
  DOMAIN_AUTHORITIES,
} from "../../platform/shared-commercial-model/crs-10-relationship-intelligence-contract.js";
import { createCartera040RelationshipMemoryService } from "../cartera/cartera-040a-relationship-memory-service.js";
import { createCartera050FutureRadarService } from "../cartera/cartera-050a-future-radar-service.js";
import { createCartera060RelationshipGrowthService } from "../cartera/cartera-060c-relationship-growth-service.js";
import { createCartera070RelationalActivationService } from "../cartera/cartera-070c-relational-activation-service.js";
import { createCartera090RelationshipCapitalService } from "../cartera/cartera-090c-relationship-capital-service.js";
import { createCartera100ProductivityProofService } from "../cartera/cartera-100c-productivity-proof-service.js";

const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

class Crs10RelationshipIntelligenceServiceError extends Error {
  constructor(code, message, cause = null) {
    super(message);
    this.name = "Crs10RelationshipIntelligenceServiceError";
    this.code = code;
    if (cause) this.cause = cause;
  }
}

const fail = (code, message, cause = null) => {
  throw new Crs10RelationshipIntelligenceServiceError(code, message, cause);
};
const codeOf = error => String(error?.code || error?.message || "SOURCE_READ_FAILED").slice(0, 220);
const list = value => Array.isArray(value) ? value : [];
const today = () => new Date().toISOString().slice(0, 10);
const monthStart = date => `${date.slice(0, 7)}-01`;
const title = value => String(value || "").toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, token => token.toUpperCase());
const deepLink = (personReference, domain) => `?nav=cartera&person=${encodeURIComponent(personReference)}&intelligence=${encodeURIComponent(domain)}`;

function requiredReference(value, code) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!REFERENCE_PATTERN.test(normalized)) fail(code, "La referencia no es válida.");
  return normalized;
}

async function authenticatedUser(client) {
  if (!client?.auth?.getUser || !client?.from) {
    fail("CRS10_AUTHENTICATED_CLIENT_REQUIRED", "Se requiere un cliente Supabase autenticado.");
  }
  const result = await client.auth.getUser();
  if (result?.error) fail("CRS10_AUTH_LOOKUP_FAILED", "No se pudo validar la sesión.", result.error);
  if (!result?.data?.user?.id) fail("CRS10_AUTH_REQUIRED", "La sesión productiva es obligatoria.");
  return result.data.user;
}

async function assertOwnedActivePerson(client, user, personReference) {
  const result = await client.from("commercial_people")
    .select("id,advisor_id,person_reference,lifecycle_state,archived_at")
    .eq("advisor_id", user.id)
    .eq("person_reference", personReference)
    .single();
  if (result?.error || !result?.data) {
    fail("CRS10_PERSON_READ_FAILED", "CommercialPerson no está disponible para este asesor.", result?.error);
  }
  if (result.data.advisor_id !== user.id) fail("CRS10_PERSON_NOT_OWNED", "CommercialPerson pertenece a otro asesor.");
  if (result.data.lifecycle_state !== "CONFIRMED" || result.data.archived_at) {
    fail("CRS10_PERSON_NOT_ACTIVE", "CommercialPerson no está confirmada o está archivada.");
  }
  return result.data;
}

function domain(id, items, reason = null) {
  return {
    id,
    status: items.length ? "AVAILABLE" : "EMPTY",
    reason,
    items,
  };
}

function degraded(id, error) {
  return {
    id,
    status: "DEGRADED",
    reason: codeOf(error),
    items: [],
  };
}

function unavailable(id, reason) {
  return {
    id,
    status: "UNAVAILABLE",
    reason,
    items: [],
  };
}

async function readDomain(id, reader) {
  if (typeof reader !== "function") return unavailable(id, "SOURCE_READER_NOT_CONNECTED");
  try {
    return await reader();
  } catch (error) {
    return degraded(id, error);
  }
}

function mapFutureRadar(projection, personReference) {
  return list(projection?.items)
    .filter(item => item?.personReference === personReference)
    .map(item => ({
      reference: item.signalReference,
      label: title(item.signalType || "Señal futura"),
      summary: [item.whyThisPerson, item.whyNow].filter(Boolean).join(" · "),
      state: "REVIEW_REQUIRED",
      authority: DOMAIN_AUTHORITIES.FUTURE_RADAR,
      scope: "PERSON",
      personReference,
      effectiveDate: item.eventDate,
      reviewRequired: item.advisorConfirmationRequired === true,
      uncertainty: item.uncertainty,
      smallestUsefulAction: item.smallestUsefulAction,
      evidenceCount: list(item.evidenceSummary).length,
      deepLink: deepLink(personReference, "future-radar"),
    }));
}

function mapGrowth(projection, personReference) {
  return list(projection?.items)
    .filter(item => item?.personReference === personReference)
    .map(item => ({
      reference: item.candidateReference,
      label: title(item.growthClass || "Revisión de relación"),
      summary: [item.whyThisPerson, item.whyNow].filter(Boolean).join(" · "),
      state: "REVIEW_REQUIRED",
      authority: DOMAIN_AUTHORITIES.RELATIONSHIP_GROWTH,
      scope: "PERSON",
      personReference,
      reviewRequired: true,
      uncertainty: item.uncertainty,
      smallestUsefulAction: item.smallestUsefulAction,
      evidenceCount: list(item.evidence).length,
      deepLink: deepLink(personReference, "relationship-growth"),
    }));
}

function mapActivation(projection, personReference) {
  return list(projection?.items)
    .filter(item => item?.personReference === personReference)
    .map(item => ({
      reference: item.actionReference,
      label: item.actionLabel || title(item.actionClass || "Acción relacional"),
      summary: [item.whyThisPerson, item.whyNow].filter(Boolean).join(" · "),
      state: "REVIEW_REQUIRED",
      authority: DOMAIN_AUTHORITIES.RELATIONAL_ACTIVATION,
      scope: "PERSON",
      personReference,
      effectiveDate: item.eventDate,
      reviewRequired: true,
      uncertainty: item.uncertainty,
      smallestUsefulAction: item.smallestUsefulAction,
      evidenceCount: list(item.evidence).length,
      deepLink: deepLink(personReference, "relational-activation"),
    }));
}

function economicPersonReference(item) {
  return item?.personReference
    || item?.handoff?.personReference
    || item?.decision?.selectedMatch?.personReference
    || item?.evidence?.claimedPersonReference
    || null;
}

function economicCandidateIncludes(item, personReference) {
  return list(item?.proposal?.personCandidates).some(candidate => (
    (typeof candidate === "string" ? candidate : candidate?.reference) === personReference
  ));
}

function mapEconomic(items, personReference) {
  return list(items)
    .filter(item => economicPersonReference(item) === personReference || economicCandidateIncludes(item, personReference))
    .map(item => {
      const evidence = item.evidence || item;
      const status = String(item.status || item?.decision?.resultingStatus || evidence.status || "UNKNOWN").toUpperCase();
      const confirmed = status.includes("CONFIRMED") || status.includes("HANDOFF");
      const information = status.includes("INFORMATION");
      return {
        reference: evidence.evidenceId || item.evidenceId,
        label: "Conexión económica",
        summary: confirmed
          ? "La evidencia ya cuenta con decisión humana y handoff canónico."
          : "La evidencia permanece como claim y requiere revisión humana.",
        state: confirmed ? "CONFIRMED" : information ? "INFORMATION_REQUIRED" : "REVIEW_REQUIRED",
        authority: DOMAIN_AUTHORITIES.ECONOMIC_CONNECTION,
        scope: "PERSON",
        personReference,
        observedAt: evidence.observedAt || evidence.receivedAt || null,
        reviewRequired: !confirmed,
        uncertainty: item?.proposal?.contradictions?.length
          ? `${item.proposal.contradictions.length} contradicción(es) declarada(s).`
          : evidence.uncertainty || null,
        smallestUsefulAction: confirmed
          ? "Revisar el registro canónico en Cartera."
          : "Revisar evidencia, coincidencias y faltantes antes de confirmar.",
        evidenceCount: 1 + list(evidence.attachmentReferences).length,
        deepLink: deepLink(personReference, "economic-connection"),
      };
    });
}

function mapCapital(projection, personReference) {
  return list(projection?.items)
    .filter(item => item?.personReference === personReference)
    .map(item => ({
      reference: item.capitalReference,
      label: title(item.capitalClass || "Capital relacional"),
      summary: [item.whyThisRelationship, item.whyNow].filter(Boolean).join(" · "),
      state: "REVIEW_REQUIRED",
      authority: DOMAIN_AUTHORITIES.RELATIONSHIP_CAPITAL,
      scope: "PERSON",
      personReference,
      reviewRequired: true,
      uncertainty: item.uncertainty,
      smallestUsefulAction: item.smallestUsefulAction,
      evidenceCount: list(item.evidence).length,
      deepLink: deepLink(personReference, "relationship-capital"),
    }));
}

function mapProductivity(proof, personReference, asOfDate) {
  const statement = proof?.statement || {};
  const state = statement.state === "INSUFFICIENT_EVIDENCE"
    ? "INSUFFICIENT_EVIDENCE"
    : "OBSERVED";
  const metrics = proof?.metrics && typeof proof.metrics === "object"
    ? Object.values(proof.metrics)
    : [];
  const evidenceCount = metrics.reduce((total, metric) => total + list(metric?.evidenceReferences).length, 0);
  return [{
    reference: `CARTERA100:${monthStart(asOfDate)}:${asOfDate}`,
    label: "Evidencia de productividad del asesor",
    summary: `No atribuida a ${personReference}. ${statement.text || "No existe una afirmación productiva para este periodo."}`,
    state,
    authority: DOMAIN_AUTHORITIES.PRODUCTIVITY_PROOF,
    scope: "ADVISOR",
    personReference: null,
    effectiveDate: asOfDate,
    reviewRequired: false,
    uncertainty: state === "INSUFFICIENT_EVIDENCE"
      ? "La ausencia de evidencia no se interpreta como productividad cero."
      : "La evidencia describe actividad observable; no prueba causalidad ni valor humano.",
    smallestUsefulAction: "Abrir Productividad en Cartera para revisar fuentes y limitaciones.",
    evidenceCount,
    deepLink: `?nav=cartera&intelligence=productivity-proof`,
  }];
}

export function createCrs10ExistingRelationshipIntelligenceService({
  client,
  futureRadarService = null,
  growthService = null,
  activationService = null,
  relationshipMemoryService = null,
  relationshipCapitalService = null,
  productivityProofService = null,
  economicConnectionReader = null,
} = {}) {
  if (!client?.auth?.getUser || !client?.from || !client?.rpc) {
    fail("CRS10_SUPABASE_CLIENT_INVALID", "El cliente Supabase no cumple el contrato requerido.");
  }

  const resolvedGrowth = growthService || createCartera060RelationshipGrowthService({ client });
  const resolvedMemory = relationshipMemoryService || createCartera040RelationshipMemoryService({ client });
  const resolved = Object.freeze({
    future: futureRadarService || createCartera050FutureRadarService({ client }),
    growth: resolvedGrowth,
    activation: activationService || createCartera070RelationalActivationService({ client }),
    capital: relationshipCapitalService || createCartera090RelationshipCapitalService({
      growthService: resolvedGrowth,
      relationshipMemoryService: resolvedMemory,
    }),
    productivity: productivityProofService || createCartera100ProductivityProofService({ client }),
  });

  return Object.freeze({
    async loadRelationshipIntelligence({ personReference, asOfDate = today() } = {}) {
      const reference = requiredReference(personReference, "CRS10_PERSON_REFERENCE_INVALID");
      const user = await authenticatedUser(client);
      await assertOwnedActivePerson(client, user, reference);

      const domains = await Promise.all([
        readDomain("FUTURE_RADAR", async () => domain(
          "FUTURE_RADAR",
          mapFutureRadar(await resolved.future.loadFutureRadar({ asOfDate, timezone: "America/Mexico_City" }), reference),
        )),
        readDomain("RELATIONSHIP_GROWTH", async () => domain(
          "RELATIONSHIP_GROWTH",
          mapGrowth(await resolved.growth.loadGrowthReviews({ personReference: reference, asOfDate, limit: 40 }), reference),
        )),
        readDomain("RELATIONAL_ACTIVATION", async () => domain(
          "RELATIONAL_ACTIVATION",
          mapActivation(await resolved.activation.loadActivationDeck({ asOfDate, availableMinutes: 240, maxCards: 5 }), reference),
        )),
        readDomain("ECONOMIC_CONNECTION", economicConnectionReader
          ? async () => domain("ECONOMIC_CONNECTION", mapEconomic(await economicConnectionReader(), reference))
          : null),
        readDomain("RELATIONSHIP_CAPITAL", async () => domain(
          "RELATIONSHIP_CAPITAL",
          mapCapital(await resolved.capital.loadRelationshipCapital({
            asOfDate,
            personReferences: [reference],
            briefLimit: 1,
          }), reference),
        )),
        readDomain("PRODUCTIVITY_PROOF", async () => domain(
          "PRODUCTIVITY_PROOF",
          mapProductivity(await resolved.productivity.loadProductivityProof({
            startDate: monthStart(asOfDate),
            endDate: asOfDate,
            limit: 250,
          }), reference, asOfDate),
        )),
      ]);

      return createRelationshipIntelligenceComposition({
        advisorReference: user.id,
        personReference: reference,
        asOfDate,
        generatedAt: new Date().toISOString(),
        domains: Object.fromEntries(domains.map(item => [item.id, item])),
      });
    },

    diagnostics() {
      return Object.freeze({
        contract: "CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001",
        existingCarteraServicesReused: Object.freeze(["040", "050", "060", "070", "080", "090", "100"]),
        readOnlyComposition: true,
        secondScoreEngine: false,
        secondRelationshipMemoryAuthority: false,
        secondActivationStack: false,
        automaticContact: false,
        automaticMessage: false,
        automaticTask: false,
        automaticCalendar: false,
        automaticOpportunity: false,
        automaticBusinessMutation: false,
      });
    },
  });
}

export {
  Crs10RelationshipIntelligenceServiceError,
  mapFutureRadar,
  mapGrowth,
  mapActivation,
  mapEconomic,
  mapCapital,
  mapProductivity,
};
