"use strict";

const staticPreviewModule = require("./alfred-review-action-packet-static-preview-binding");

const buildAlfredStaticPreviewBinding = staticPreviewModule.buildAlfredStaticPreviewBinding;
const buildStaticPreviewBindingFromUiViewModel = staticPreviewModule.buildStaticPreviewBindingFromUiViewModel;
const STATIC_PREVIEW_SAFE_BOUNDARY = staticPreviewModule.STATIC_PREVIEW_SAFE_BOUNDARY || {};

const BASE_SURFACE_SAFE_BOUNDARY = Object.freeze({
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
  createsRevenue: false,
  createsCompensation: false,
  createsPayoutTruth: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
  providerRuntimeEnabled: false,
  liveSearchEnabled: false,
  domRuntimeEnabled: false,
  uiImplementationEnabled: false,
  browserStorageEnabled: false,
  eventListenersEnabled: false,
  htmlCssJsMutationAllowed: false,
  localApiEnabled: false,
  staticPreviewOnly: true,
  surfaceBindingOnly: true,
  rendererNeutral: true,
  requiresHumanConfirmation: true,
});

const SURFACE_SAFE_BOUNDARY = Object.freeze({
  ...STATIC_PREVIEW_SAFE_BOUNDARY,
  ...BASE_SURFACE_SAFE_BOUNDARY,
});

const SURFACE_TARGETS = Object.freeze({
  FORGE_ALIVE_STATIC_PREVIEW_SURFACE: "FORGE_ALIVE_STATIC_PREVIEW_SURFACE",
  ALFRED_COMMAND_DRAWER_SURFACE: "ALFRED_COMMAND_DRAWER_SURFACE",
  ALFRED_REVIEW_PANEL_SURFACE: "ALFRED_REVIEW_PANEL_SURFACE",
  ALFRED_MOBILE_BOTTOM_SHEET_SURFACE: "ALFRED_MOBILE_BOTTOM_SHEET_SURFACE",
  ALFRED_DESKTOP_SIDE_PANEL_SURFACE: "ALFRED_DESKTOP_SIDE_PANEL_SURFACE",
});

const SURFACE_STATES = Object.freeze({
  IDLE: "SURFACE_IDLE",
  PREVIEW_READY: "SURFACE_PREVIEW_READY",
  NEEDS_CLARIFICATION: "SURFACE_NEEDS_CLARIFICATION",
  REVIEW_ONLY: "SURFACE_REVIEW_ONLY",
  BLOCKED_PROVIDER_ACTION: "SURFACE_BLOCKED_PROVIDER_ACTION",
  VOICE_PREVIEW_ONLY: "SURFACE_VOICE_PREVIEW_ONLY",
  RENDER_LOCKED: "SURFACE_RENDER_LOCKED",
});

const SURFACE_REGIONS = Object.freeze({
  HEADER: "surface.header",
  STATUS: "surface.status",
  SAFETY: "surface.safety",
  BODY: "surface.body",
  ACTIONS: "surface.actions",
  REVIEW: "surface.review",
  DISABLED_PROVIDERS: "surface.disabledProviders",
  VOICE: "surface.voice",
  RENDER_BOUNDARY: "surface.renderBoundary",
});

