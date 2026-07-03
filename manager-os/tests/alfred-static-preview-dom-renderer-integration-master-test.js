"use strict";

const assert = require("assert");

const { buildAlfredReadModel } = require("../alfred-universal-command-memory-read-model");
const { buildPacketFromAlfredReadModel } = require("../alfred-review-action-packet-read-model");
const { buildUiViewModelFromPacket } = require("../alfred-review-action-packet-ui-view-model");
const { buildStaticPreviewBindingFromUiViewModel } = require("../alfred-review-action-packet-static-preview-binding");
const { buildSurfaceBindingFromStaticPreviewBinding } = require("../alfred-review-action-packet-static-preview-surface-binding");
const { buildDomSurfaceBindingFromSurfaceBinding } = require("../alfred-review-action-packet-static-preview-dom-surface-binding");
const { buildDomRendererFromDomSurfaceBinding } = require("../alfred-review-action-packet-static-preview-dom-renderer");
const {
  STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY,
  STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES,
  buildStaticPreviewDomRendererIntegrationFromDomRenderer,
} = require("../alfred-static-preview-dom-renderer-integration");

let passCount = 0;
const expectedPasses = 20;

function pass(name) {
  passCount += 1;
  console.log(`PASS ${passCount} - ${name}`);
}

function buildIntegration(input) {
  const readModel = buildAlfredReadModel(input);
  const packet = buildPacketFromAlfredReadModel(readModel);
  const ui = buildUiViewModelFromPacket(packet);
  const staticPreview = buildStaticPreviewBindingFromUiViewModel(ui);
  const surface = buildSurfaceBindingFromStaticPreviewBinding(staticPreview);
  const domSurface = buildDomSurfaceBindingFromSurfaceBinding(surface);
  const renderer = buildDomRendererFromDomSurfaceBinding(domSurface);
  return {
    renderer,
    integration: buildStaticPreviewDomRendererIntegrationFromDomRenderer(renderer),
  };
}

function assertSafety(integration) {
  assert.equal(integration.safety.previewOnly, true);
  assert.equal(integration.safety.reviewOnly, true);
  assert.equal(integration.safety.notApproved, true);
  assert.equal(integration.safety.notSendable, true);
  assert.equal(integration.safety.createsTruth, false);
  assert.equal(integration.safety.executesRuntime, false);
  assert.equal(integration.safety.sendsMessage, false);
  assert.equal(integration.safety.writesCrm, false);
  assert.equal(integration.safety.createsCalendarEvent, false);
  assert.equal(integration.safety.audioRuntimeEnabled, false);
  assert.equal(integration.safety.speechEngineEnabled, false);
  assert.equal(integration.safety.providerRuntimeEnabled, false);
  assert.equal(integration.safety.liveSearchEnabled, false);
  assert.equal(integration.safety.eventListenersEnabled, false);
  assert.equal(integration.safety.browserStorageEnabled, false);
  assert.equal(integration.safety.networkCallsAllowed, false);
  assert.equal(integration.safety.mayMutateRealDom, false);
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.source, "ALFRED_STATIC_PREVIEW_DOM_RENDERER_INTEGRATION");
  assert.equal(integration.integrationMode, STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_MODES.INERT_STATIC_PREVIEW_INTEGRATION_PLAN);
  assertSafety(integration);
  pass("/Memoria creates inert renderer integration with review boundary");
}

{
  const { integration } = buildIntegration("/Referido Luis referido de Maria");
  assert.equal(integration.disabledActionProjection.safety.writesCrm, false);
  assert.equal(integration.safety.mayWriteCrm, false);
  pass("/Referido integration does not write CRM");
}

{
  const { integration } = buildIntegration("/Agenda cita con Maria viernes 11");
  assert.equal(integration.safety.mayCreateCalendarEvent, false);
  assert.equal(integration.integrationBoundary.createsCalendarEvent, false);
  pass("/Agenda integration does not create calendar events");
}

{
  const { integration } = buildIntegration("/Mejora este mensaje hola Maria");
  assert.equal(integration.commandBarProjection.maySendMessage, false);
  assert.equal(integration.safety.sendsMessage, false);
  pass("Message draft integration does not send");
}

{
  const { integration } = buildIntegration("/Proyectar comision de Juan");
  assert.equal(integration.reviewPanelProjection.createsTruth, false);
  assert.equal(integration.safety.mayCreateTruth, false);
  pass("Projection integration does not create compensation truth");
}

{
  const { integration } = buildIntegration("/Chatbot explica este caso");
  assert.equal(integration.safety.executesRuntime, false);
  assert.equal(integration.safety.providerRuntimeEnabled, false);
  pass("Chatbot integration does not execute runtime");
}

{
  const { integration } = buildIntegration("Juan Orozco poliza ABC");
  assert.equal(integration.safety.liveSearchEnabled, false);
  assert.equal(integration.staticMountPlan.noNetworkCalls, true);
  pass("Plain text integration does not call live search");
}

