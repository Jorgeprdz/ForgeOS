"use strict";

(function productiveContactNavigationBoundaryModule(root, factory) {
  const renderer = typeof module !== "undefined" && module.exports
    ? require("../../../nash/draft-intake/nfast06-deterministic-draft-renderer.js")
    : root.ForgeDeterministicDraftRendererNFAST06;
  if (!renderer) throw new Error("NFAST_06_DETERMINISTIC_DRAFT_RENDERER_REQUIRED");
  const api = factory(renderer);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeProductiveContactNavigationBoundary067G17B = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (renderer) {
  function contactPhone(prospect = {}, channel = "call") {
    const values = channel === "whatsapp"
      ? [prospect.whatsapp, prospect.whatsappNormalized, prospect.phone, prospect.phoneNormalized]
      : [prospect.phone, prospect.phoneNormalized, prospect.whatsapp, prospect.whatsappNormalized];
    for (const value of values) {
      const raw = String(value || "").trim();
      const digits = raw.replace(/\D/g, "");
      if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
    }
    return null;
  }

  function whatsappUrl(prospect, style, editedText, goal = "first_contact") {
    const phone = contactPhone(prospect, "whatsapp");
    const text = editedText ?? renderer.draftCandidate(prospect, style, goal).rawText;
    return phone && text ? `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(text)}` : null;
  }

  return Object.freeze({ contactPhone, whatsappUrl });
});
