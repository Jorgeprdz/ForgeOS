import { RuleMatch } from "./RuleMatch.js";
export class RuleEngine{
 constructor(registry){this.registry=registry;}
 evaluate(context){
  const matches=[];
  for(const rule of this.registry.all()){
   if(rule.when(context)) matches.push(new RuleMatch(rule,rule.then(context)));
  }
  return matches;
 }
}
