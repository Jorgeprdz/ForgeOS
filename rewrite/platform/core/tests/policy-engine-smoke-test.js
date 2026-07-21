import { PolicyRegistry } from "../policy/PolicyRegistry.js";
import { PolicyEngine } from "../policy/PolicyEngine.js";
import { ApprovalPolicy } from "../policy/ApprovalPolicy.js";

const reg=new PolicyRegistry();
reg.register(ApprovalPolicy);

console.log(JSON.stringify(
 new PolicyEngine(reg).evaluate({confidence:1}),
 null,2
));
