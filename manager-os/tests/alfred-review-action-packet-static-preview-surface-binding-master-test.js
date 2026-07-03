"use strict";

const assert = require("node:assert/strict");

const staticPreviewModule = require("../alfred-review-action-packet-static-preview-binding");
const surfaceModule = require("../alfred-review-action-packet-static-preview-surface-binding");

const buildAlfredStaticPreviewBinding = staticPreviewModule.buildAlfredStaticPreviewBinding;
const buildAlfredStaticPreviewSurfaceBinding = surfaceModule.buildAlfredStaticPreviewSurfaceBinding;
const buildSurfaceBindingFromStaticPreviewBinding = surfaceModule.buildSurfaceBindingFromStaticPreviewBinding;
const SURFACE_SAFE_BOUNDARY = surfaceModule.SURFACE_SAFE_BOUNDARY;
const SURFACE_TARGETS = surfaceModule.SURFACE_TARGETS;
const SURFACE_STATES = surfaceModule.SURFACE_STATES;
const SURFACE_REGIONS = surfaceModule.SURFACE_REGIONS;

let passed = 0;
function pass(message) {
  passed += 1;
  console.log(`PASS ${passed} - ${message}`);
}

function assertSafeBoundary(target) {
  assert.equal(target.previewOnly, true);
  assert.equal(target.reviewOnly, true);
  assert.equal(target.notApproved, true);
  assert.equal(target.notSendable, true);
  assert.equal(target.createsTruth, false);
  assert.equal(target.executesRuntime, false);
  assert.equal(target.sendsMessage, false);
  assert.equal(target.writesCrm, false);
  assert.equal(target.createsCalendarEvent, false);
  assert.equal(target.audioRuntimeEnabled, false);
  assert.equal(target.speechEngineEnabled, false);
  assert.equal(target.providerRuntimeEnabled, false);
  assert.equal(target.liveSearchEnabled, false);
  assert.equal(target.domRuntimeEnabled, false);
  assert.equal(target.uiImplementationEnabled, false);
}

