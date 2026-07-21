export class DecisionContext {

  constructor({
    facts = [],
    rules = [],
    inputs = {},
    metadata = {}
  } = {}) {

    Object.assign(this,{
      facts,
      rules,
      inputs,
      metadata
    });

    Object.freeze(this);
  }

}
