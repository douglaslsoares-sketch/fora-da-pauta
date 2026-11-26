self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request),
  );
});

self.addEventListener("push", event => {
 event.waitUntil((async()=>{
  let avisos=[];
  try {
   const r=await fetch("/api/editoriais/avisos",{credentials:"same-origin",cache:"no-store"});
   if(r.ok){const d=await r.json();avisos=Array.isArray(d.avisos)?d.avisos:[];}
  }catch{}
  const a=avisos[0];
  const valido=a&&/^[0-9a-f-]{36}$/i.test(a.editorial_slug)&&/^[0-9a-f-]{36}$/i.test(a.id);
  await self.registration.showNotification("Fora da Pauta",{
   body:valido?"Novo comentário em: "+String(a.titulo).slice(0,140):"Confira os avisos de comentários no aplicativo.",
   icon:"/marca/fp-20261126?size=192",
   tag:valido?"editorial-"+a.editorial_slug:"editoriais",
   data:{url:valido?"/editoriais/"+a.editorial_slug+"#comentario-"+a.id:"/editoriais"}
  });
 })());
});
self.addEventListener("notificationclick",event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||"/editoriais",self.location.origin);
 if(target.origin!==self.location.origin)return;
 event.waitUntil((async()=>{
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  const client=clients.find(c=>c.url===target.href);
  if(client){await client.focus();return;}
  await self.clients.openWindow(target.href);
 })());
});