function assertSurfaceSafe(surface) {
  assert.equal(surface.source, "ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING");
  assert.equal(surface.sourcePhase, "054V_ALFRED_REVIEW_ACTION_PACKET_STATIC_PREVIEW_SURFACE_BINDING_IMPLEMENTATION");
  assert.equal(surface.finalAuthority, "HUMAN");
  assertSafeBoundary(surface.safety);
  assert.equal(surface.mountPolicy.domMountAllowed, false);
  assert.equal(surface.mountPolicy.executesRuntime, false);
  assert.equal(surface.interactionPolicy.uiNavigationOnly, true);
  assert.equal(surface.interactionPolicy.providerActionsDisabled, true);
  assert.equal(surface.interactionPolicy.mayExecuteProviderAction, false);
  assert.equal(surface.interactionPolicy.maySendMessage, false);
  assert.equal(surface.interactionPolicy.mayCreateCalendarEvent, false);
  assert.equal(surface.interactionPolicy.mayWriteCrm, false);
  assert.equal(surface.interactionPolicy.mayCreateTruth, false);
  assert.equal(surface.reviewNavigationPolicy.uiNavigationOnly, true);
  assert.equal(surface.reviewNavigationPolicy.executesRuntime, false);
  assert.equal(surface.renderBoundary.mayRenderDom, false);
  assert.equal(surface.renderBoundary.mayMutateDom, false);
  assert.equal(surface.renderBoundary.mayAttachEventListeners, false);
  assert.equal(surface.renderBoundary.mayCallLiveSearch, false);
  assert.equal(surface.textIndexBinding.liveSearchEnabled, false);
  assert.ok(Array.isArray(surface.slotBindings));
  surface.slotBindings.forEach((binding) => {
    assert.equal(binding.staticOnly, true);
    assert.equal(binding.rendererNeutral, true);
    assert.equal(binding.interactive, false);
    assert.equal(binding.emitsEvents, false);
    assert.equal(binding.mutatesDom, false);
    assert.equal(binding.mutatesState, false);
  });
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Memoria Hoy vi a Juan. Me dijo que si le interesa retiro, pero quiere revisarlo con su esposa. Me pidio que le hable la proxima semana.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourceCommand, "/Memoria");
  assert.equal(surface.sourcePacketType, "MEMORY_REVIEW_PACKET");
  assert.ok(surface.surfaceRegions.header);
  assert.ok(surface.surfaceRegions.body);
  pass("/Memoria creates static preview surface binding with review boundary");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Referido Luis Perez es referido de Giovanni Islas, compañero del trabajo.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "REFERRAL_CAPTURE_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.crmWriteDisabled, true);
  assert.equal(surface.interactionPolicy.mayWriteCrm, false);
  pass("/Referido creates static referral surface without CRM write");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Agenda Tengo cita con Maria el viernes a las 11.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "CALENDAR_EVENT_DRAFT_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.calendarCreateDisabled, true);
  assert.equal(surface.interactionPolicy.mayCreateCalendarEvent, false);
  pass("/Agenda creates static calendar draft surface without event creation");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Crear evento con Maria el viernes a las 11 para revisar su plan de proteccion.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "CALENDAR_EVENT_DRAFT_REVIEW_PACKET");
  assert.ok(surface.disabledActionPolicy.disabledProviderCtas.some((cta) => cta.disabled === true));
  assert.equal(surface.renderBoundary.mayCreateCalendarEvent, false);
  pass("/Crear evento remains disabled provider action in static surface");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Cotizar Lariza y su novio retiro y Vida Mujer.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "PRODUCT_INTELLIGENCE_REVIEW_PACKET");
  assert.equal(surface.renderBoundary.mayApproveArtifact, false);
  pass("/Cotizar creates product intelligence static surface only");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Proyectar comision de Juan");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "PRODUCT_INTELLIGENCE_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.mayCreateTruth, false);
  assert.equal(surface.sourceStaticPreviewBinding.safety.createsTruth, false);
  pass("/Proyectar keeps compensation and payout truth forbidden in static surface");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Presentación de venta para Maria");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "PRODUCT_INTELLIGENCE_REVIEW_PACKET");
  assert.equal(surface.renderBoundary.mayApproveArtifact, false);
  pass("/Presentación creates sales artifact static surface only");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Mejora este mensaje Hola Juan te busco para hablar de retiro y ver cuando podemos agendar.");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "MESSAGE_DRAFT_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.sendDisabled, true);
  assert.equal(surface.interactionPolicy.maySendMessage, false);
  pass("/Mejora este mensaje creates static draft surface without send");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Follow Juan retiro proxima semana");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "FOLLOW_UP_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.createsTask, false);
  pass("/Follow creates static follow-up surface without task creation");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Chatbot ayudame a preparar una cita de retiro con Maria");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "CHATBOT_CONTEXT_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.executesRuntime, false);
  pass("/Chatbot creates static context surface without runtime execution");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("Juan retiro proxima semana");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "UNIVERSAL_INDEX_REVIEW_PACKET");
  assert.equal(surface.textIndexBinding.liveSearchEnabled, false);
  pass("Plain text creates static universal index surface without live search");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Memoria Tengo cita con Maria el viernes a las 11", {
    staticPreviewOptions: { packetOptions: { voiceTranscriptionPreview: true } },
  });
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "VOICE_TRANSCRIPTION_REVIEW_PACKET");
  assert.equal(surface.surfaceState, SURFACE_STATES.VOICE_PREVIEW_ONLY);
  assert.equal(surface.voiceSurfacePolicy.visible, true);
  assert.equal(surface.voiceSurfacePolicy.audioRuntimeEnabled, false);
  assert.equal(surface.voiceSurfacePolicy.speechEngineEnabled, false);
  assert.ok(surface.surfaceRegions.voice);
  pass("Voice transcription preview creates static voice surface without audio runtime");
}

{
  const source = buildAlfredStaticPreviewBinding("/Cotizar Juan retiro");
  const before = JSON.stringify(source);
  buildSurfaceBindingFromStaticPreviewBinding(source);
  assert.equal(JSON.stringify(source), before);
  pass("buildSurfaceBindingFromStaticPreviewBinding does not mutate source static preview binding");
}

