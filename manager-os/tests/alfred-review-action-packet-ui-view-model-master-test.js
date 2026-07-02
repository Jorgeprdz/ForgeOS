const assert = require("assert");
const {
  buildAlfredReviewActionPacket,
  PACKET_TYPES,
} = require("../alfred-review-action-packet-read-model");
const {
  UI_SAFE_BOUNDARY,
  VIEW_MODEL_SECTIONS,
  buildAlfredReviewActionPacketUiViewModel,
  buildUiViewModelFromPacket,
} = require("../alfred-review-action-packet-ui-view-model");

let passCount = 0;

function pass(name) {
  passCount += 1;
  console.log(`PASS ${passCount} - ${name}`);
}

function assertSafeFlags(target) {
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
}

function assertViewModelSafety(vm) {
  assertSafeFlags(vm.safety);
  assertSafeFlags(vm.safetyBanner);
  assert.equal(vm.reviewCta.enabled, true);
  assert.equal(vm.reviewCta.uiNavigationOnly, true);
  assert.equal(vm.reviewCta.executesRuntime, false);
  assert.equal(vm.renderContract.mayExecuteProviderAction, false);
  assert.equal(vm.renderContract.mayWriteCrm, false);
  assert.equal(vm.renderContract.mayCreateCalendarEvent, false);
  assert.equal(vm.renderContract.maySendMessage, false);
  assert.equal(vm.renderContract.mayApproveArtifact, false);
  assert.equal(vm.renderContract.mayCreateTruth, false);
  assert.equal(vm.renderContract.mayStartAudioRuntime, false);
  assert.equal(vm.renderContract.mayStartSpeechEngine, false);
  assert.equal(vm.renderContract.mayCallLiveSearch, false);
  vm.actionCards.forEach((action) => {
    assert.equal(action.enabled, false);
    assert.equal(action.disabled, true);
    assertSafeFlags(action);
  });
  vm.disabledProviderCtas.forEach((cta) => {
    assert.equal(cta.enabled, false);
    assert.equal(cta.disabled, true);
    assertSafeFlags(cta);
  });
  vm.sections.forEach((section) => {
    assertSafeFlags(section);
    section.rows.forEach((sectionRow) => assertSafeFlags(sectionRow));
  });
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Memoria Hoy vi a Juan. Me dijo que si le interesa retiro, pero quiere revisarlo con su esposa. Me pidio que le hable la proxima semana.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.MEMORY);
  assert.equal(vm.sourceCommand, "/Memoria");
  assert.equal(vm.primaryEntity, "Juan");
  assert.ok(vm.sections.some((section) => section.sectionId === VIEW_MODEL_SECTIONS.SUMMARY));
  assert.ok(vm.sections.some((section) => section.sectionId === VIEW_MODEL_SECTIONS.FACTS));
  assertViewModelSafety(vm);
  pass("/Memoria creates memory UI view model with review boundary");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Referido Luis Perez es referido de Giovanni Islas, compañero del trabajo.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.REFERRAL);
  assert.equal(vm.primaryEntity, "Luis Perez");
  assert.ok(vm.sections.some((section) => section.sectionId === VIEW_MODEL_SECTIONS.FACTS));
  assertViewModelSafety(vm);
  pass("/Referido creates referral UI view model without CRM write");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Agenda Tengo cita con Maria el viernes a las 11.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.CALENDAR);
  assert.equal(vm.primaryEntity, "Maria");
  assert.ok(vm.disabledProviderCtas.some((cta) => cta.id === "create-calendar-event" && cta.disabled === true));
  assert.equal(vm.sourcePacket.calendarCandidate.createsCalendarEvent, false);
  assertViewModelSafety(vm);
  pass("/Agenda renders calendar draft UI without creating event");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Crear evento con Maria el viernes a las 11 para revisar su plan de proteccion.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.CALENDAR);
  assert.equal(vm.renderContract.mayCreateCalendarEvent, false);
  assert.equal(vm.sourcePacket.calendarCandidate.createsCalendarEvent, false);
  assertViewModelSafety(vm);
  pass("/Crear evento remains disabled provider CTA in UI view model");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Cotizar Lariza y su novio retiro y Vida Mujer.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assert.equal(vm.primaryEntity, "Lariza");
  assert.ok(vm.title.includes("Product intelligence"));
  assert.equal(vm.renderContract.mayApproveArtifact, false);
  assertViewModelSafety(vm);
  pass("/Cotizar renders product intelligence review UI only");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Proyectar comision de Juan");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assert.equal(vm.sourcePacket.safety.createsTruth, false);
  assert.equal(vm.renderContract.mayCreateTruth, false);
  assertViewModelSafety(vm);
  pass("/Proyectar keeps commission and payout truth forbidden in UI");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Presentación de venta para Maria");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assert.equal(vm.renderContract.mayApproveArtifact, false);
  assertViewModelSafety(vm);
  pass("/Presentación renders sales artifact review UI only");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Mejora este mensaje Hola Juan te busco para hablar de retiro y ver cuando podemos agendar.");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.MESSAGE);
  assert.ok(vm.disabledProviderCtas.some((cta) => cta.id === "send-message" && cta.disabled === true));
  assert.equal(vm.sourcePacket.messageDraftCandidate.sendsMessage, false);
  assert.equal(vm.renderContract.maySendMessage, false);
  assertViewModelSafety(vm);
  pass("/Mejora este mensaje renders message draft UI without send");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Follow Juan retiro proxima semana");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.FOLLOW_UP);
  assert.equal(vm.sourcePacket.followUpCandidate.createsTask, false);
  assertViewModelSafety(vm);
  pass("/Follow renders follow-up review UI without task creation");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Chatbot ayudame a preparar una cita de retiro con Maria");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.CHATBOT);
  assert.equal(vm.renderContract.mayExecuteProviderAction, false);
  assertViewModelSafety(vm);
  pass("/Chatbot renders context UI without runtime execution");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Memoria Tengo cita con Maria el viernes a las 11", { packetOptions: { voiceTranscriptionPreview: true } });
  assert.equal(vm.sourcePacketType, PACKET_TYPES.VOICE);
  assert.equal(vm.renderContract.mayRenderVoicePreview, true);
  assert.ok(vm.sections.some((section) => section.sectionId === VIEW_MODEL_SECTIONS.VOICE));
  assert.equal(vm.sourcePacket.voice.audioRuntimeEnabled, false);
  assert.equal(vm.sourcePacket.voice.speechEngineEnabled, false);
  assertViewModelSafety(vm);
  pass("Voice transcription preview renders voice section without audio runtime");
}

