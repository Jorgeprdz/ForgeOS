export class Evidence{
 constructor({id,description,weight=1}={}){
  Object.assign(this,{id,description,weight});
  Object.freeze(this);
 }
}
