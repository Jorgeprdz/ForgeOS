export class DecisionSelector{
  select(candidates=[]){
    return [...candidates].sort((a,b)=>b.confidence-a.confidence)[0]??null;
  }
}
