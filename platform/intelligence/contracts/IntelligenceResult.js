export class IntelligenceResult {
  constructor({
    version = "1.0",
    intelligence,
    intent,
    confidence = 0,
    facts = [],
    recommendations = [],
    actions = [],
    warnings = [],
    draft = null,
    humanApprovalRequired = true,
    fallbackUsed = false,
    evidenceIds = []
  } = {}) {
    Object.assign(this, {
      version,
      intelligence,
      intent,
      confidence,
      facts,
      recommendations,
      actions,
      warnings,
      draft,
      humanApprovalRequired,
      fallbackUsed,
      evidenceIds
    });

    Object.freeze(this);
  }
}