{
  const packet = buildAlfredReviewActionPacket("/Cotizar Juan retiro");
  const before = JSON.stringify(packet);
  const vm = buildUiViewModelFromPacket(packet);
  assert.equal(JSON.stringify(packet), before);
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assertViewModelSafety(vm);
  pass("buildUiViewModelFromPacket does not mutate source packet");
}

{
  const vmA = buildAlfredReviewActionPacketUiViewModel("/Referido Luis Perez es referido de Giovanni Islas");
  const vmB = buildAlfredReviewActionPacketUiViewModel("/Referido Luis Perez es referido de Giovanni Islas");
  assert.equal(vmA.viewModelId, vmB.viewModelId);
  assert.equal(vmA.sourcePacketId, vmB.sourcePacketId);
  assertViewModelSafety(vmA);
  pass("UI view model id is deterministic for the same packet input");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("Texto libre de Alfred para buscar a Juan y retiro");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.INDEX);
  assert.equal(vm.renderContract.mayCallLiveSearch, false);
  assertViewModelSafety(vm);
  pass("Plain text renders universal index UI without live search");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Comisiones Juan");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assert.equal(vm.renderContract.mayCreateTruth, false);
  assertViewModelSafety(vm);
  pass("/Comisiones renders review UI with commission truth forbidden");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Bonos Juan");
  assert.equal(vm.sourcePacketType, PACKET_TYPES.PRODUCT);
  assert.equal(vm.renderContract.mayCreateTruth, false);
  assertViewModelSafety(vm);
  pass("/Bonos renders review UI with bonus truth forbidden");
}

{
  assert.equal(UI_SAFE_BOUNDARY.previewOnly, true);
  assert.equal(UI_SAFE_BOUNDARY.reviewOnly, true);
  assert.equal(UI_SAFE_BOUNDARY.providerRuntimeEnabled, false);
  assert.equal(UI_SAFE_BOUNDARY.liveSearchEnabled, false);
  pass("UI safe boundary exposes provider/runtime/live-search locks");
}

{
  const vm = buildAlfredReviewActionPacketUiViewModel("/Memoria Hoy vi a Juan retiro");
  const labels = vm.statusPills.map((pill) => pill.label);
  assert.ok(labels.includes("Preview only"));
  assert.ok(labels.includes("Human review required"));
  assert.ok(labels.includes("Not approved"));
  assert.ok(labels.includes("Not sendable"));
  pass("Status pills surface review-only state");
}

{
  const serialized = JSON.stringify(buildAlfredReviewActionPacketUiViewModel("/Cotizar Juan retiro"));
  const dangerousFields = [
    "createsTruth",
    "executesRuntime",
    "sendsMessage",
    "writesCrm",
    "createsCalendarEvent",
    "audioRuntimeEnabled",
    "speechEngineEnabled",
    "providerRuntimeEnabled",
    "liveSearchEnabled",
  ];
  dangerousFields.forEach((field) => {
    assert.equal(serialized.includes(`"${field}":true`), false);
  });
  pass("Serialized UI view model contains no forbidden true execution flags");
}

console.log(`Alfred Review Action Packet UI View Model PASS ${passCount}/18`);
