export class PolicyResult{
 constructor({policy,allow=true,reason=""}={}){
  Object.assign(this,{policy,allow,reason});
  Object.freeze(this);
 }
}
