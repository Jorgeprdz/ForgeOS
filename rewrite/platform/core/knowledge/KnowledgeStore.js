export class KnowledgeStore{
 constructor(){this.facts=new Map();}
 put(f){this.facts.set(f.key,f);}
 get(k){return this.facts.get(k);}
 all(){return [...this.facts.values()];}
}
