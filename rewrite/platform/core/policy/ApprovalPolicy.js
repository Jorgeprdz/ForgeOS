import { Policy } from "./Policy.js";
export const ApprovalPolicy=new Policy({
 id:"approval-required",
 name:"Approval Required",
 priority:10,
 evaluate:(decision)=>({
   allow: decision.confidence>=1,
   reason: decision.confidence>=1?"":"Low confidence"
 })
});