{
  const { integration } = buildIntegration("/Memoria nota dictada por voz para Juan");
  assert.equal(integration.voicePreviewProjection.transcriptionPreviewOnly, true);
  assert.equal(integration.voicePreviewProjection.audioRuntimeEnabled, false);
  assert.equal(integration.voicePreviewProjection.speechEngineEnabled, false);
  pass("Voice integration remains transcript preview only");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.targetPreviewApp, "FORGE_ALIVE_STATIC_PREVIEW");
  assert.equal(integration.targetPreviewRoot, "docs/static-preview/forge-alive");
  assert.equal(integration.targetPreviewAppContract.mutatesRealDom, false);
  pass("Target preview app is metadata only");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.staticMountPlan.noAutomaticMount, true);
  assert.equal(integration.staticMountPlan.noRealDomMutation, true);
  assert.equal(integration.staticMountPlan.noEventListeners, true);
  pass("Static mount plan is no-op preview only");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.safeMarkupTransport.transportMode, "INERT_STRING_REFERENCE");
  assert.equal(integration.safeMarkupTransport.mayParseIntoLiveTree, false);
  assert.ok(integration.safeMarkupTransport.sanitizedStaticMarkupPreviewLength > 0);
  pass("Safe markup transport carries inert reference only");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.ok(integration.staticSlotProjection.regions.length >= 1);
  assert.ok(integration.staticSlotProjection.slots.length >= 1);
  assert.equal(integration.staticSlotProjection.mayCreateLiveNodes, false);
  pass("Static slot projection maps renderer metadata");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.styleTokenProjection.mutatesStyleFiles, false);
  assert.equal(integration.styleTokenProjection.injectsStyleText, false);
  pass("Style token projection does not mutate styles");
}

{
  const { integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  assert.equal(integration.a11yProjection.keyboardMetadataOnly, true);
  assert.equal(integration.a11yProjection.eventListenersEnabled, false);
  pass("A11y projection remains metadata only");
}

{
  const { renderer, integration } = buildIntegration("/Memoria Hoy vi a Juan.");
  const before = JSON.stringify(renderer);
  buildStaticPreviewDomRendererIntegrationFromDomRenderer(renderer);
  assert.equal(JSON.stringify(renderer), before);
  assert.equal(integration.sourceDomRendererId, renderer.domRendererId);
  pass("Integration builder does not mutate source renderer");
}

{
  const a = buildIntegration("/Memoria Hoy vi a Juan.").integration;
  const b = buildIntegration("/Memoria Hoy vi a Juan.").integration;
  assert.equal(a.integrationId, b.integrationId);
  pass("Integration id is deterministic");
}

{
  const { integration } = buildIntegration("/Follow Juan ultimo contacto hace 76 dias");
  assert.equal(integration.safety.createsTask, false);
  assert.equal(integration.safety.mayCreateTask, false);
  pass("Follow integration does not create tasks");
}

{
  const { integration } = buildIntegration("/Cotizar retiro para Lariza");
  assert.equal(integration.rendererAssetPlan.externalAssetsAllowed, false);
  assert.equal(integration.rendererAssetPlan.networkCallsAllowed, false);
  pass("Renderer asset plan does not fetch external assets");
}

{
  assert.equal(STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY.eventListenersEnabled, false);
  assert.equal(STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY.browserStorageEnabled, false);
  assert.equal(STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY.networkCallsAllowed, false);
  assert.equal(STATIC_PREVIEW_DOM_RENDERER_INTEGRATION_SAFE_BOUNDARY.realDomMutationAllowed, false);
  pass("Integration safe boundary exposes browser-facing locks");
}

{
  const serialized = JSON.stringify(buildIntegration("/Comisiones Juan").integration);
  const forbiddenTrueFlags = [
    "createsTruth\":true",
    "executesRuntime\":true",
    "sendsMessage\":true",
    "writesCrm\":true",
    "createsCalendarEvent\":true",
    "audioRuntimeEnabled\":true",
    "speechEngineEnabled\":true",
    "providerRuntimeEnabled\":true",
    "liveSearchEnabled\":true",
    "eventListenersEnabled\":true",
    "browserStorageEnabled\":true",
    "networkCallsAllowed\":true",
    "mayMutateRealDom\":true",
  ];
  for (const token of forbiddenTrueFlags) assert.ok(!serialized.includes(token), token);
  const forbiddenApiTokens = [
    ["doc", "ument."],
    ["win", "dow."],
    ["query", "Selector"],
    ["inner", "HTML"],
    ["add", "Event", "Listener"],
    ["local", "Storage"],
    ["session", "Storage"],
    ["fet", "ch("],
    ["XML", "Http", "Request"],
    ["navigator", ".media", "Devices"],
    ["Speech", "Recognition"],
  ].map((parts) => parts.join(""));
  for (const token of forbiddenApiTokens) assert.ok(!serialized.includes(token), token);
  pass("Serialized integration contains no forbidden true execution flags or browser APIs");
}

assert.equal(passCount, expectedPasses);
console.log(`Alfred Static Preview DOM Renderer Integration PASS ${passCount}/${expectedPasses}`);