{
  const surfaceA = buildAlfredStaticPreviewSurfaceBinding("/Referido Luis Perez es referido de Giovanni Islas");
  const surfaceB = buildAlfredStaticPreviewSurfaceBinding("/Referido Luis Perez es referido de Giovanni Islas");
  assert.equal(surfaceA.surfaceBindingId, surfaceB.surfaceBindingId);
  pass("Static preview surface binding id is deterministic for the same input");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Memoria Hoy vi a Juan retiro");
  const regionIds = surface.slotBindings.map((binding) => binding.regionId);
  assert.ok(regionIds.includes(SURFACE_REGIONS.HEADER));
  assert.ok(regionIds.includes(SURFACE_REGIONS.BODY));
  assert.ok(regionIds.includes(SURFACE_REGIONS.ACTIONS));
  assert.ok(regionIds.includes(SURFACE_REGIONS.REVIEW));
  assert.ok(regionIds.includes(SURFACE_REGIONS.RENDER_BOUNDARY));
  pass("Surface regions map static preview slots into ordered regions");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Crear evento con Maria el viernes a las 11");
  assert.ok(surface.disabledActionPolicy.disabledProviderCtas.length > 0);
  surface.disabledActionPolicy.disabledProviderCtas.forEach((cta) => {
    assert.equal(cta.disabled, true);
    assert.equal(cta.executesRuntime, false);
    assert.equal(cta.createsTruth, false);
  });
  pass("Disabled provider CTAs stay disabled in static surface binding");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Memoria Hoy vi a Juan retiro", {
    surfaceOptions: { surfaceTarget: SURFACE_TARGETS.ALFRED_REVIEW_PANEL_SURFACE },
  });
  assert.equal(surface.surfaceTarget, SURFACE_TARGETS.ALFRED_REVIEW_PANEL_SURFACE);
  assert.equal(surface.reviewNavigationPolicy.canOpenLocalReviewPanel, true);
  assert.equal(surface.reviewNavigationPolicy.uiNavigationOnly, true);
  assert.equal(surface.reviewNavigationPolicy.executesRuntime, false);
  pass("Review navigation policy is local UI navigation only");
}

{
  assertSafeBoundary(SURFACE_SAFE_BOUNDARY);
  assert.equal(SURFACE_SAFE_BOUNDARY.surfaceBindingOnly, true);
  assert.equal(SURFACE_SAFE_BOUNDARY.rendererNeutral, true);
  assert.equal(SURFACE_SAFE_BOUNDARY.eventListenersEnabled, false);
  assert.equal(SURFACE_SAFE_BOUNDARY.browserStorageEnabled, false);
  pass("Static surface safe boundary exposes renderer-neutral locks");
}

{
  const surface = buildAlfredStaticPreviewSurfaceBinding("/Bonos de Juan");
  assertSurfaceSafe(surface);
  assert.equal(surface.sourcePacketType, "PRODUCT_INTELLIGENCE_REVIEW_PACKET");
  assert.equal(surface.interactionPolicy.mayCreateTruth, false);
  pass("/Bonos remains static product surface without truth creation");
}

{
  const serialized = JSON.stringify(buildAlfredStaticPreviewSurfaceBinding("/Cotizar Juan retiro"));
  [
    "createsTruth",
    "executesRuntime",
    "sendsMessage",
    "writesCrm",
    "createsCalendarEvent",
    "audioRuntimeEnabled",
    "speechEngineEnabled",
    "providerRuntimeEnabled",
    "liveSearchEnabled",
    "domRuntimeEnabled",
    "eventListenersEnabled",
    "browserStorageEnabled",
    "htmlCssJsMutationAllowed",
    "localApiEnabled",
    "mayExecuteProviderAction",
    "mayWriteCrm",
    "mayCreateCalendarEvent",
    "maySendMessage",
    "mayApproveArtifact",
    "mayCreateTruth",
    "mayStartAudioRuntime",
    "mayStartSpeechEngine",
    "mayCallLiveSearch",
  ].forEach((flag) => {
    assert.equal(serialized.includes(`\"${flag}\":true`), false, `${flag} must not be true`);
  });
  pass("Serialized static surface binding contains no forbidden true execution flags");
}

console.log(`Alfred Review Action Packet Static Preview Surface Binding PASS ${passed}/20`);
