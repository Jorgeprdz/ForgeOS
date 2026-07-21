export class ActionPlan{
  constructor(actions=[]){
    this.actions=[...actions];
    Object.freeze(this.actions);
    Object.freeze(this);
  }
}
