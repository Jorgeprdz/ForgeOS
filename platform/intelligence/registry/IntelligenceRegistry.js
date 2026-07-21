export class IntelligenceRegistry {
  constructor() {
    this.intelligences = new Map();
  }

  register(name, intelligence) {
    this.intelligences.set(name, intelligence);
    return this;
  }

  get(name) {
    return this.intelligences.get(name);
  }

  list() {
    return [...this.intelligences.keys()];
  }
}
