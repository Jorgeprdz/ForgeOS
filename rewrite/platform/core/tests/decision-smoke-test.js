import { DecisionEngine } from "../decision/DecisionEngine.js";
import { DecisionContext } from "../decision/DecisionContext.js";

const engine = new DecisionEngine();

const result = engine.evaluate(
  new DecisionContext({
    facts:[
      "Forge Runtime Online"
    ]
  })
);

console.log(JSON.stringify(result,null,2));
