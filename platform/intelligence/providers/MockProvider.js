import { BaseProvider } from "./BaseProvider.js";

export class MockProvider extends BaseProvider {

  constructor() {
    super("mock");
  }

  async generate(providerRequest) {

    return {
      provider: this.name,
      output: `Mock response: ${providerRequest.prompt}`,
      contextReceived: !!providerRequest.context
    };

  }

}
