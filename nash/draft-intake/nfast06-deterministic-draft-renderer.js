"use strict";

(function nfast06DeterministicDraftRendererModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeDeterministicDraftRendererNFAST06 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const GOAL_COPY = Object.freeze({
    first_contact: "Me gustaría presentarme y conversar contigo.",
    follow_up: "Quisiera retomar nuestra conversación cuando te resulte conveniente.",
    reactivation: "Espero que estés muy bien. ¿Te gustaría retomar la conversación?",
    appointment_confirmation: "¿Te gustaría confirmar nuestra próxima conversación?",
    reschedule: "¿Te gustaría que coordinemos otro momento para conversar?",
    after_call: "Gracias por la conversación. Quedo atento a cómo prefieras continuar.",
  });
  const STYLE_SUFFIXES = Object.freeze({
    brief: "",
    friendly: " Será un gusto saludarte.",
    social: " Cuando puedas, escríbeme por aquí.",
    executive: " Quedo atento para coordinar el siguiente paso.",
    professional: " Quedo atento a tu respuesta.",
  });

  function draftCandidate(prospect, style = "professional", goal = "first_contact", variation = 0) {
    const name = String(prospect?.fullName || "").trim();
    const goalText = GOAL_COPY[goal] || GOAL_COPY.first_contact;
    const suffix = Object.prototype.hasOwnProperty.call(STYLE_SUFFIXES, style)
      ? STYLE_SUFFIXES[style]
      : STYLE_SUFFIXES.professional;
    return Object.freeze({
      rawText: name ? `Hola, ${name}. ${goalText}${suffix}` : "",
      sendsMessage: false,
      sourceMutable: false,
      generationMode: "deterministic_fallback",
      variation,
    });
  }

  return Object.freeze({ draftCandidate, GOAL_COPY, STYLE_SUFFIXES });
});
