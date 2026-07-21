export class Decision {

  constructor({
    id = crypto.randomUUID(),
    outcome = "unknown",
    confidence = 0,
    reasoning = [],
    evidence = [],
    actions = [],
    approvalRequired = false
  } = {}) {

    Object.assign(this, {
      id,
      outcome,
      confidence,
      reasoning,
      evidence,
      actions,
      approvalRequired
    });

    Object.freeze(this);
  }

}
