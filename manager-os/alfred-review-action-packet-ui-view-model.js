const {
  PACKET_TYPES,
  buildAlfredReviewActionPacket,
} = require("./alfred-review-action-packet-read-model");

const UI_SAFE_BOUNDARY = Object.freeze({
  previewOnly: true,
  reviewOnly: true,
  notApproved: true,
  notSendable: true,
  createsTruth: false,
  executesRuntime: false,
  sendsMessage: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
  providerRuntimeEnabled: false,
  liveSearchEnabled: false,
});

const VIEW_MODEL_SECTIONS = Object.freeze({
  SUMMARY: "summary",
  FACTS: "extracted_facts",
  ACTIONS: "proposed_actions",
  UNCERTAINTY: "uncertainty",
  QUESTIONS: "human_review_questions",
  SAFETY: "safety_boundary",
  FORBIDDEN: "forbidden_actions",
  VOICE: "voice_transcription_preview",
});

const PACKET_UI_COPY = Object.freeze({
  [PACKET_TYPES.MEMORY]: {
    icon: "memory",
    tone: "cyan",
    title: "Memory review packet",
    shortLabel: "Memory",
    summaryNoun: "memory note",
  },
  [PACKET_TYPES.REFERRAL]: {
    icon: "referral",
    tone: "blue",
    title: "Referral capture packet",
    shortLabel: "Referral",
    summaryNoun: "referral candidate",
  },
  [PACKET_TYPES.CALENDAR]: {
    icon: "calendar",
    tone: "gold",
    title: "Calendar draft packet",
    shortLabel: "Calendar draft",
    summaryNoun: "calendar draft",
  },
  [PACKET_TYPES.PRODUCT]: {
    icon: "product-intelligence",
    tone: "violet",
    title: "Product intelligence packet",
    shortLabel: "Product intelligence",
    summaryNoun: "product artifact",
  },
  [PACKET_TYPES.MESSAGE]: {
    icon: "message-draft",
    tone: "green",
    title: "Message draft packet",
    shortLabel: "Message draft",
    summaryNoun: "message draft",
  },
  [PACKET_TYPES.FOLLOW_UP]: {
    icon: "follow-up",
    tone: "orange",
    title: "Follow-up review packet",
    shortLabel: "Follow-up",
    summaryNoun: "follow-up candidate",
  },
  [PACKET_TYPES.INDEX]: {
    icon: "index",
    tone: "slate",
    title: "Universal index packet",
    shortLabel: "Universal index",
    summaryNoun: "index route",
  },
  [PACKET_TYPES.CHATBOT]: {
    icon: "chatbot",
    tone: "indigo",
    title: "Chatbot context packet",
    shortLabel: "Chatbot context",
    summaryNoun: "chatbot context",
  },
  [PACKET_TYPES.VOICE]: {
    icon: "microphone",
    tone: "pink",
    title: "Voice transcription packet",
    shortLabel: "Voice preview",
    summaryNoun: "voice transcription preview",
  },
});