const REGION_ORDER = Object.freeze({
  [SURFACE_REGIONS.HEADER]: 10,
  [SURFACE_REGIONS.STATUS]: 20,
  [SURFACE_REGIONS.SAFETY]: 30,
  [SURFACE_REGIONS.BODY]: 40,
  [SURFACE_REGIONS.ACTIONS]: 50,
  [SURFACE_REGIONS.REVIEW]: 60,
  [SURFACE_REGIONS.DISABLED_PROVIDERS]: 70,
  [SURFACE_REGIONS.RENDER_BOUNDARY]: 80,
  [SURFACE_REGIONS.VOICE]: 90,
});

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function stableHash(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function makeSafeBoundary(extra = {}) {
  return {
    ...SURFACE_SAFE_BOUNDARY,
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
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false,
    audioRuntimeEnabled: false,
    speechEngineEnabled: false,
    providerRuntimeEnabled: false,
    liveSearchEnabled: false,
    domRuntimeEnabled: false,
    uiImplementationEnabled: false,
    browserStorageEnabled: false,
    eventListenersEnabled: false,
    htmlCssJsMutationAllowed: false,
    localApiEnabled: false,
    staticPreviewOnly: true,
    surfaceBindingOnly: true,
    rendererNeutral: true,
    requiresHumanConfirmation: true,
  };
}

function normalizeSurfaceTarget(value) {
  if (value && Object.values(SURFACE_TARGETS).includes(value)) return value;
  return SURFACE_TARGETS.FORGE_ALIVE_STATIC_PREVIEW_SURFACE;
}

function getBindings(staticPreviewBinding) {
  return staticPreviewBinding.bindings || {};
}

function getDisabledProviderCtas(staticPreviewBinding) {
  const bindings = getBindings(staticPreviewBinding);
  const direct = bindings.disabledProviderCtasBinding?.payload?.disabledProviderCtas;
  return Array.isArray(direct) ? direct : [];
}

function getActionCards(staticPreviewBinding) {
  const bindings = getBindings(staticPreviewBinding);
  const direct = bindings.actionCardsBinding?.payload?.actionCards;
  return Array.isArray(direct) ? direct : [];
}

function hasUncertainty(staticPreviewBinding) {
  const sourcePacket = staticPreviewBinding.sourcePacket || staticPreviewBinding.sourceStaticPreviewBinding?.sourcePacket || {};
  const uncertainty = sourcePacket.uncertainty;
  if (Array.isArray(uncertainty)) return uncertainty.length > 0;
  if (isObject(uncertainty)) return Object.keys(uncertainty).length > 0;
  return false;
}

function hasVoicePreview(staticPreviewBinding) {
  const bindings = getBindings(staticPreviewBinding);
  return Boolean(bindings.voicePreviewBinding) || staticPreviewBinding.packetType === "VOICE_TRANSCRIPTION_REVIEW_PACKET";
}

function resolveSurfaceState(staticPreviewBinding) {
  const tree = staticPreviewBinding.staticPreview?.previewTree || [];
  if (!Array.isArray(tree) || tree.length === 0) return SURFACE_STATES.IDLE;
  if (hasVoicePreview(staticPreviewBinding)) return SURFACE_STATES.VOICE_PREVIEW_ONLY;
  if (hasUncertainty(staticPreviewBinding)) return SURFACE_STATES.NEEDS_CLARIFICATION;
  const disabled = getDisabledProviderCtas(staticPreviewBinding);
  if (disabled.some((cta) => cta.disabled === true)) return SURFACE_STATES.REVIEW_ONLY;
  return SURFACE_STATES.PREVIEW_READY;
}

function makeSurfaceRegion(regionId, slotBinding, options = {}) {
  const payload = slotBinding ? clone(slotBinding.payload || {}) : {};
  const bindingId = slotBinding?.bindingId || ["missing", regionId].join("-");
  return {
    regionId,
    bindingId: ["alfred-surface-region", regionId.replace(/[^a-zA-Z0-9]+/g, "-"), stableHash({ regionId, bindingId }).slice(0, 10)].join("-"),
    sourceSlotBindingId: bindingId,
    sourceSlotId: slotBinding?.slotId || null,
    label: slotBinding?.label || options.label || regionId,
    order: REGION_ORDER[regionId] || 999,
    visible: options.visible !== false,
    staticOnly: true,
    rendererNeutral: true,
    interactive: false,
    emitsEvents: false,
    mutatesDom: false,
    mutatesState: false,
    payload,
    safety: makeSafeBoundary(options.safety || {}),
  };
}

function buildSurfaceRegions(staticPreviewBinding) {
  const bindings = getBindings(staticPreviewBinding);
  const regions = {
    header: makeSurfaceRegion(SURFACE_REGIONS.HEADER, bindings.headerBinding),
    status: makeSurfaceRegion(SURFACE_REGIONS.STATUS, bindings.statusPillsBinding),
    safety: makeSurfaceRegion(SURFACE_REGIONS.SAFETY, bindings.safetyBannerBinding),
    body: makeSurfaceRegion(SURFACE_REGIONS.BODY, bindings.sectionsBinding),
    actions: makeSurfaceRegion(SURFACE_REGIONS.ACTIONS, bindings.actionCardsBinding),
    review: makeSurfaceRegion(SURFACE_REGIONS.REVIEW, bindings.reviewCtaBinding, { safety: { uiNavigationOnly: true } }),
    disabledProviders: makeSurfaceRegion(SURFACE_REGIONS.DISABLED_PROVIDERS, bindings.disabledProviderCtasBinding),
    renderBoundary: makeSurfaceRegion(SURFACE_REGIONS.RENDER_BOUNDARY, bindings.renderContractBinding),
  };
  if (bindings.voicePreviewBinding) {
    regions.voice = makeSurfaceRegion(SURFACE_REGIONS.VOICE, bindings.voicePreviewBinding, {
      safety: {
        transcriptionPreviewOnly: true,
        audioRuntimeEnabled: false,
        speechEngineEnabled: false,
      },
    });
  }
  return regions;
}

function buildSlotBindings(surfaceRegions) {
  return Object.keys(surfaceRegions)
    .map((key) => surfaceRegions[key])
    .sort((left, right) => left.order - right.order)
    .map((region) => ({
      regionId: region.regionId,
      surfaceRegionBindingId: region.bindingId,
      sourceSlotBindingId: region.sourceSlotBindingId,
      sourceSlotId: region.sourceSlotId,
      order: region.order,
      staticOnly: true,
      rendererNeutral: true,
      interactive: false,
      emitsEvents: false,
      mutatesDom: false,
      mutatesState: false,
      safety: makeSafeBoundary(),
    }));
}

function buildMountPolicy(surfaceTarget, options = {}) {
  return {
    surfaceTarget,
    mountMode: options.surfaceMode || "STATIC_PREVIEW_SURFACE_PAYLOAD",
    mountAllowed: true,
    domMountAllowed: false,
    htmlCssJsMutationAllowed: false,
    eventListenersEnabled: false,
    browserStorageEnabled: false,
    localApiEnabled: false,
    staticOnly: true,
    rendererNeutral: true,
    requiresRendererAdapter: true,
    executesRuntime: false,
    createsTruth: false,
    safety: makeSafeBoundary(),
  };
}

function buildInteractionPolicy() {
  return {
    canOpenLocalReviewPanel: true,
    uiNavigationOnly: true,
    requiresHumanReview: true,
    providerActionsDisabled: true,
    sendDisabled: true,
    calendarCreateDisabled: true,
    crmWriteDisabled: true,
    taskCreateDisabled: true,
    audioRuntimeDisabled: true,
    speechEngineDisabled: true,
    liveSearchDisabled: true,
    approvalDisabled: true,
    sendsMessage: false,
    createsCalendarEvent: false,
    writesCrm: false,
    createsTask: false,
    executesRuntime: false,
    createsTruth: false,
    mayExecuteProviderAction: false,
    mayWriteCrm: false,
    mayCreateCalendarEvent: false,
    maySendMessage: false,
    mayApproveArtifact: false,
    mayCreateTruth: false,
    mayStartAudioRuntime: false,
    mayStartSpeechEngine: false,
    mayCallLiveSearch: false,
    safety: makeSafeBoundary(),
  };
}

function buildDisabledActionPolicy(staticPreviewBinding) {
  const disabledProviderCtas = getDisabledProviderCtas(staticPreviewBinding).map((cta) => ({
    ...clone(cta),
    disabled: true,
    staticOnly: true,
    reason: cta.reason || "Provider action is blocked until explicit human approval and future execution-gate scope.",
    executesRuntime: false,
    sendsMessage: false,
    writesCrm: false,
    createsCalendarEvent: false,
    createsTask: false,
    createsTruth: false,
  }));
  const disabledActionCards = getActionCards(staticPreviewBinding).map((card) => ({
    ...clone(card),
    disabled: true,
    staticOnly: true,
    reviewOnly: true,
    executesRuntime: false,
    sendsMessage: false,
    writesCrm: false,
    createsCalendarEvent: false,
    createsTask: false,
    createsTruth: false,
  }));
  return {
    disabledProviderCtas,
    disabledActionCards,
    providerActionsDisabled: true,
    sendDisabled: true,
    calendarCreateDisabled: true,
    crmWriteDisabled: true,
    approvalDisabled: true,
    audioRuntimeDisabled: true,
    speechEngineDisabled: true,
    liveSearchDisabled: true,
    safety: makeSafeBoundary(),
  };
}

function buildVoiceSurfacePolicy(staticPreviewBinding) {
  const voice = getBindings(staticPreviewBinding).voicePreviewBinding;
  const enabled = Boolean(voice) || staticPreviewBinding.packetType === "VOICE_TRANSCRIPTION_REVIEW_PACKET";
  return {
    visible: enabled,
    transcriptionPreviewOnly: true,
    mayDisplayTranscript: enabled,
    mayRecordAudio: false,
    mayRequestMicPermission: false,
    mayStoreAudioBlob: false,
    mayInvokeSpeechEngine: false,
    audioRuntimeEnabled: false,
    speechEngineEnabled: false,
    providerRuntimeEnabled: false,
    rawTranscriptPreview: enabled ? (voice?.payload?.rawTranscriptPreview || staticPreviewBinding.sourceCommand || "") : "",
    safety: makeSafeBoundary({ transcriptionPreviewOnly: true }),
  };
}

function buildResponsivePolicy(surfaceTarget) {
  return {
    surfaceTarget,
    allowedTargets: Object.values(SURFACE_TARGETS),
    mobileBottomSheetAllowed: true,
    desktopSidePanelAllowed: true,
    commandDrawerAllowed: true,
    staticPreviewSurfaceAllowed: true,
    rendererNeutral: true,
    cssMutationAllowed: false,
    jsMutationAllowed: false,
    domRuntimeEnabled: false,
    safety: makeSafeBoundary(),
  };
}

function buildEmptyStatePolicy() {
  return {
    emptyStateAllowed: true,
    label: "No Alfred preview selected",
    staticOnly: true,
    executesRuntime: false,
    liveSearchEnabled: false,
    providerRuntimeEnabled: false,
    safety: makeSafeBoundary(),
  };
}

function buildBlockedStatePolicy(staticPreviewBinding) {
  const disabled = getDisabledProviderCtas(staticPreviewBinding);
  return {
    blockedProviderActionCount: disabled.length,
    blockedProviderActions: disabled.map((cta) => ({
      id: cta.id || cta.actionId || cta.label || "blocked-provider-action",
      label: cta.label || cta.id || "Blocked provider action",
      disabled: true,
      executesRuntime: false,
    })),
    state: disabled.length > 0 ? SURFACE_STATES.REVIEW_ONLY : SURFACE_STATES.PREVIEW_READY,
    safety: makeSafeBoundary(),
  };
}

function buildReviewNavigationPolicy(staticPreviewBinding) {
  return {
    canOpenLocalReviewPanel: true,
    uiNavigationOnly: true,
    routeHint: "alfred/review/static-preview-surface",
    sourceCommand: staticPreviewBinding.sourceCommand || null,
    sourcePacketType: staticPreviewBinding.packetType || null,
    requiresHumanReview: true,
    executesRuntime: false,
    sendsMessage: false,
    writesCrm: false,
    createsCalendarEvent: false,
    createsTruth: false,
    safety: makeSafeBoundary({ uiNavigationOnly: true }),
  };
}

function buildRenderBoundary(staticPreviewBinding) {
  const renderContract = staticPreviewBinding.renderContract || {};
  return {
    ...clone(renderContract),
    staticPreviewOnly: true,
    surfaceBindingOnly: true,
    rendererNeutral: true,
    mayRenderStaticPreview: true,
    mayRenderSurfacePayload: true,
    mayRenderDom: false,
    mayMutateDom: false,
    mayAttachEventListeners: false,
    mayUseBrowserStorage: false,
    mayCallLocalApi: false,
    mayExecuteProviderAction: false,
    mayWriteCrm: false,
    mayCreateCalendarEvent: false,
    maySendMessage: false,
    mayApproveArtifact: false,
    mayCreateTruth: false,
    mayStartAudioRuntime: false,
    mayStartSpeechEngine: false,
    mayCallLiveSearch: false,
    safety: makeSafeBoundary(),
  };
}

function buildTextIndexBinding(staticPreviewBinding) {
  const items = Array.isArray(staticPreviewBinding.staticPreview?.textIndex)
    ? clone(staticPreviewBinding.staticPreview.textIndex)
    : [];
  return {
    bindingId: ["alfred-surface-text-index", stableHash(items).slice(0, 12)].join("-"),
    itemCount: items.length,
    items,
    searchablePreviewOnly: true,
    liveSearchEnabled: false,
    providerRuntimeEnabled: false,
    executesRuntime: false,
    safety: makeSafeBoundary(),
  };
}

function buildSurfaceBindingFromStaticPreviewBinding(staticPreviewBinding, options = {}) {
  if (!isObject(staticPreviewBinding)) {
    throw new TypeError("staticPreviewBinding must be an object");
  }

  const preview = clone(staticPreviewBinding);
  const surfaceTarget = normalizeSurfaceTarget(options.surfaceTarget);
  const surfaceMode = options.surfaceMode || "STATIC_PREVIEW_SURFACE_PAYLOAD";
  const surfaceRegions = buildSurfaceRegions(preview);
  const surfaceState = resolveSurfaceState(preview);
  const slotBindings = buildSlotBindings(surfaceRegions);
  const sourceStaticPreviewBindingId = preview.previewId || preview.staticPreviewBindingId || stableHash(preview);
  const sourcePacketType = preview.packetType || preview.sourcePacket?.packetType || "UNKNOWN_PACKET_TYPE";
  const sourceCommand = preview.sourceCommand || preview.sourcePacket?.sourceCommand || "plain_text";

  const surfaceBindingId = [
    "alfred-static-surface",
    stableHash({ sourceStaticPreviewBindingId, surfaceTarget, surfaceMode, slotBindings }).slice(0, 14),
  ].join("-");

  const safety = makeSafeBoundary(preview.safety || {});

  return {
    surfaceBindingId,
    source: "ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING",
    sourcePhase: "054V_ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING_IMPLEMENTATION",
    sourceStaticPreviewBindingId,
    sourceCommand,
    sourcePacketType,
    surfaceTarget,
    surfaceMode,
    surfaceState,
    mountPolicy: buildMountPolicy(surfaceTarget, { surfaceMode }),
    surfaceRegions,
    slotBindings,
    textIndexBinding: buildTextIndexBinding(preview),
    interactionPolicy: buildInteractionPolicy(),
    disabledActionPolicy: buildDisabledActionPolicy(preview),
    voiceSurfacePolicy: buildVoiceSurfacePolicy(preview),
    responsivePolicy: buildResponsivePolicy(surfaceTarget),
    emptyStatePolicy: buildEmptyStatePolicy(),
    blockedStatePolicy: buildBlockedStatePolicy(preview),
    reviewNavigationPolicy: buildReviewNavigationPolicy(preview),
    renderBoundary: buildRenderBoundary(preview),
    sourceStaticPreviewBinding: preview,
    safety,
    finalAuthority: "HUMAN",
  };
}

function buildAlfredStaticPreviewSurfaceBinding(input, options = {}) {
  let staticPreviewBinding;
  if (options.staticPreviewBinding) {
    staticPreviewBinding = options.staticPreviewBinding;
  } else if (options.uiViewModel) {
    staticPreviewBinding = buildStaticPreviewBindingFromUiViewModel(options.uiViewModel, options.staticPreviewOptions || {});
  } else {
    staticPreviewBinding = buildAlfredStaticPreviewBinding(input, options.staticPreviewOptions || {});
  }
  return buildSurfaceBindingFromStaticPreviewBinding(staticPreviewBinding, options.surfaceOptions || options);
}

module.exports = {
  SURFACE_SAFE_BOUNDARY,
  SURFACE_TARGETS,
  SURFACE_STATES,
  SURFACE_REGIONS,
  buildAlfredStaticPreviewSurfaceBinding,
  buildSurfaceBindingFromStaticPreviewBinding,
  stableHash,
};
