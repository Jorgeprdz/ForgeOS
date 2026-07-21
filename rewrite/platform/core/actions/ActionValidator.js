export class ActionValidator{
  validate(actions=[]){
    return actions.filter(a=>a && a.type);
  }
}
