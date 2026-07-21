export class Rule{
 constructor({id,name,priority=100,when=()=>false,then=()=>({})}={}){
  Object.assign(this,{id,name,priority,when,then});
  Object.freeze(this);
 }
}
