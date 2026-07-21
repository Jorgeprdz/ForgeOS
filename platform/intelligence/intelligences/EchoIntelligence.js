import { IntelligenceResult } from "../contracts/IntelligenceResult.js";

export class EchoIntelligence {
  async execute({ request }) {
    return new IntelligenceResult({
      intelligence: "echo",
      intent: "echo",
      confidence: 1,
      facts: [],
      recommendations: [],
      actions: [],
      warnings: [],
      draft: request.message
    });
  }
}
