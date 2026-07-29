"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Renderer = require("../nash/draft-intake/nfast06-deterministic-draft-renderer.js");
const Navigation = require("../advisor-os/sales-pipeline/contact-navigation/productive-contact-navigation-boundary.js");
const UI = require("../advisor-os/sales-pipeline/productive-prospect-ui.js");

test("deterministic renderer preserves exact goals, styles and frozen contract", () => {
  const goals = {
    first_contact: "Me gustaría presentarme y conversar contigo.",
    follow_up: "Quisiera retomar nuestra conversación cuando te resulte conveniente.",
    reactivation: "Espero que estés muy bien. ¿Te gustaría retomar la conversación?",
    appointment_confirmation: "¿Te gustaría confirmar nuestra próxima conversación?",
    reschedule: "¿Te gustaría que coordinemos otro momento para conversar?",
    after_call: "Gracias por la conversación. Quedo atento a cómo prefieras continuar.",
  };
  for (const [goal, copy] of Object.entries(goals)) {
    assert.match(Renderer.draftCandidate({ fullName: "Ana" }, "brief", goal).rawText, new RegExp(copy.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")));
  }
  const suffixes = { brief: "", friendly: " Será un gusto saludarte.", social: " Cuando puedas, escríbeme por aquí.", executive: " Quedo atento para coordinar el siguiente paso.", professional: " Quedo atento a tu respuesta." };
  for (const [style, suffix] of Object.entries(suffixes)) assert.ok(Renderer.draftCandidate({ fullName: "Ana" }, style).rawText.endsWith(suffix));
  assert.equal(Renderer.draftCandidate({ fullName: "Ana" }, "unknown", "unknown").rawText, Renderer.draftCandidate({ fullName: "Ana" }).rawText);
  assert.equal(Renderer.draftCandidate({}).rawText, "");
  const candidate = Renderer.draftCandidate({ fullName: "Ana" }, "brief", "first_contact", 7);
  assert.equal(candidate.variation, 7);
  assert.equal(candidate.sendsMessage, false);
  assert.equal(candidate.generationMode, "deterministic_fallback");
  assert.equal(Object.isFrozen(candidate), true);
});

test("contact navigation preserves routing, validation and URL-only behavior", () => {
  const prospect = { fullName: "Ana", phone: "+521111111111", whatsapp: "+522222222222" };
  assert.equal(Navigation.contactPhone(prospect, "call"), "+521111111111");
  assert.equal(Navigation.contactPhone(prospect, "whatsapp"), "+522222222222");
  assert.equal(Navigation.contactPhone({ phone: "5512345678" }), null);
  assert.equal(Navigation.contactPhone({ phone: "+123" }), null);
  assert.equal(Navigation.contactPhone({ phone: `+${"1".repeat(16)}` }), null);
  assert.equal(Navigation.whatsappUrl(prospect, "brief", "Hola mundo"), "https://wa.me/522222222222?text=Hola%20mundo");
  assert.match(Navigation.whatsappUrl(prospect, "brief"), /Me%20gustar%C3%ADa/);
  assert.equal(Navigation.whatsappUrl({}, "brief"), null);
  assert.equal(Navigation.whatsappUrl({ phone: "+521111111111", fullName: "" }, "brief"), null);
  const source = fs.readFileSync("advisor-os/sales-pipeline/contact-navigation/productive-contact-navigation-boundary.js", "utf8");
  assert.doesNotMatch(source, /window\.open|\.click\(|location\s*=/);
});

test("legacy UI re-exports canonical identities without duplicates", () => {
  assert.equal(UI.draftCandidate, Renderer.draftCandidate);
  assert.equal(UI.contactPhone, Navigation.contactPhone);
  assert.equal(UI.whatsappUrl, Navigation.whatsappUrl);
  const source = fs.readFileSync("advisor-os/sales-pipeline/productive-prospect-ui.js", "utf8");
  for (const name of ["draftCandidate", "contactPhone", "whatsappUrl"]) assert.doesNotMatch(source, new RegExp(`function\\s+${name}\\s*\\(`));
});
