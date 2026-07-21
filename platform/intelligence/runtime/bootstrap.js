import { IntelligenceRegistry } from "../registry/IntelligenceRegistry.js";
import { EchoIntelligence } from "../intelligences/EchoIntelligence.js";

export const registry = new IntelligenceRegistry();

registry.register("default", new EchoIntelligence());
registry.register("echo", new EchoIntelligence());
