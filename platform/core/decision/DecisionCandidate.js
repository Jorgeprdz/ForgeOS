export class DecisionCandidate{
  constructor({outcome,confidence=0,evidence=[],source="rules"}={}){
    Object.assign(this,{outcome,confidence,evidence,source});
    Object.freeze(this);
  }
}
