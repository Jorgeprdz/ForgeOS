import {Fact} from "../knowledge/Fact.js";
import {KnowledgeStore} from "../knowledge/KnowledgeStore.js";
import {FactResolver} from "../knowledge/FactResolver.js";
import {KnowledgeGraph} from "../knowledge/KnowledgeGraph.js";

const store=new KnowledgeStore();
store.put(new Fact({key:"runtime",value:"Forge Runtime Online"}));

const graph=new KnowledgeGraph();
graph.link("runtime","decision","supports");

console.log(JSON.stringify({
 fact:new FactResolver(store).resolve("runtime"),
 edges:graph.all()
},null,2));
