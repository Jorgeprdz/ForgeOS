import { ActionPlanner } from "../actions/ActionPlanner.js";

const planner=new ActionPlanner();

console.log(JSON.stringify(
 planner.build(
   {outcome:"runtime-online"},
   [{allow:true}]
 ),
 null,2
));
