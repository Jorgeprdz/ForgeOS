export class Action{
  constructor({id,type,payload={},priority=100}={}){
    Object.assign(this,{id,type,payload,priority});
    Object.freeze(this);
  }
}
