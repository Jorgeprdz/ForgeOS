"use strict";

const crypto = require("crypto");

const {
  buildDomRendererFromDomSurfaceBinding,
} = require("./alfred-review-action-packet-static-preview-dom-renderer");

const STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_TARGETS = Object.freeze({
  FORGE_ALIVE_STATIC_PREVIEW: "FORGE_ALIVE_STATIC_PREVIEW",
});

const STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES = Object.freeze({
  INERT_STATIC_PREVIEW_INTEGRATION_PLAN: "INERT_STATIC_PREVIEW_INTEGRATION_PLAN",
});

const STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY = Object.freeze({
  previewOnly: true,
  reviewOnly: true,
  notApproved: true,
  notSendable: true,
  staticPreviewOnly: true,
  inertIntegrationOnly: true,
  createsTruth: false,
  executesRuntime: false,
  sendsMessage: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
  providerRuntimeEnabled: false,
  liveSearchEnabled: false,
  eventListenersEnabled: false,
  browserStorageEnabled: false,
  networkCallsAllowed: false,
  htmlCssJsMutationAllowed: false,
  realDomMutationAllowed: false,
  mayExecuteProviderAction: false,
  mayWriteCrm: false,
  mayCreateCalendarEvent: false,
  mayCreateTask: false,
  maySendMessage: false,
  mayApproveArtifact: false,
  mayCreateTruth: false,
  mayStartAudioRuntime: false,
  mayStartSpeechEngine: false,
  mayCallLiveSearch: false,
  mayRegisterEventListener: false,
  mayUseBrowserStorage: false,
  mayCallNetwork: false,
  mayMutateRealDom: false,
});

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function safeBoundary(extra = {}) {
  return Object.freeze({ ...STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY, ...extra });
}

function ensureRenderer(input) {
  if (input && input.domRendererId) return input;
  return buildDomRendererFromDomSurfaceBinding(input || {});
}

function buildTargetPreviewApp(options = {}) {
  return {
    targetPreviewApp: STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_TARGETS.FORGE_ALIVE_STATIC_PREVIEW,
    targetPreviewRoot: firstString(options.targetPreviewRoot, "docs/static-preview/forge-alive"),
    rootContract: "static_preview_host_only",
    mutatesMarkupFiles: false,
    mutatesStyleFiles: false,
    mutatesScriptFiles: false,
    mutatesRealDom: false,
    safety: safeBoundary(),
  };
}

function buildStaticMountPlan(renderer, targetPreviewApp) {
  return {
    mountPlanPreviewOnly: true,
    integrationMode: STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES.INERT_STATIC_PREVIEW_INTEGRATION_PLAN,
    sourceDomRendererId: renderer.domRendererId,
    targetPreviewApp: targetPreviewApp.targetPreviewApp,
    targetPreviewRoot: targetPreviewApp.targetPreviewRoot,
    noAutomaticMount: true,
    noRealDomMutation: true,
    noEventListeners: true,
    noBrowserStorage: true,
    noNetworkCalls: true,
    safety: safeBoundary({ noAutomaticMount: true }),
  };
}

function buildRendererAssetPlan(renderer) {
  return {
    assetPlanPreviewOnly: true,
    sourceRendererTarget: renderer.rendererTarget,
    carriesVirtualTree: Boolean(renderer.virtualDomPreviewTree),
    carriesMarkupPreviewRef: Boolean(renderer.sanitizedStaticMarkupPreview),
    externalAssetsAllowed: false,
    networkCallsAllowed: false,
    safety: safeBoundary(),
  };
}

function buildSafeMarkupTransport(renderer) {
  const markup = firstString(renderer.sanitizedStaticMarkupPreview);
  return {
    safeMarkupTransportPreviewOnly: true,
    transportMode: "INERT_STRING_REFERENCE",
    sourceDomRendererId: renderer.domRendererId,
    sanitizedStaticMarkupPreviewLength: markup.length,
    sanitizedStaticMarkupPreviewHash: stableHash(markup).slice(0, 16),
    mayParseIntoLiveTree: false,
    mayMutateRealDom: false,
    eventListenersEnabled: false,
    browserStorageEnabled: false,
    networkCallsAllowed: false,
    safety: safeBoundary(),
  };
}

function buildStaticSlotProjection(renderer) {
  const regions = asArray(renderer.renderRegions).map((region, index) => ({
    integrationRegionId: `integration-region-${index + 1}`,
    sourceRenderRegionId: region.renderRegionId,
    label: firstString(region.label, region.renderRegionId),
    order: Number.isFinite(region.order) ? region.order : index + 1,
  }));
  const slots = asArray(renderer.renderSlots).map((slot, index) => ({
    integrationSlotId: `integration-slot-${index + 1}`,
    sourceRenderSlotId: slot.renderSlotId,
    sourceRenderRegionId: slot.renderRegionId,
    slotType: firstString(slot.slotType, "static_preview_slot"),
    disabled: true,
    order: Number.isFinite(slot.order) ? slot.order : index + 1,
  }));
  return {
    projectionPreviewOnly: true,
    regions,
    slots,
    textItemCount: asArray(asRecord(renderer.renderText).textItems).length,
    mayCreateLiveNodes: false,
    safety: safeBoundary(),
  };
}

function buildCommandBarProjection(renderer) {
  return {
    commandBarProjectionPreviewOnly: true,
    sourceDomRendererId: renderer.domRendererId,
    localNavigationOnly: true,
    mayExecuteProviderAction: false,
    maySendMessage: false,
    mayApproveArtifact: false,
    safety: safeBoundary(),
  };
}

