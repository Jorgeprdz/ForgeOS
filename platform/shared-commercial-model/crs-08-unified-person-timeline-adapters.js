"use strict";

(function (root, factory) {
  const common = typeof module !== "undefined" && module.exports;
  const contract = common
    ? require("./crs-08-unified-person-timeline-contract.js")
    : root?.ForgeCrs08UnifiedPersonTimelineContract;
  const api = factory(contract);
  if (common) module.exports = api;
  if (root) root.ForgeCrs08UnifiedPersonTimelineAdapters = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (contract) {
  const ADAPTER_VERSION = "CRS-08-UNIFIED-PERSON-TIMELINE-ADAPTERS-001.1";
  const PIPELINE_TITLES = Object.freeze({
    referred_new: "Prospecto registrado",
    contact_pending: "Contacto pendiente",
    contacted: "Prospecto contactado",
    appointment_scheduled: "Cita agendada",
    discovery: "Descubrimiento comercial",
    proposal: "Propuesta en seguimiento",
    closed_won: "Oportunidad ganada",
    closed_lost: "Oportunidad cerrada",
  });
  const ACTIVITY_TITLES = Object.freeze({
    PROSPECT_PROFILE_CREATED: "Perfil de prospecto creado",
    PROSPECT_CREATED: "Prospecto registrado",
    INITIAL_CONTEXT_CAPTURED: "Contexto inicial capturado",
    TIMELINE_INITIALIZED: "Historial iniciado",
    APPOINTMENT_SCHEDULED: "Cita agendada",
    APPOINTMENT_HELD: "Cita realizada",
    APPOINTMENT_NOT_HELD: "Cita no realizada",
    APPOINTMENT_RESCHEDULED: "Cita reagendada",
    APPOINTMENT_NO_SHOW: "Inasistencia registrada",
    ACTIVITY_CONTEXT_ADDED: "Contexto de actividad añadido",
    DUE_ACTION_CREATED: "Seguimiento creado",
    DUE_ACTION_RESCHEDULED: "Seguimiento reagendado",
    DUE_ACTION_COMPLETED: "Seguimiento completado",
  });
  const QUOTE_TITLES = Object.freeze({
    QUOTE_CREATED: "Cotización creada",
    QUOTE_VERSION_CREATED: "Nueva versión de cotización",
    QUOTE_CONFIRMED: "Cotización confirmada",
    QUOTE_ACCEPTED: "Cotización aceptada",
    QUOTE_REJECTED: "Cotización rechazada",
    APPLICATION_STARTED: "Solicitud iniciada desde cotización",
  });

  const CARTERA040_SOURCE_MAP = Object.freeze({
    PIPELINE_TIMELINE: Object.freeze({ domain: "PIPELINE", recordType: "PIPELINE_EVENT", authority: "PIPELINE_STAGE_EVENT_AUTHORITY" }),
    POLICY_INTELLIGENCE: Object.freeze({ domain: "CARTERA", recordType: "POLICY_EVENT", authority: "CARTERA_POLICY_AUTHORITY" }),
    PAYMENT_EVENT: Object.freeze({ domain: "CARTERA", recordType: "PAYMENT_EVENT", authority: "CARTERA_PAYMENT_AUTHORITY" }),
    SERVICE_WORKFLOW: Object.freeze({ domain: "CARTERA", recordType: "SERVICE_EVENT", authority: "CARTERA_SERVICE_AUTHORITY" }),
    ADVISOR_CONFIRMED: Object.freeze({ domain: "ACTIVITY", recordType: "ACTIVITY_EVENT", authority: "FES_CANONICAL_ACTIVITY_TIMELINE" }),
    CLIENT_CONFIRMED: Object.freeze({ domain: "ACTIVITY", recordType: "ACTIVITY_EVENT", authority: "FES_CANONICAL_ACTIVITY_TIMELINE" }),
  });

  const APPLICATION_TITLES = Object.freeze({
    APPLICATION_CREATED: "Solicitud creada",
    APPLICATION_VERSION_CREATED: "Nueva versión de solicitud",
    APPLICATION_READY_FOR_SIGNATURE: "Solicitud lista para firma",
    SIGNATURE_RECORDED: "Firma registrada",
    APPLICATION_SIGNED: "Solicitud firmada",
    APPLICATION_SUBMITTED: "Solicitud enviada",
    REQUIREMENT_OPENED: "Requisito abierto",
    REQUIREMENT_SATISFIED: "Requisito satisfecho",
    REQUIREMENT_WAIVED: "Requisito dispensado",
    REQUIREMENT_DISPUTED: "Requisito en disputa",
    APPLICATION_APPROVED: "Solicitud aprobada",
    APPLICATION_DECLINED: "Solicitud declinada",
    APPLICATION_WITHDRAWN: "Solicitud retirada",
  });

  class Crs08TimelineAdapterError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs08TimelineAdapterError";
      this.code = code;
      this.details = details;
    }
  }
  const fail = (code, message, details = null) => { throw new Crs08TimelineAdapterError(code, message, details); };
  const optional = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const required = (value, code, label) => optional(value) || fail(code, `${label} es obligatoria.`);
  const iso = value => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
    return new Date(value).toISOString();
  };
  const context = input => ({
    advisorReference: required(input?.advisorReference, "CRS08_ADVISOR_REFERENCE_REQUIRED", "El asesor"),
    personReference: required(input?.personReference, "CRS08_PERSON_REFERENCE_REQUIRED", "CommercialPerson"),
    relationshipReference: required(input?.relationshipReference, "CRS08_RELATIONSHIP_REFERENCE_REQUIRED", "AdvisorCommercialRelationship"),
    correlationId: optional(input?.correlationId),
  });
  const create = input => {
    if (!contract?.createSourceEntry) fail("CRS08_CONTRACT_REQUIRED", "El contrato CRS 08 es obligatorio.");
    return contract.createSourceEntry(input);
  };
  const value = (object, ...keys) => {
    for (const key of keys) if (object?.[key] !== undefined && object?.[key] !== null) return object[key];
    return null;
  };
  const stateConfirmation = state => String(state || "").toUpperCase() === "DISPUTED" ? "DISPUTED" : "CONFIRMED";


  function fromCartera040HistoryEvent(item, inputContext) {
    const ctx = context(inputContext);
    const sourceAuthority = required(item?.sourceAuthority, "CRS08_CARTERA040_SOURCE_AUTHORITY_REQUIRED", "La autoridad de Cartera 040B").toUpperCase();
    const mapping = CARTERA040_SOURCE_MAP[sourceAuthority];
    if (!mapping) fail("CRS08_CARTERA040_SOURCE_AUTHORITY_UNSUPPORTED", "Cartera 040B contiene una autoridad no mapeada.", { sourceAuthority });
    const sourceReference = required(item?.sourceRecordReference, "CRS08_CARTERA040_SOURCE_REFERENCE_REQUIRED", "El registro fuente de Cartera 040B");
    const occurredAt = iso(item?.occurredAt) || fail("CRS08_CARTERA040_OCCURRED_REQUIRED", "Cartera 040B no tiene occurredAt.");
    const truthClass = String(item?.truthClass || "CONFIRMED_EVENT").toUpperCase();
    return create({
      domain: mapping.domain,
      recordType: mapping.recordType,
      recordReference: sourceReference,
      sourceEventReference: sourceReference,
      authority: mapping.authority,
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId,
      title: required(item?.title || item?.eventType || "Actividad de relación", "CRS08_CARTERA040_TITLE_REQUIRED", "El título de Cartera 040B"),
      summary: optional(item?.summary),
      occurredAt,
      recordedAt: occurredAt,
      privacyClassification: truthClass === "CONFIRMED_SENSITIVE_CONTEXT" ? "SENSITIVE" : "PRIVATE",
      confirmationState: "CONFIRMED",
      correctionOf: null,
      facts: {
        truthClass,
        contextUse: optional(item?.contextUse),
        consentState: optional(item?.consentState),
        projectedBy: "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF",
      },
    });
  }

  function fromPipelineProspect(row, inputContext) {
    const ctx = context(inputContext);
    const id = required(row?.id, "CRS08_PIPELINE_PROSPECT_REQUIRED", "Prospect");
    const status = String(row.status || "referred_new").trim();
    const occurredAt = iso(row.updated_at) || iso(row.created_at) || fail("CRS08_PIPELINE_TIME_REQUIRED", "Prospect no tiene fecha autoritativa.");
    const version = Number(row.version || 1);
    return create({
      domain: "PIPELINE",
      recordType: "PROSPECT_SNAPSHOT",
      recordReference: id,
      sourceEventReference: `pipeline-prospect:${id}:v${Number.isSafeInteger(version) && version > 0 ? version : 1}`,
      authority: "PIPELINE_PROSPECT_AUTHORITY",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId,
      title: PIPELINE_TITLES[status] || "Estado de Pipeline actualizado",
      summary: null,
      occurredAt,
      recordedAt: occurredAt,
      privacyClassification: "PRIVATE",
      confirmationState: "CONFIRMED",
      correctionOf: null,
      facts: { stage: status, source: optional(row.source), archived: Boolean(row.archived_at) },
    });
  }

  function fromActivityLedgerRow(row, inputContext) {
    const ctx = context(inputContext);
    const event = row?.canonical_event || row?.canonicalEvent || {};
    const eventId = required(row?.event_id || event.event_id, "CRS08_ACTIVITY_EVENT_REQUIRED", "El evento Activity");
    const eventType = required(row?.event_type || event.event_type, "CRS08_ACTIVITY_TYPE_REQUIRED", "El tipo Activity");
    const payload = event.payload && typeof event.payload === "object" && !Array.isArray(event.payload) ? event.payload : {};
    const safeFacts = {
      eventType,
      subjectType: row?.subject_type || event?.subject?.type || null,
      outcome: optional(value(payload, "outcome", "outcome_code")),
      nextActionType: optional(value(payload, "next_action_type", "nextActionType")),
    };
    return create({
      domain: "ACTIVITY",
      recordType: "ACTIVITY_EVENT",
      recordReference: eventId,
      sourceEventReference: eventId,
      authority: "FES_ACTIVITY_EVENT_LEDGER",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId || optional(event.correlation_id),
      title: ACTIVITY_TITLES[eventType] || "Actividad registrada",
      summary: null,
      occurredAt: iso(row.occurred_at || event.occurred_at) || fail("CRS08_ACTIVITY_OCCURRED_REQUIRED", "Activity no tiene occurredAt."),
      recordedAt: iso(row.recorded_at || event.recorded_at) || fail("CRS08_ACTIVITY_RECORDED_REQUIRED", "Activity no tiene recordedAt."),
      privacyClassification: String(row.privacy_class || event.privacy_class || "PRIVATE").toUpperCase(),
      confirmationState: String(row.confirmation_state || event.confirmation_state || "UNCONFIRMED").toUpperCase(),
      correctionOf: optional(row.correction_of || event.correction_of),
      facts: safeFacts,
    });
  }

  function fromQuoteLifecycleEvent(row, quote, inputContext) {
    const ctx = context(inputContext);
    const eventId = required(row?.event_id, "CRS08_QUOTE_EVENT_REQUIRED", "El evento Quote");
    const eventType = required(row?.event_type, "CRS08_QUOTE_EVENT_TYPE_REQUIRED", "El tipo Quote");
    const quoteReference = required(quote?.quote_reference, "CRS08_QUOTE_REFERENCE_REQUIRED", "Quote");
    const occurredAt = iso(row.occurred_at) || iso(quote.updated_at) || fail("CRS08_QUOTE_TIME_REQUIRED", "Quote no tiene fecha autoritativa.");
    return create({
      domain: "QUOTE",
      recordType: "QUOTE_EVENT",
      recordReference: quoteReference,
      sourceEventReference: eventId,
      authority: "QUOTE_LIFECYCLE_AUTHORITY",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId,
      title: QUOTE_TITLES[eventType] || "Cotización actualizada",
      summary: null,
      occurredAt,
      recordedAt: iso(row.recorded_at) || occurredAt,
      privacyClassification: "PRIVATE",
      confirmationState: String(row.confirmation_state || "CONFIRMED").toUpperCase(),
      correctionOf: optional(row.correction_of),
      facts: {
        eventType,
        lifecycleState: optional(row.lifecycle_state),
        previousLifecycleState: optional(row.previous_lifecycle_state),
        productReference: optional(quote.product_reference),
        quoteVersionReference: optional(row.quote_version_reference),
      },
    });
  }

  function fromApplicationEvent(row, application, inputContext) {
    const ctx = context(inputContext);
    const eventReference = required(row?.event_reference, "CRS08_APPLICATION_EVENT_REQUIRED", "El evento Application");
    const eventType = required(row?.event_type, "CRS08_APPLICATION_EVENT_TYPE_REQUIRED", "El tipo Application");
    const applicationReference = required(application?.application_reference, "CRS08_APPLICATION_REFERENCE_REQUIRED", "Application");
    const occurredAt = iso(row.occurred_at) || iso(row.recorded_at) || fail("CRS08_APPLICATION_TIME_REQUIRED", "Application no tiene fecha autoritativa.");
    return create({
      domain: "APPLICATION",
      recordType: "APPLICATION_EVENT",
      recordReference: applicationReference,
      sourceEventReference: eventReference,
      authority: "APPLICATION_AUTHORITY",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId,
      title: APPLICATION_TITLES[eventType] || "Solicitud actualizada",
      summary: null,
      occurredAt,
      recordedAt: iso(row.recorded_at) || occurredAt,
      privacyClassification: "RESTRICTED",
      confirmationState: stateConfirmation(row.lifecycle_state),
      correctionOf: optional(row.correction_of),
      facts: {
        eventType,
        lifecycleState: optional(row.lifecycle_state),
        previousLifecycleState: optional(row.previous_lifecycle_state),
        productReference: optional(application.product_reference),
        quoteReference: optional(application.quote_reference),
      },
    });
  }

  function fromPolicyVersion(policy, version, role, inputContext) {
    const ctx = context(inputContext);
    const policyReference = required(policy?.policy_reference, "CRS08_POLICY_REFERENCE_REQUIRED", "Policy");
    const versionReference = required(version?.policy_version_reference, "CRS08_POLICY_VERSION_REQUIRED", "Policy Version");
    const occurredAt = iso(policy.effective_from) || (policy.issue_date ? iso(`${policy.issue_date}T00:00:00.000Z`) : null) || iso(version.confirmed_at) || fail("CRS08_POLICY_TIME_REQUIRED", "Policy no tiene fecha autoritativa.");
    const privacy = String(role?.privacy_classification || "RESTRICTED").toUpperCase();
    return create({
      domain: "CARTERA",
      recordType: "POLICY_VERSION",
      recordReference: policyReference,
      sourceEventReference: versionReference,
      authority: "CARTERA_POLICY_AUTHORITY",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId,
      title: Number(version.version_number || 1) === 1 ? "Póliza emitida" : "Póliza actualizada",
      summary: null,
      occurredAt,
      recordedAt: iso(version.confirmed_at) || occurredAt,
      privacyClassification: privacy,
      confirmationState: String(role?.confirmation_state || "CONFIRMED").toUpperCase(),
      correctionOf: null,
      facts: {
        status: optional(policy.status_value),
        carrierReference: optional(policy.carrier_reference),
        productReference: optional(policy.product_reference),
        roleType: optional(role?.role_type),
        versionNumber: Number(version.version_number || 1),
        applicationReference: optional(version.application_reference),
        quoteReference: optional(version.quote_reference),
      },
    });
  }

  function fromApplicationPolicyLineage(lineage, inputContext) {
    const ctx = context(inputContext);
    const policy = lineage?.policy || {};
    const role = lineage?.personRole || {};
    const policyReference = required(policy.policyReference, "CRS08_POLICY_REFERENCE_REQUIRED", "Policy");
    const versionReference = required(policy.policyVersionReference, "CRS08_POLICY_VERSION_REQUIRED", "Policy Version");
    const occurredAt = iso(policy.effectiveFrom) || iso(policy.issueDate) || iso(policy.confirmedAt) ||
      fail("CRS08_POLICY_TIME_REQUIRED", "Policy no tiene fecha autoritativa.");
    return create({
      domain: "CARTERA",
      recordType: "POLICY_VERSION",
      recordReference: policyReference,
      sourceEventReference: versionReference,
      authority: "CARTERA_POLICY_AUTHORITY",
      personReference: ctx.personReference,
      relationshipReference: ctx.relationshipReference,
      correlationId: ctx.correlationId || optional(lineage.correlationId) || optional(lineage.domainLink?.correlationId),
      title: Number(policy.versionNumber || 1) === 1 ? "Póliza emitida" : "Póliza actualizada",
      summary: null,
      occurredAt,
      recordedAt: iso(policy.confirmedAt) || occurredAt,
      privacyClassification: String(role.privacyClassification || "RESTRICTED").toUpperCase(),
      confirmationState: String(role.confirmationState || "CONFIRMED").toUpperCase(),
      correctionOf: null,
      facts: {
        status: optional(policy.statusValue),
        carrierReference: optional(policy.carrierReference),
        productReference: optional(policy.productReference),
        roleType: optional(role.roleType),
        versionNumber: Number(policy.versionNumber || 1),
        applicationReference: optional(policy.applicationReference),
        quoteReference: optional(policy.quoteReference),
      },
    });
  }

  return Object.freeze({
    ADAPTER_VERSION,
    PIPELINE_TITLES,
    ACTIVITY_TITLES,
    QUOTE_TITLES,
    APPLICATION_TITLES,
    CARTERA040_SOURCE_MAP,
    Crs08TimelineAdapterError,
    fromCartera040HistoryEvent,
    fromPipelineProspect,
    fromActivityLedgerRow,
    fromQuoteLifecycleEvent,
    fromApplicationEvent,
    fromPolicyVersion,
    fromApplicationPolicyLineage,
  });
});
