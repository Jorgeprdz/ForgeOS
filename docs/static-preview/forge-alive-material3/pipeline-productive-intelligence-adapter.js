const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const pipelineBase = new URL(sourceLayout ? "../../../advisor-os/sales-pipeline/" : "../../advisor-os/sales-pipeline/", import.meta.url);
const nashBase = new URL(sourceLayout ? "../../../nash/" : "../../nash/", import.meta.url);
const managerNbaBase = new URL(sourceLayout ? "../../../manager-os/nba/" : "../../manager-os/nba/", import.meta.url);
const STAGE_CONFIRMATION_TTL_MS = 30000;

async function load(url) {
  await import(`${url.href}?v=material3-productive-001`);
}

async function loadAuthorities() {
  for (const path of [
    "productive-prospect-service.js",
    "productive-prospect-bootstrap.js",
    "prospect-timeline/prospect-timeline-contract.js",
    "prospect-timeline/prospect-timeline-service.js",
  ]) await load(new URL(path, pipelineBase));
}

async function loadNashAuthorities() {
  for (const [base, path] of [
    [pipelineBase, "prospect-context/universal-governed-prospect-context-contract.js"],
    [pipelineBase, "prospect-context/pipeline-universal-prospect-context-adapter.js"],
    [nashBase, "context-intake/nash-prospect-context-intake-boundary-contract.js"],
    [nashBase, "context-intake/nash-prospect-context-intake.js"],
    [nashBase, "context-intake/nash-universal-prospect-context-consumer.js"],
    [nashBase, "conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js"],
    [nashBase, "conversation-brief/nash-provider-request-contract.js"],
    [nashBase, "remote-draft-provider-client-boundary.js"],
    [nashBase, "pipeline-nash-draft-orchestrator.js"],
    [nashBase, "draft-intake/nfast06-draft-safety-boundary.js"],
    [nashBase, "draft-intake/nfast06-deterministic-draft-renderer.js"],
    [pipelineBase, "contact-navigation/productive-contact-navigation-boundary.js"],
    [nashBase, "../nash-intent-engine.js"],
    [nashBase, "../nash-combat-orchestrator.js"],
    [nashBase, "../nash-next-best-action-engine.js"],
    [nashBase, "../nash-combat-intelligence-report-engine.js"],
    [managerNbaBase, "nba-reason-why-boundary-contract.js"],
    [managerNbaBase, "nash-mick-nba-reconnection-engine.js"],
  ]) await load(new URL(path, base));
}

function latestTimelineEvent(events) {
  return [...events].sort((a, b) =>
    String(b.occurredAt || b.recordedAt || "").localeCompare(
      String(a.occurredAt || a.recordedAt || ""),
    ))[0] || null;
}

function stageLabel(status) {
  return ({
    referred_new: "Nuevo",
    contacted: "Contactado",
    appointment_scheduled: "Cita agendada",
    proposal: "Propuesta",
    decision: "En decisión",
    client: "Cliente",
  })[status] || status || "Etapa no disponible";
}

const STAGE_OPTIONS = Object.freeze([
  Object.freeze({ value: "referred_new", label: "Nuevo" }),
  Object.freeze({ value: "contacted", label: "Contactado" }),
  Object.freeze({ value: "appointment_scheduled", label: "Cita agendada" }),
  Object.freeze({ value: "proposal", label: "Propuesta" }),
  Object.freeze({ value: "decision", label: "En decisión" }),
  Object.freeze({ value: "client", label: "Cliente" }),
]);

function prospectVersion(prospect) {
  const value = Date.parse(prospect?.updatedAt || prospect?.updated_at || "");
  return Number.isFinite(value) ? value : 0;
}

export function assertConfirmedStage({ prospect, requestedStatus, phase = "mutation" }) {
  if (prospect?.id && prospect.status === requestedStatus) return prospect;
  const error = new Error("PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH");
  error.code = "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH";
  error.details = Object.freeze({
    phase,
    prospectId: prospect?.id || null,
    requestedStatus,
    returnedStatus: prospect?.status || null,
  });
  throw error;
}

