import assert from "node:assert/strict";
import {
  createWhatsAppContextEnvelope,
  planWhatsAppMessage,
  renderWhatsAppBaseMessage,
  validateHumanizedMessage,
} from "../platform/communications/whatsapp-context-humanizer.js";

const baseInput = {
  person: { name: "Andrea López", source: "COMMERCIAL_PERSON", confirmed: true },
  referral: {
    referrerName: "Gabo",
    reason: "podría servirle revisar la protección de su negocio y su familia",
    source: "REFERRAL_CONTEXT",
    confirmed: true,
    reasonConfirmed: true,
    permissionToMention: true,
  },
  advisor: {
    name: "Jorge Palacios",
    profession: "asesoría en protección financiera y seguros",
    valueStatement: "revisar riesgos personales, familiares y patrimoniales",
    source: "ADVISOR_COMMUNICATION_PROFILE",
    confirmed: true,
    valueConfirmed: true,
  },
  commercialIntent: {
    type: "primer_contacto",
    cta: "¿Te parece si tenemos una llamada breve esta semana?",
  },
};

{
  const envelope = createWhatsAppContextEnvelope(baseInput);
  assert.equal(envelope.state, "READY");
  const plan = planWhatsAppMessage(envelope);
  const message = renderWhatsAppBaseMessage(plan);
  assert.match(message.text, /Gabo me compartió tu contacto/);
  assert.match(message.text, /asesoría en protección financiera y seguros/);
  assert.match(message.text, /llamada breve esta semana/);
}

{
  const envelope = createWhatsAppContextEnvelope({
    ...baseInput,
    referral: { ...baseInput.referral, permissionToMention: false },
  });
  const message = renderWhatsAppBaseMessage(planWhatsAppMessage(envelope));
  assert.doesNotMatch(message.text, /Gabo/);
  assert.equal(envelope.state, "PARTIAL");
}

{
  const envelope = createWhatsAppContextEnvelope({ ...baseInput, advisor: { profession: "", confirmed: false } });
  assert.equal(envelope.state, "BLOCKED");
  assert.equal(planWhatsAppMessage(envelope).state, "BLOCKED");
}

{
  const base = renderWhatsAppBaseMessage(planWhatsAppMessage(createWhatsAppContextEnvelope(baseInput))).text;
  const result = validateHumanizedMessage({
    baseMessage: base,
    humanizedMessage: `${base} El producto Vida Mujer te garantiza rendimientos de 20%.`,
  });
  assert.notEqual(result.state, "PASS");
  assert.equal(result.safeText, base);
}

{
  const base = "Hola, Andrea. Me dedico a asesoría financiera. ¿Te parece si tenemos una llamada breve esta semana?";
  const result = validateHumanizedMessage({
    baseMessage: base,
    humanizedMessage: "Hola, Andrea. ¿Cómo estás? Trabajo en asesoría financiera. ¿Te parece si tenemos una llamada breve esta semana?",
  });
  assert.equal(result.state, "PASS");
}

console.log("WHATSAPP_CONTEXT_HUMANIZER_TEST=PASS");
