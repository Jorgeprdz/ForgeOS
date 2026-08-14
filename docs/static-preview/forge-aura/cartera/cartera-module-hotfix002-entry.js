import { createCarteraModule as createHotfixModule } from './cartera-module-hotfix002.js?v=post017e-hotfix002-r2';

const STYLE_MARK='data-cartera-review-hotfix002-style';
function ensureStyle(options={}){
  const doc=options.root?.ownerDocument||document;
  if(doc.querySelector(`link[${STYLE_MARK}]`))return;
  const link=doc.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('./cartera-review-hotfix002.css?v=post017e-hotfix002',import.meta.url).href;
  link.setAttribute(STYLE_MARK,'true');
  doc.head.append(link);
}
export function createCarteraModule(options={}){ensureStyle(options);return createHotfixModule(options);}
