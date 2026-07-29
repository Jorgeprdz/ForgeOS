const pipelineBase = new URL("../../../advisor-os/sales-pipeline/", import.meta.url);
const nashBase = new URL("../../../nash/", import.meta.url);

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
    referred_new: "Referido",
    contacted: "Contactado",
    appointment_scheduled: "Cita",
    proposal: "Solicitud",
    decision: "Firma",
    client: "Cerrado",
  })[status] || status || "Etapa no disponible";
}

export async function createProductiveIntelligenceAdapter() {
  await loadAuthorities();
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  const serviceAuthority = globalThis.ForgeProductiveProspectService067G17B;
  const timelineAuthority = globalThis.ForgeProspectTimelineServiceNFAST08;
  if (!bootstrap?.getClient || !serviceAuthority?.create || !timelineAuthority?.create) {
    throw new Error("PRODUCTIVE_INTELLIGENCE_AUTHORITY_UNAVAILABLE");
  }
  const client = await bootstrap.getClient();
  const service = serviceAuthority.create(client);
  const timelineService = timelineAuthority.create(client);
  let records = [];
  let cards = [];

  async function reload() {
    records = await service.listProspects();
    cards = await Promise.all(records.map(async prospect => {
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
        sourceSummary: [prospect.source, prospect.referrerName, prospect.referrerRelationship].filter(Boolean).join(" · ") || "Fuente no disponible",
        phone: prospect.phone || prospect.whatsapp || null,
        latestActivity: latest ? {
          label: latest.eventType || "Actividad registrada",
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
        intelligenceState: "CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST",
        prospect,
      });
    }));
    return cards;
  }

  async function prepareMessage(prospect) {
    await loadNashAuthorities();
    const orchestrator = globalThis.ForgePipelineNashDraftOrchestrator
      .createPipelineNashDraftOrchestrator({
        invokeFunction: (name, options) => client.functions?.invoke
          ? client.functions.invoke(name, options)
          : Promise.resolve({ error: new Error("PROVIDER_NOT_CONFIGURED") }),
      });
    const result = await orchestrator.requestDraft({
      pipelineRecord: prospect,
      approvedDisplayName: true,
      providerId: globalThis.__FORGE_NASH_PROVIDER_ID__ || "deterministic",
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

  return Object.freeze({
    service, timelineService, reload, prepareMessage,
    createProspect: payload => service.createProspect(payload),
    get cards() { return cards; },
    get records() { return records; },
  });
}
