export class Fact{
 constructor({key,value,source="runtime"}={}){
  Object.assign(this,{key,value,source});
  Object.freeze(this);
 }
}
