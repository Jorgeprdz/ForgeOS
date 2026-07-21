export class RuleRegistry{
 constructor(){this.rules=[];}
 register(rule){this.rules.push(rule);this.rules.sort((a,b)=>a.priority-b.priority);}
 all(){return [...this.rules];}
}
