import { PolicyResult } from "./PolicyResult.js";
export class PolicyEngine{
 constructor(registry){this.registry=registry;}
 evaluate(decision){
  const results=[];
  for(const p of this.registry.all()){
    const r=p.evaluate(decision);
    results.push(new PolicyResult({policy:p.id,allow:r.allow,reason:r.reason??""}));
    if(!r.allow) break;
  }
  return results;
 }
}
