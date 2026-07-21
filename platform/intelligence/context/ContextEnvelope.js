export class ContextEnvelope {
  constructor({
    session = {},
    user = {},
    request = {},
    metadata = {},
    memory = {},
    runtime = {}
  } = {}) {
    Object.assign(this, {
      session,
      user,
      request,
      metadata,
      memory,
      runtime
    });

    Object.freeze(this);
  }
}
