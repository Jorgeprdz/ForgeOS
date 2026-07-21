import { DecisionCandidate } from "./DecisionCandidate.js";
export class DecisionEvaluator{
  evaluate(matches=[]){
    return matches.map(m=>new DecisionCandidate({
      outcome:m.result.outcome,
      confidence:1,
      evidence:[m.rule.id]
    }));
  }
}
