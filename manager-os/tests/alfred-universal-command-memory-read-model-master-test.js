const assert = require("assert");
const {
  SAFE_FLAGS,
  buildAlfredReadModel,
  resolveCommand,
  extractProducts,
  extractReferral,
} = require("../alfred-universal-command-memory-read-model");

let passCount = 0;

function pass(name) {
  passCount += 1;
  console.log(`PASS ${passCount} - ${name}`);
}

function assertSafe(model) {
  assert.equal(model.safety.previewOnly, true);
  assert.equal(model.safety.reviewOnly, true);
  assert.equal(model.safety.notApproved, true);
  assert.equal(model.safety.notSendable, true);
  assert.equal(model.safety.createsTruth, false);
  assert.equal(model.safety.executesRuntime, false);
  assert.equal(model.safety.sendsMessage, false);
  assert.equal(model.safety.writesCrm, false);
  assert.equal(model.safety.createsCalendarEvent, false);
  assert.equal(model.safety.createsTask, false);
  assert.equal(model.safety.createsRevenueTruth, false);
  assert.equal(model.safety.createsCompensationTruth, false);
  assert.equal(model.safety.createsPayoutTruth, false);
  assert.equal(model.safety.audioRuntimeEnabled, false);
  assert.equal(model.safety.speechEngineEnabled, false);
  assert.equal(model.safety.memoryWriteRequiresReview, true);
  assert.equal(model.safety.calendarCreateRequiresConfirmation, true);
  assert.equal(model.safety.crmWriteRequiresConfirmation, true);
  assert.equal(model.safety.sendMessageRequiresConfirmation, true);
  assert.equal(model.safety.transcriptionPreviewOnly, true);
}

{
  const resolved = resolveCommand("/Memoria hoy vi a Juan");
  assert.equal(resolved.family, "ALFRED_MEMORY");
  assert.equal(resolved.intent, "memory_capture_prep");
  pass("/Memoria resolves to memory capture");
}

{
  const model = buildAlfredReadModel(
    "/Memoria Hoy vi a Juan. Me dijo que si le interesa retiro, pero quiere revisarlo con su esposa. Me pidio que le hable el martes.",
  );
  assert.equal(model.family, "ALFRED_MEMORY");
  assert(model.extracted.people.includes("Juan"));
  assert(model.extracted.products.includes("retiro"));
  assert(model.extracted.signals.includes("interest_signal"));
  assert(model.extracted.signals.includes("relationship_context"));
  assert(model.extracted.signals.includes("follow_up_signal"));
  assert(model.candidateActions.includes("prepare_memory_entry"));
  assert(model.candidateActions.includes("prepare_follow_up"));
  assertSafe(model);
  pass("Memory command extracts person, product, context, and follow-up");
}

{
  const referral = extractReferral("/Referido Luis Perez es referido de Giovanni Islas, compañero del trabajo.");
  assert.equal(referral.referralName, "Luis Perez");
  assert.equal(referral.sourceName, "Giovanni Islas");
  assert(referral.relationship.includes("compañero"));
  pass("Referral extraction captures referral source and relationship");
}

{
  const model = buildAlfredReadModel("/Referido Luis Perez es referido de Giovanni Islas, compañero del trabajo.");
  assert.equal(model.family, "ALFRED_REFERRAL_CAPTURE");
  assert(model.candidateActions.includes("prepare_referral_record"));
  assert(model.resultCards.some((card) => card.type === "referral_candidate"));
  assertSafe(model);
  pass("/Referido prepares referral only");
}

{
  const model = buildAlfredReadModel("/Agenda Tengo cita con Maria el viernes a las 11");
  assert.equal(model.family, "ALFRED_CALENDAR_PREP");
  assert.equal(model.extracted.calendar.day, "viernes");
  assert.equal(model.extracted.calendar.time, "11:00");
  assert(model.candidateActions.includes("prepare_calendar_event"));
  assert.equal(model.safety.createsCalendarEvent, false);
  assertSafe(model);
  pass("/Agenda prepares calendar candidate without creating event");
}

{
  const model = buildAlfredReadModel("/Crear evento con Maria el viernes a las 11");
  assert.equal(model.family, "ALFRED_CALENDAR_PREP");
  assert(model.candidateActions.includes("prepare_calendar_event"));
  assertSafe(model);
  pass("/Crear evento remains calendar prep only");
}

