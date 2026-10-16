import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
export const previewPath='/recruitment-hub/preview/';
const root=fileURLToPath(new URL('../../',import.meta.url));
const allowed=['/recruitment-hub/preview/','/recruitment-hub/src/adapters/','/recruitment-hub/src/evidence/','/recruitment-hub/src/generated/'];
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function startPreview({port=4317}={}) {
  const server=createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    try {
      if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
      const raw=decodeURIComponent((req.url||'').split('?')[0]);
      if(raw==='/'||raw==='/recruitment-hub/preview'){res.writeHead(302,{Location:previewPath});res.end();return;}
      if(raw.includes('..')||raw.includes('\\')||!allowed.some(prefix=>raw.startsWith(prefix))){res.writeHead(404);res.end('Not available');return;}
      const file=resolve(root,'.'+raw+(raw.endsWith('/')?'index.html':''));
      const data=await readFile(file);res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.writeHead(200);res.end(req.method==='HEAD'?undefined:data);
    }catch{res.writeHead(404);res.end('Not available');}
  });
  return new Promise((resolveStart,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolveStart(server));});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const server=await startPreview();console.log('Preview local: http://127.0.0.1:'+server.address().port+previewPath);}
