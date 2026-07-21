import { RuleRegistry } from "../rules/RuleRegistry.js";
import { RuleEngine } from "../rules/RuleEngine.js";
import { DecisionPipeline } from "../decision/DecisionPipeline.js";
import { PolicyRegistry } from "../policy/PolicyRegistry.js";
import { PolicyEngine } from "../policy/PolicyEngine.js";
import { ApprovalPolicy } from "../policy/ApprovalPolicy.js";
import { ActionPlanner } from "../actions/ActionPlanner.js";

export class ForgeEngine{
  constructor(){
    this.ruleRegistry=new RuleRegistry();
    this.policyRegistry=new PolicyRegistry();

    this.ruleRegistry.register({
      id:"runtime-online",
      priority:100,
      when:c=>c.facts.includes("Forge Runtime Online"),
      then:()=>({outcome:"runtime-online"})
    });

    this.policyRegistry.register(ApprovalPolicy);

    this.ruleEngine=new RuleEngine(this.ruleRegistry);
    this.pipeline=new DecisionPipeline();
    this.policyEngine=new PolicyEngine(this.policyRegistry);
    this.actionPlanner=new ActionPlanner();
  }

  run(context){
    const matches=this.ruleEngine.evaluate(context);
    const decision=this.pipeline.run(matches);

    if(!decision){
      return {
        decision:null,
        policies:[],
        plan:{actions:[]}
      };
    }

    const policies=this.policyEngine.evaluate(decision);
    const plan=this.actionPlanner.build(decision,policies);

    return {decision,policies,plan};
  }
}
