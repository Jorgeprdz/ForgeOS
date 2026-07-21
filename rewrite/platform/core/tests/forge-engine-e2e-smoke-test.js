import { ForgeEngine } from "../runtime/ForgeEngine.js";
import { DecisionContext } from "../decision/DecisionContext.js";

const forge=new ForgeEngine();

console.log(JSON.stringify(
 forge.run(new DecisionContext({
   facts:["Forge Runtime Online"]
 })),
 null,
 2
));
