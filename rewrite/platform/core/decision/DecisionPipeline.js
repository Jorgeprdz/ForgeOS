import { DecisionEvaluator } from "./DecisionEvaluator.js";
import { DecisionSelector } from "./DecisionSelector.js";

export class DecisionPipeline{
  constructor(){
    this.evaluator=new DecisionEvaluator();
    this.selector=new DecisionSelector();
  }
  run(matches){
    return this.selector.select(this.evaluator.evaluate(matches));
  }
}
