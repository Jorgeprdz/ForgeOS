export class RuleMatch{
 constructor(rule,result){
  this.rule=rule;
  this.result=result;
  Object.freeze(this);
 }
}
