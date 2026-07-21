export class IntelligenceRouter {
  constructor(registry) {
    this.registry = registry;
  }

  async resolve({ request }) {
    const intent = request?.metadata?.intent;

    if (intent && this.registry.get(intent)) {
      return this.registry.get(intent);
    }

    return this.registry.get("default");
  }
}
