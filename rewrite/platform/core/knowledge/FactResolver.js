export class FactResolver{
 constructor(store){this.store=store;}
 resolve(key){return this.store.get(key)??null;}
}