export function reconcileUpdatedProspectState({
  records = [],
  cards = [],
  updatedProspect,
  requestedStatus,
}) {
  assertConfirmedStage({
    prospect: updatedProspect,
    requestedStatus,
    phase: "update-response",
  });

  const nextRecords = records.map(record =>
    record.id === updatedProspect.id ? updatedProspect : record
  );
  const nextCards = cards.map(card =>
    card.id === updatedProspect.id
      ? Object.freeze({
          ...card,
          status: updatedProspect.status,
          stageLabel: stageLabel(updatedProspect.status),
          prospect: updatedProspect,
        })
      : card
  );

  return Object.freeze({ records: nextRecords, cards: nextCards });
}

export function reconcileReloadedProspectState({
  loadedRecords = [],
  confirmations = new Map(),
  now = Date.now(),
  confirmationTtlMs = STAGE_CONFIRMATION_TTL_MS,
}) {
  const nextConfirmations = new Map(confirmations);
  const seen = new Set();
  const records = loadedRecords.map(record => {
    seen.add(record.id);
    const confirmation = nextConfirmations.get(record.id);
    if (!confirmation) return record;

    const loadedVersion = prospectVersion(record);
    const confirmedVersion = prospectVersion(confirmation.prospect);
    const expired = now - confirmation.confirmedAt > confirmationTtlMs;

    if (record.status === confirmation.status) {
      nextConfirmations.delete(record.id);
      return record;
    }

    if (expired || (loadedVersion > confirmedVersion && loadedVersion > 0)) {
      nextConfirmations.delete(record.id);
      return record;
    }

    return confirmation.prospect;
  });

  for (const [prospectId, confirmation] of nextConfirmations) {
    if (seen.has(prospectId)) continue;
    if (now - confirmation.confirmedAt > confirmationTtlMs) {
      nextConfirmations.delete(prospectId);
      continue;
    }
    records.push(confirmation.prospect);
  }

  return Object.freeze({
    records: Object.freeze(records),
    confirmations: nextConfirmations,
  });
}

function timelineEventLabel(eventType) {
  return ({
    PROSPECT_CREATED: "Prospecto creado",
    CONTACT_ATTEMPTED: "Contacto intentado",
    CONVERSATION_RECORDED: "Conversación registrada",
    APPOINTMENT_SCHEDULED: "Cita agendada",
    APPOINTMENT_RESCHEDULED: "Cita reprogramada",
    APPOINTMENT_COMPLETED: "Cita completada",
    OBJECTION_RECORDED: "Objeción clasificada",
    FOLLOW_UP_PLANNED: "Seguimiento planeado",
    PROPOSAL_PRESENTED: "Propuesta presentada",
    DECISION_RECORDED: "Decisión registrada",
    STAGE_CHANGED: "Estado actualizado",
  })[eventType] || "Actividad registrada";
}

