export class PolicyRegistry{
 constructor(){this.items=[];}
 register(policy){this.items.push(policy);this.items.sort((a,b)=>a.priority-b.priority);}
 all(){return [...this.items];}
}
