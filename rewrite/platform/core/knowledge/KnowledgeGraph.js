export class KnowledgeGraph{
 constructor(){this.edges=[];}
 link(from,to,label="related"){this.edges.push({from,to,label});}
 all(){return [...this.edges];}
}
