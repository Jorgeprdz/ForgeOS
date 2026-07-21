export class Policy{
 constructor({id,name="",priority=100,evaluate=()=>({allow:true})}={}){
  Object.assign(this,{id,name,priority,evaluate});
  Object.freeze(this);
 }
}