{
  const products = extractProducts("Lariza y su novio quieren retiro y Vida Mujer");
  assert(products.includes("retiro"));
  assert(products.includes("Vida Mujer"));
  pass("Product extraction finds retirement and Vida Mujer");
}

{
  const model = buildAlfredReadModel("/Cotizar Lariza y su novio retiro y Vida Mujer");
  assert.equal(model.family, "ALFRED_PRODUCT_INTELLIGENCE");
  assert.equal(model.intent, "quote_prep");
  assert(model.extracted.products.includes("retiro"));
  assert(model.extracted.products.includes("Vida Mujer"));
  assert(model.candidateActions.includes("prepare_product_intelligence_artifact"));
  assert(model.resultCards.some((card) => card.type === "product_intelligence_prep"));
  assertSafe(model);
  pass("/Cotizar prepares product intelligence artifact");
}

{
  const model = buildAlfredReadModel("/Proyectar comision de Juan");
  assert.equal(model.family, "ALFRED_PRODUCT_INTELLIGENCE");
  assert.equal(model.intent, "projection_prep");
  assert(model.candidateActions.includes("prepare_product_intelligence_artifact"));
  assert.equal(model.safety.createsCompensationTruth, false);
  assert.equal(model.safety.createsPayoutTruth, false);
  assertSafe(model);
  pass("/Proyectar does not create compensation or payout truth");
}

{
  const model = buildAlfredReadModel("/Presentación de venta para Maria");
  assert.equal(model.family, "ALFRED_PRODUCT_INTELLIGENCE");
  assert.equal(model.intent, "sales_presentation_prep");
  assert(model.candidateActions.includes("prepare_product_intelligence_artifact"));
  assertSafe(model);
  pass("/Presentacion prepares sales presentation only");
}

{
  const model = buildAlfredReadModel("/Mejora este mensaje Hola Juan te busco para hablar de retiro");
  assert.equal(model.family, "ALFRED_MESSAGE_DRAFT");
  assert(model.candidateActions.includes("prepare_message_draft"));
  assert.equal(model.safety.sendsMessage, false);
  assertSafe(model);
  pass("/Mejora este mensaje prepares draft without sending");
}

{
  const model = buildAlfredReadModel("/Follow Juan");
  assert.equal(model.family, "ALFRED_FOLLOW_UP_PREP");
  assert(model.candidateActions.includes("prepare_follow_up"));
  assertSafe(model);
  pass("/Follow prepares follow-up");
}

{
  const model = buildAlfredReadModel("/Juan");
  assert.equal(model.family, "ALFRED_INDEX");
  assert.equal(model.intent, "universal_index_search");
  assert(model.candidateActions.includes("search_universal_index"));
  assertSafe(model);
  pass("Unknown slash command falls back to universal index");
}

{
  const model = buildAlfredReadModel("Juan Orozco");
  assert.equal(model.family, "ALFRED_INDEX");
  assert.equal(model.intent, "universal_index_search");
  assert(model.resultCards.length >= 1);
  assertSafe(model);
  pass("Plain text falls back to universal index preview");
}

{
  const model = buildAlfredReadModel("/Chatbot necesito ayuda");
  assert.equal(model.family, "ALFRED_CHATBOT_ENTRY");
  assert.equal(model.intent, "chatbot_entry");
  assertSafe(model);
  pass("/Chatbot resolves without runtime execution");
}

{
  assert.equal(SAFE_FLAGS.audioRuntimeEnabled, false);
  assert.equal(SAFE_FLAGS.speechEngineEnabled, false);
  pass("Voice runtime flags are false");
}

{
  const model = buildAlfredReadModel("/Memoria Tengo cita con Maria el viernes a las 11");
  assert.equal(model.safety.transcriptionPreviewOnly, true);
  assert.equal(model.safety.memoryWriteRequiresReview, true);
  assert.equal(model.safety.calendarCreateRequiresConfirmation, true);
  assertSafe(model);
  pass("Voice/memory prep flags require human review");
}

{
  const serialized = JSON.stringify(buildAlfredReadModel("/Cotizar Juan retiro"));
  assert(!serialized.includes('"sendsMessage":true'));
  assert(!serialized.includes('"createsCalendarEvent":true'));
  assert(!serialized.includes('"createsTruth":true'));
  assert(!serialized.includes('"executesRuntime":true'));
  pass("Serialized read model contains no forbidden true execution flags");
}

console.log(`Alfred Universal Command Memory Read Model PASS ${passCount}/18`);