export async function createProductiveIntelligenceAdapter(options = {}) {
  const injected = Boolean(options.service && options.timelineService);
  if (!injected) await loadAuthorities();

  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  const serviceAuthority = globalThis.ForgeProductiveProspectService067G17B;
  const timelineAuthority = globalThis.ForgeProspectTimelineServiceNFAST08;
  if (!injected && (!bootstrap?.getClient || !serviceAuthority?.create || !timelineAuthority?.create)) {
    throw new Error("PRODUCTIVE_INTELLIGENCE_AUTHORITY_UNAVAILABLE");
  }

  const client = options.client || (injected ? {} : await bootstrap.getClient());
  const service = options.service || serviceAuthority.create(client);
  const timelineService = options.timelineService || timelineAuthority.create(client);
  let records = [];
  let cards = [];
  let reloadSequence = 0;
  let stageMutationSequence = 0;
  const latestStageMutation = new Map();
  let confirmedStages = new Map();

  async function buildCards(nextRecords) {
    return Promise.all(nextRecords.map(async prospect => {
      let timeline = [];
      let timelineState = "CONNECTED";
      try {
        timeline = await timelineService.listProspectTimeline(prospect.id);
      } catch {
        timelineState = "UNAVAILABLE";
      }
      const latest = latestTimelineEvent(timeline);
      return Object.freeze({
        id: prospect.id,
        fullName: prospect.fullName || "Nombre no disponible",
        status: prospect.status || "referred_new",
        stageLabel: stageLabel(prospect.status),
        stageOptions: STAGE_OPTIONS,
        sourceValue: prospect.source || "",
        sourceSummary: [prospect.source, prospect.referrerName, prospect.referrerRelationship].filter(Boolean).join(" · ") || "Fuente no disponible",
        phone: prospect.phone || prospect.whatsapp || null,
        latestActivity: latest ? {
          label: timelineEventLabel(latest.eventType),
          occurredAt: latest.occurredAt || latest.recordedAt || null,
          source: "TIMELINE",
        } : null,
        nextCommitment: prospect.nextActionAt ? {
          type: prospect.nextActionType || "Compromiso registrado",
          dueAt: prospect.nextActionAt,
          source: "PRODUCTIVE_PROSPECT",
        } : null,
        timeline,
        timelineState,
        prospect,
      });
    }));
  }

  async function reload() {
    const sequence = ++reloadSequence;
    const loadedRecords = await service.listProspects();
    const reconciled = reconcileReloadedProspectState({
      loadedRecords,
      confirmations: confirmedStages,
    });
    const nextCards = await buildCards(reconciled.records);
    if (sequence !== reloadSequence) return cards;

    records = [...reconciled.records];
    cards = nextCards;
    confirmedStages = reconciled.confirmations;
    return cards;
  }

  async function prepareMessage(prospect) {
    await loadNashAuthorities();
    const orchestrator = globalThis.ForgePipelineNashDraftOrchestrator
      .createPipelineNashDraftOrchestrator({
        invokeFunction: (name, requestOptions) => client.functions?.invoke
          ? client.functions.invoke(name, requestOptions)
          : Promise.resolve({ error: new Error("PROVIDER_NOT_CONFIGURED") }),
      });
    const result = await orchestrator.requestDraft({
      pipelineRecord: prospect,
      approvedDisplayName: true,
      providerId: globalThis.__FORGE_NASH_PROVIDER_ID__ || "gemini",
    });
    const providerCandidate = result.providerEnvelope?.draftCandidate || null;
    const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
    const providerIntake = providerCandidate
      ? safety.intakeDraftProviderEnvelope(result.providerEnvelope)
      : null;
    const deterministic = globalThis.ForgeDeterministicDraftRendererNFAST06
      .draftCandidate(prospect);
    const candidate = providerIntake?.state === "READY_FOR_HUMAN_REVIEW"
      ? providerIntake.draftCandidateSnapshot
      : deterministic;
    const sourceMode = providerIntake?.state === "READY_FOR_HUMAN_REVIEW"
      ? "Sugerencia gobernada de NASH"
      : "Sugerencia determinística segura";
    const validation = safety.draftSafetyValidator({
      draftText: candidate.rawText || candidate.text,
      draftCandidateSnapshot: { ...candidate, sendsMessage: false },
      humanApproval: { required: true, finalAuthority: "HUMAN" },
    });
    return Object.freeze({
      result, providerIntake, candidate, validation, sourceMode,
      conversationBriefProduced: result.conversationBrief?.status === "SUCCESS",
      humanApprovalRequired: true,
      approved: false,
      automaticSendPerformed: false,
    });
  }

  async function analyzeCombat(prospect, objection) {
    await loadNashAuthorities();
    const text = String(objection || "").trim();
    if (!text) throw new Error("COMBAT_OBJECTION_REQUIRED");
    return globalThis.ForgeNashCombatIntelligenceReportEngine
      .buildCombatIntelligenceReport({
        objection: text,
        context: { name: prospect.fullName, prospectId: prospect.id, stage: prospect.status },
        personality: {},
      });
  }

  async function registerObjectionClassification(card, combat) {
    const objectionCode = combat?.classification?.type;
    if (!objectionCode) throw new Error("REVIEWED_OBJECTION_CLASSIFICATION_REQUIRED");
    const occurredAt = new Date().toISOString();
    await timelineService.appendProspectTimelineEvent(card.id, {
      eventType: "OBJECTION_RECORDED",
      occurredAt,
      sourceRecordReference: `PROSPECT:${card.id}`,
      payload: { objectionCode, resolutionStatus: "OPEN" },
      evidenceReferences: [`PROSPECT:${card.id}`],
      idempotencyKey: `OBJECTION:${card.id}:${objectionCode}:${occurredAt}`,
    });
    return reload();
  }

  async function buildNba(card, reviewedCombat = null) {
    await loadNashAuthorities();
    const latest = latestTimelineEvent(card.timeline || []);
    const persistedObjection = [...(card.timeline || [])].reverse().find(
      event => event.eventType === "OBJECTION_RECORDED" && event.payload?.objectionCode,
    );
    const objectionType = reviewedCombat?.classification?.type || persistedObjection?.payload?.objectionCode;
    const action = globalThis.ForgeNashNextBestActionEngine.buildNextBestAction(
      objectionType
        ? { objectionType, objectionIntent: reviewedCombat?.classification?.intent }
        : card.status === "referred_new" ? { responseStatus: "NEW" } : {},
    );
    const prospectRef = `PROSPECT:${card.id}`;
    const timelineRef = latest?.id ? `TIMELINE:${latest.id}` : null;
    const evidenceRefs = [prospectRef, timelineRef].filter(Boolean);
    const freshness = latest?.occurredAt || latest?.recordedAt
      ? { status: "CURRENT", capturedAt: latest.occurredAt || latest.recordedAt }
      : { status: "UNKNOWN" };
    const evidence = {
      evidenceRefs,
      sourceEvidenceIds: evidenceRefs,
      sourceOwners: timelineRef ? ["PIPELINE", "NFAST08_TIMELINE", "NBA_AUTHORITY"] : ["PIPELINE", "NBA_AUTHORITY"],
      freshness,
    };
    return globalThis.ForgeNashMickNbaReconnection006C.buildNashMickNbaReconnection({
      personId: card.id,
      personType: "prospect",
      relationshipContext: {
        targetPerson: { personId: card.id, name: card.fullName, personType: "prospect" },
        whyThisPerson: `${card.fullName} es el prospecto productivo seleccionado para revisión.`,
        ...evidence,
      },
      activityContext: latest ? { whyNow: `Último evento persistido: ${latest.eventType}.`, ...evidence } : null,
      followupContext: {
        recommendedAction: action.action,
        whyThisAction: objectionType
          ? "Una clasificación de objeción revisada requiere soporte conversacional."
          : action.reason,
        ...evidence,
      },
      nashConversationContext: {
        conversationAngle: reviewedCombat?.psychology?.recommendedStrategy || action.recommendedStyle,
        whyThisMessage: "Cualquier mensaje requiere validación y aprobación humana exacta.",
        suggestedMessageInstruction: "Preparar un borrador gobernado para revisión humana.",
        ...evidence,
      },
      nashCombatContext: objectionType ? {
        objectionSupport: `Clasificación revisada: ${objectionType}.`,
        ...evidence,
      } : null,
      mickBehaviorContext: latest ? {
        reasonWhy: "La recomendación usa únicamente la secuencia persistida.",
        whyNow: `Último evento persistido: ${latest.eventType}.`,
        whyThisAction: "Revisar el movimiento sin ejecución automática.",
        ...evidence,
      } : null,
      sourceEvidence: evidence,
      requestedUse: "ADVISOR_NEXT_BEST_ACTION_CONTEXT",
    });
  }

  async function updateStage(prospectId, status) {
    if (!STAGE_OPTIONS.some(option => option.value === status)) {
      throw new Error("PRODUCTIVE_STAGE_NOT_ALLOWED");
    }

    const mutationId = ++stageMutationSequence;
    latestStageMutation.set(prospectId, mutationId);
    reloadSequence += 1;

    try {
      assertConfirmedStage({
        prospect: await service.updateProspect(prospectId, { status }),
        requestedStatus: status,
        phase: "update-response",
      });
      const confirmedProspect = assertConfirmedStage({
        prospect: await service.getProspect(prospectId),
        requestedStatus: status,
        phase: "read-after-write",
      });

      if (latestStageMutation.get(prospectId) !== mutationId) return cards;

      confirmedStages.set(prospectId, Object.freeze({
        status,
        prospect: confirmedProspect,
        confirmedAt: Date.now(),
        mutationId,
      }));
      const reconciled = reconcileUpdatedProspectState({
        records,
        cards,
        updatedProspect: confirmedProspect,
        requestedStatus: status,
      });
      records = reconciled.records;
      cards = reconciled.cards;
      latestStageMutation.delete(prospectId);
      return cards;
    } catch (error) {
      if (latestStageMutation.get(prospectId) === mutationId) {
        latestStageMutation.delete(prospectId);
      }
      throw error;
    }
  }

  return Object.freeze({
    service, timelineService, reload, prepareMessage, analyzeCombat,
    registerObjectionClassification, buildNba, updateStage,
    createProspect: payload => service.createProspect(payload),
    get cards() { return cards; },
    get records() { return records; },
    get confirmedStages() { return new Map(confirmedStages); },
  });
}
