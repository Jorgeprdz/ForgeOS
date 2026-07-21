import { ContextBuilder } from "../cognition/context/ContextBuilder.js";
import { InferenceEngine } from "../cognition/inference/InferenceEngine.js";
import { WorkingMemory } from "../cognition/memory/WorkingMemory.js";
console.log(JSON.stringify({
 context:new ContextBuilder(),
 inference:new InferenceEngine(),
 memory:new WorkingMemory()
},null,2));
