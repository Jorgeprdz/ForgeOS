const main=document.querySelector('main');
try { await import('./app.mjs'); }
catch {
  main.replaceChildren();main.setAttribute('aria-busy','false');
  const h=document.createElement('h1');h.textContent='No se pudo iniciar la demostración';
  const p=document.createElement('p');p.textContent='Comprueba que la abriste desde el servidor local y que sus módulos están disponibles. No se han conectado datos productivos.';
  main.append(h,p);
}
