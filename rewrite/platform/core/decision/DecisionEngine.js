import { Decision } from "./Decision.js";

export class DecisionEngine {

  evaluate(context){

    return new Decision({

      outcome: "no-decision",

      confidence: 1,

      reasoning:[
        "Decision Engine initialized."
      ],

      evidence: context.facts,

      actions: [],

      approvalRequired:false

    });

  }

}
