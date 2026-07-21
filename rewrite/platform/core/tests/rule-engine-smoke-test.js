import { Rule } from "../rules/Rule.js";
import { RuleRegistry } from "../rules/RuleRegistry.js";
import { RuleEngine } from "../rules/RuleEngine.js";
import { DecisionContext } from "../decision/DecisionContext.js";
const registry=new RuleRegistry();
registry.register(new Rule({
 id:"runtime-online",
 name:"Runtime Online",
 when:c=>c.facts.includes("Forge Runtime Online"),
 then:()=>({outcome:"runtime-online"})
}));
console.log(JSON.stringify(
 new RuleEngine(registry).evaluate(
  new DecisionContext({facts:["Forge Runtime Online"]})
 ),null,2));
