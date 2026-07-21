export class IntelligenceRequest {
  constructor({
    source,
    user,
    context = {},
    message,
    metadata = {}
  } = {}) {
    Object.assign(this, {
      source,
      user,
      context,
      message,
      metadata
    });

    Object.freeze(this);
  }
}