const DISABLED_PROVIDER_CTAS = Object.freeze([
  {
    id: "send-message",
    label: "Send message",
    reason: "Messages require explicit human approval and a delivery gate before sending.",
  },
  {
    id: "create-calendar-event",
    label: "Create calendar event",
    reason: "Calendar writes require explicit human confirmation and a future calendar adapter gate.",
  },
  {
    id: "write-crm",
    label: "Write CRM",
    reason: "CRM writes are outside this view model and require a future explicit write gate.",
  },
  {
    id: "approve-product-artifact",
    label: "Approve artifact",
    reason: "Product, proposal, commission, and payout truth cannot be approved by Alfred.",
  },
  {
    id: "start-audio-runtime",
    label: "Start microphone runtime",
    reason: "Voice is preview-only here. No audio runtime or speech engine is enabled.",
  },
]);

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function stableHash(value) {
  const text = normalizeText(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function deriveCopy(packetType) {
  return PACKET_UI_COPY[packetType] || PACKET_UI_COPY[PACKET_TYPES.INDEX];
}

function makeSafeBoundary(extra = {}) {
  return {
    ...UI_SAFE_BOUNDARY,
    ...extra,
    previewOnly: true,
    reviewOnly: true,
    notApproved: true,
    notSendable: true,
    createsTruth: false,
    executesRuntime: false,
    sendsMessage: false,
    writesCrm: false,
    createsCalendarEvent: false,
    createsTask: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsPayoutTruth: false,
    audioRuntimeEnabled: false,
    speechEngineEnabled: false,
    providerRuntimeEnabled: false,
    liveSearchEnabled: false,
  };
}

function buildStatusPills(packet) {
  const packetType = packet.packetType || PACKET_TYPES.INDEX;
  const copy = deriveCopy(packetType);
  return [
    {
      id: "packet-type",
      label: copy.shortLabel,
      tone: copy.tone,
      reviewOnly: true,
      previewOnly: true,
    },
    {
      id: "preview-only",
      label: "Preview only",
      tone: "safe",
      reviewOnly: true,
      previewOnly: true,
    },
    {
      id: "human-review-required",
      label: "Human review required",
      tone: "warning",
      reviewOnly: true,
      previewOnly: true,
    },
    {
      id: "not-approved",
      label: "Not approved",
      tone: "locked",
      reviewOnly: true,
      previewOnly: true,
    },
    {
      id: "not-sendable",
      label: "Not sendable",
      tone: "locked",
      reviewOnly: true,
      previewOnly: true,
    },
  ];
}

function row(rowId, label, value, extra = {}) {
  return {
    rowId,
    label,
    value: normalizeText(value) || "REQUIRES_HUMAN_REVIEW",
    reviewRequired: true,
    previewOnly: true,
    reviewOnly: true,
    ...makeSafeBoundary(extra),
  };
}

function buildSummaryRows(packet, copy) {
  return [
    row("packet", "Packet", packet.packetType || "UNKNOWN_PACKET"),
    row("command", "Command", packet.sourceCommand || "/Index"),
    row("entity", "Primary entity", packet.primaryEntity || "REQUIRES_HUMAN_REVIEW"),
    row("intent", "Intent", packet.intentFamily || "universal_index_search"),
    row("summary", "Review summary", packet.reviewSummary || `${copy.title} requires human review.`),
  ];
}

function buildFactRows(packet) {
  const facts = asArray(packet.extractedFacts);
  if (!facts.length) {
    return [row("fact-empty", "Extracted facts", "No structured facts extracted yet")];
  }
  return facts.map((fact, index) => row(
    `fact-${String(index + 1).padStart(2, "0")}`,
    fact.factType || "fact_candidate",
    fact.value || "REQUIRES_HUMAN_REVIEW",
  ));
}

function buildActionRows(packet) {
  const actions = asArray(packet.proposedActions);
  if (!actions.length) {
    return [row("action-empty", "Proposed action", "Open review context only")];
  }
  return actions.map((action, index) => row(
    `action-${String(index + 1).padStart(2, "0")}`,
    action.actionType || "review_action",
    action.label || "Prepare review action",
    {
      actionId: action.actionId || `ALFRED_ACTION_${String(index + 1).padStart(2, "0")}`,
      executionState: "NOT_EXECUTED",
    },
  ));
}

function buildUncertaintyRows(packet) {
  const uncertainty = asArray(packet.uncertainty);
  if (!uncertainty.length) {
    return [row("uncertainty-empty", "Uncertainty", "All fields remain reviewable candidates")];
  }
  return uncertainty.map((item, index) => row(
    `uncertainty-${String(index + 1).padStart(2, "0")}`,
    "Uncertainty",
    item,
  ));
}

function buildQuestionRows(packet) {
  const questions = asArray(packet.humanReviewQuestions);
  if (!questions.length) {
    return [row("question-empty", "Human review", "Confirm the packet before any downstream preparation")];
  }
  return questions.map((item, index) => row(
    `question-${String(index + 1).padStart(2, "0")}`,
    "Review question",
    item,
  ));
}

function buildSafetyRows(packet) {
  const safety = makeSafeBoundary(packet.safety || {});
  return [
    row("previewOnly", "previewOnly", String(safety.previewOnly)),
    row("reviewOnly", "reviewOnly", String(safety.reviewOnly)),
    row("notApproved", "notApproved", String(safety.notApproved)),
    row("notSendable", "notSendable", String(safety.notSendable)),
    row("createsTruth", "createsTruth", String(safety.createsTruth)),
    row("executesRuntime", "executesRuntime", String(safety.executesRuntime)),
    row("sendsMessage", "sendsMessage", String(safety.sendsMessage)),
    row("writesCrm", "writesCrm", String(safety.writesCrm)),
    row("createsCalendarEvent", "createsCalendarEvent", String(safety.createsCalendarEvent)),
    row("audioRuntimeEnabled", "audioRuntimeEnabled", String(safety.audioRuntimeEnabled)),
    row("speechEngineEnabled", "speechEngineEnabled", String(safety.speechEngineEnabled)),
    row("providerRuntimeEnabled", "providerRuntimeEnabled", String(safety.providerRuntimeEnabled)),
    row("liveSearchEnabled", "liveSearchEnabled", String(safety.liveSearchEnabled)),
  ];
}

function buildForbiddenRows(packet) {
  const forbidden = asArray(packet.forbiddenActions);
  const rows = forbidden.length ? forbidden : [
    "send_message",
    "write_crm",
    "create_calendar_event",
    "execute_audio_runtime",
  ];
  return rows.map((item, index) => row(
    `forbidden-${String(index + 1).padStart(2, "0")}`,
    "Forbidden action",
    item,
  ));
}

function buildVoiceRows(packet) {
  const voice = packet.voice || {};
  return [
    row("voice-preview", "transcriptionPreviewOnly", String(voice.transcriptionPreviewOnly !== false)),
    row("audio-runtime", "audioRuntimeEnabled", String(false)),
    row("speech-engine", "speechEngineEnabled", String(false)),
    row("voice-review", "transcriptionRequiresReview", String(voice.transcriptionRequiresReview !== false)),
  ];
}

function section(sectionId, title, rows, extra = {}) {
  return {
    sectionId,
    title,
    visible: rows.length > 0,
    collapsedByDefault: extra.collapsedByDefault === true,
    priority: extra.priority || 50,
    rows,
    ...makeSafeBoundary(extra),
  };
}

function buildSections(packet, copy) {
  const sections = [
    section(VIEW_MODEL_SECTIONS.SUMMARY, "What Alfred understood", buildSummaryRows(packet, copy), { priority: 10 }),
    section(VIEW_MODEL_SECTIONS.FACTS, "Extracted candidates", buildFactRows(packet), { priority: 20 }),
    section(VIEW_MODEL_SECTIONS.ACTIONS, "Prepared review actions", buildActionRows(packet), { priority: 30 }),
    section(VIEW_MODEL_SECTIONS.UNCERTAINTY, "Needs confirmation", buildUncertaintyRows(packet), { priority: 40 }),
    section(VIEW_MODEL_SECTIONS.QUESTIONS, "Human review checklist", buildQuestionRows(packet), { priority: 50 }),
    section(VIEW_MODEL_SECTIONS.SAFETY, "Safety boundary", buildSafetyRows(packet), { priority: 60, collapsedByDefault: true }),
    section(VIEW_MODEL_SECTIONS.FORBIDDEN, "Disabled actions", buildForbiddenRows(packet), { priority: 70, collapsedByDefault: true }),
  ];

  if (packet.packetType === PACKET_TYPES.VOICE || packet.voice?.transcriptionPreviewOnly === true) {
    sections.push(section(
      VIEW_MODEL_SECTIONS.VOICE,
      "Voice transcription preview",
      buildVoiceRows(packet),
      { priority: 25 },
    ));
  }

  return sections.sort((left, right) => left.priority - right.priority);
}

function buildActionCards(packet) {
  const actions = asArray(packet.proposedActions);
  const normalized = actions.length ? actions : [{ actionType: "open_review_context", label: "Open review context" }];
  return normalized.map((action, index) => ({
    cardId: `ALFRED_UI_ACTION_${String(index + 1).padStart(2, "0")}`,
    actionId: action.actionId || `ALFRED_ACTION_${String(index + 1).padStart(2, "0")}`,
    actionType: action.actionType || "open_review_context",
    label: action.label || "Open review context",
    ctaLabel: "Review only",
    enabled: false,
    disabled: true,
    disabledReason: "Human confirmation is required before any provider, calendar, CRM, message, or truth action.",
    executionState: "NOT_EXECUTED",
    requiresHumanConfirmation: true,
    ...makeSafeBoundary(),
  }));
}

function buildDisabledProviderCtas() {
  return DISABLED_PROVIDER_CTAS.map((cta) => ({
    ...cta,
    enabled: false,
    disabled: true,
    executionState: "NOT_EXECUTED",
    requiresHumanConfirmation: true,
    ...makeSafeBoundary(),
  }));
}

function buildReviewCta(packet) {
  return {
    id: "open-human-review-panel",
    label: "Open human review",
    enabled: true,
    disabled: false,
    uiNavigationOnly: true,
    routeHint: `alfred/review/${packet.packetId || "packet"}`,
    executionState: "UI_NAVIGATION_ONLY",
    requiresHumanConfirmation: true,
    ...makeSafeBoundary({ notSendable: true }),
  };
}

function buildSafetyBanner(packet, copy) {
  return {
    bannerId: "alfred-review-boundary",
    tone: "warning",
    title: "Human review required",
    message: `${copy.title} is ready for review only. No message, CRM, calendar, provider, audio, live-search, approval, revenue, commission, payout, or truth action has been executed.`,
    flags: makeSafeBoundary(packet.safety || {}),
    ...makeSafeBoundary(),
  };
}

function buildAlfredReviewActionPacketUiViewModel(input, options = {}) {
  const packet = options.packet
    ? cloneJson(options.packet)
    : buildAlfredReviewActionPacket(input, options.packetOptions || options);
  return buildUiViewModelFromPacket(packet, options.uiOptions || {});
}

function buildUiViewModelFromPacket(packet, options = {}) {
  const sourcePacket = cloneJson(packet);
  const packetType = sourcePacket.packetType || PACKET_TYPES.INDEX;
  const copy = deriveCopy(packetType);
  const sections = buildSections(sourcePacket, copy);
  const viewModelId = `ALFRED_PACKET_UI_VM_${stableHash([
    sourcePacket.packetId,
    sourcePacket.packetType,
    sourcePacket.rawInput,
    options.viewport || "any",
  ].join("|"))}`;

  return {
    viewModelId,
    source: "ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL",
    sourcePhase: "054P_ALFRED_REVIEW_ACTION_PACKET_UI_VIEW_MODEL_IMPLEMENTATION",
    sourcePacketId: sourcePacket.packetId || "UNKNOWN_PACKET_ID",
    sourcePacketType: packetType,
    sourceCommand: sourcePacket.sourceCommand || "/Index",
    rawInput: sourcePacket.rawInput || "",
    viewport: options.viewport || "responsive",
    title: copy.title,
    subtitle: `Review ${copy.summaryNoun} for ${sourcePacket.primaryEntity || "REQUIRES_HUMAN_REVIEW"}`,
    icon: copy.icon,
    tone: copy.tone,
    primaryEntity: sourcePacket.primaryEntity || "REQUIRES_HUMAN_REVIEW",
    statusPills: buildStatusPills(sourcePacket),
    safetyBanner: buildSafetyBanner(sourcePacket, copy),
    sections,
    actionCards: buildActionCards(sourcePacket),
    reviewCta: buildReviewCta(sourcePacket),
    disabledProviderCtas: buildDisabledProviderCtas(),
    renderContract: {
      mayRenderInCommandBarDrawer: true,
      mayRenderInReviewPanel: true,
      mayRenderInMobileSheet: true,
      mayRenderInDesktopSidePanel: true,
      mayRenderVoicePreview: packetType === PACKET_TYPES.VOICE || sourcePacket.voice?.transcriptionPreviewOnly === true,
      mayRenderDisabledProviderActions: true,
      mayRequestHumanReview: true,
      mayExecuteProviderAction: false,
      mayWriteCrm: false,
      mayCreateCalendarEvent: false,
      maySendMessage: false,
      mayApproveArtifact: false,
      mayCreateTruth: false,
      mayStartAudioRuntime: false,
      mayStartSpeechEngine: false,
      mayCallLiveSearch: false,
    },
    sourcePacket,
    safety: makeSafeBoundary(sourcePacket.safety || {}),
    finalAuthority: "HUMAN",
  };
}

module.exports = {
  UI_SAFE_BOUNDARY,
  VIEW_MODEL_SECTIONS,
  PACKET_UI_COPY,
  buildAlfredReviewActionPacketUiViewModel,
  buildUiViewModelFromPacket,
};
