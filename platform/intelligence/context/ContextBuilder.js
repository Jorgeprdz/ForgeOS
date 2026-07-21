import { ContextEnvelope } from "./ContextEnvelope.js";

export class ContextBuilder {
  async build(request) {
    return new ContextEnvelope({
      session: {},
      user: request?.user ?? {},
      request,
      metadata: request?.metadata ?? {},
      memory: {},
      runtime: {
        timestamp: Date.now()
      }
    });
  }
}
