import { IntelligenceResult } from "../contracts/IntelligenceResult.js";

export class ForgeIntelligenceRuntime {
  constructor({
    registry,
    router,
    contextBuilder,
    authorityGate,
    providerManager,
    actionEngine
  } = {}) {
    this.registry = registry;
    this.router = router;
    this.contextBuilder = contextBuilder;
    this.authorityGate = authorityGate;
    this.providerManager = providerManager;
    this.actionEngine = actionEngine;
  }

  async execute(request) {
    const context = await this.contextBuilder.build(request);

    const intelligence = await this.router?.resolve?.({
      request,
      context
    });

    if (!intelligence) {
      return new IntelligenceResult({
        intelligence: "runtime",
        intent: "unknown",
        confidence: 0,
        warnings: ["No intelligence resolved."]
      });
    }

    return intelligence.execute({
      request,
      context,
      runtime: this
    });
  }
}