function buildReviewPanelProjection(renderer) {
  return {
    reviewPanelProjectionPreviewOnly: true,
    sourceReviewNavigationPlan: asRecord(renderer.renderReviewNavigationPlan),
    sourceDisabledActionPlan: asRecord(renderer.renderDisabledActionPlan),
    warningsVisibleOnly: true,
    mayApproveArtifact: false,
    createsTruth: false,
    safety: safeBoundary(),
  };
}

function buildVoicePreviewProjection(renderer) {
  return {
    voicePreviewProjectionOnly: true,
    sourceVoicePreviewPlan: asRecord(renderer.renderVoicePreviewPlan),
    transcriptionPreviewOnly: true,
    audioRuntimeEnabled: false,
    speechEngineEnabled: false,
    mayStartAudioRuntime: false,
    mayStartSpeechEngine: false,
    safety: safeBoundary({ transcriptionPreviewOnly: true }),
  };
}

function buildDisabledActionProjection(renderer) {
  const source = asRecord(renderer.renderDisabledActionPlan);
  return {
    disabledActionProjectionPreviewOnly: true,
    actions: asArray(source.actions).map((action) => ({
      actionId: firstString(action.actionId, "disabled-action"),
      label: firstString(action.label, "Disabled action"),
      disabled: true,
      mayExecuteProviderAction: false,
      mayWriteCrm: false,
      mayCreateCalendarEvent: false,
      maySendMessage: false,
      mayCreateTruth: false,
    })),
    safety: safeBoundary(),
  };
}

function buildResponsiveProjection(renderer) {
  return {
    responsiveProjectionPreviewOnly: true,
    sourceResponsivePlan: asRecord(renderer.renderResponsivePlan),
    mutatesStyleFiles: false,
    mutatesRealDom: false,
    safety: safeBoundary(),
  };
}

function buildStyleTokenProjection(renderer) {
  return {
    styleTokenProjectionPreviewOnly: true,
    sourceClassMap: asRecord(renderer.renderClassMap),
    mutatesStyleFiles: false,
    injectsStyleText: false,
    safety: safeBoundary(),
  };
}

function buildA11yProjection(renderer) {
  return {
    a11yProjectionPreviewOnly: true,
    sourceA11yMap: asRecord(renderer.renderA11yMap),
    keyboardMetadataOnly: true,
    eventListenersEnabled: false,
    safety: safeBoundary({ keyboardMetadataOnly: true }),
  };
}

function buildIntegrationBoundary(renderer) {
  return {
    sourceBoundary: asRecord(renderer.staticPreviewDomIntegrationBoundary),
    previewOnly: true,
    reviewOnly: true,
    notApproved: true,
    notSendable: true,
    noRealDomMutation: true,
    noEventListeners: true,
    noBrowserStorage: true,
    noNetworkCalls: true,
    createsTruth: false,
    executesRuntime: false,
    sendsMessage: false,
    writesCrm: false,
    createsCalendarEvent: false,
    audioRuntimeEnabled: false,
    speechEngineEnabled: false,
    providerRuntimeEnabled: false,
    liveSearchEnabled: false,
    eventListenersEnabled: false,
    browserStorageEnabled: false,
    networkCallsAllowed: false,
    mayMutateRealDom: false,
    safety: safeBoundary(),
  };
}

function buildStaticPreviewDomRendererIntegrationFromDomRenderer(input, options = {}) {
  const renderer = ensureRenderer(input);
  const targetPreviewAppContract = buildTargetPreviewApp(options);
  const staticMountPlan = buildStaticMountPlan(renderer, targetPreviewAppContract);
  const rendererAssetPlan = buildRendererAssetPlan(renderer);
  const safeMarkupTransport = buildSafeMarkupTransport(renderer);
  const staticSlotProjection = buildStaticSlotProjection(renderer);
  const commandBarProjection = buildCommandBarProjection(renderer);
  const reviewPanelProjection = buildReviewPanelProjection(renderer);
  const voicePreviewProjection = buildVoicePreviewProjection(renderer);
  const disabledActionProjection = buildDisabledActionProjection(renderer);
  const responsiveProjection = buildResponsiveProjection(renderer);
  const styleTokenProjection = buildStyleTokenProjection(renderer);
  const a11yProjection = buildA11yProjection(renderer);
  const integrationBoundary = buildIntegrationBoundary(renderer);
  const integrationId = [
    "ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION",
    stableHash({ rendererId: renderer.domRendererId, targetPreviewAppContract, staticSlotProjection }).slice(0, 14),
  ].join("_");

  return {
    integrationId,
    source: "ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION",
    sourcePhase: "055E_ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_IMPLEMENTATION",
    sourceDomRendererId: renderer.domRendererId,
    sourceDomSurfaceBindingId: renderer.sourceDomSurfaceBindingId || null,
    sourceSurfaceBindingId: renderer.sourceSurfaceBindingId || null,
    targetPreviewApp: targetPreviewAppContract.targetPreviewApp,
    targetPreviewRoot: targetPreviewAppContract.targetPreviewRoot,
    targetPreviewAppContract,
    integrationMode: STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES.INERT_STATIC_PREVIEW_INTEGRATION_PLAN,
    staticMountPlan,
    rendererAssetPlan,
    safeMarkupTransport,
    staticSlotProjection,
    commandBarProjection,
    reviewPanelProjection,
    voicePreviewProjection,
    disabledActionProjection,
    responsiveProjection,
    styleTokenProjection,
    a11yProjection,
    integrationBoundary,
    staticPreviewDomIntegrationBoundary: integrationBoundary,
    safety: safeBoundary(),
  };
}

module.exports = {
  STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY,
  STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_TARGETS,
  STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES,
  buildStaticPreviewDomRendererIntegrationFromDomRenderer,
};
