import { Action } from "./Action.js";
import { ActionPlan } from "./ActionPlan.js";
import { ActionValidator } from "./ActionValidator.js";

export class ActionPlanner{
  constructor(){
    this.validator=new ActionValidator();
  }

  build(decision,policyResults=[]){
    const denied=policyResults.some(r=>!r.allow);

    const actions=this.validator.validate([
      denied
      ? new Action({id:"deny",type:"reject",payload:{reason:"policy"}})
      : new Action({id:"continue",type:"execute",payload:{outcome:decision.outcome}})
    ]);

    return new ActionPlan(actions);
  }
}
