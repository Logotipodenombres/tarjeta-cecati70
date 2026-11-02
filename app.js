const el = id => document.getElementById(id);
const t = tarjeta;
for (const key of ["nombre","cargo","lugar","institucion"]) el(key).textContent=t[key];
for (const [key,src] of Object.entries(t.imagenes)) {
  if (!src) continue;
  const slot=el(key);
  const img=slot.tagName==="IMG"?slot:new Image();
  if (img!==slot) {img.alt=slot.textContent;slot.replaceChildren(img)}
  img.src=src; img.hidden=false;
}
function link(node,url) {
  node.href=url;
  if (url.startsWith("https:")) {node.target="_blank";node.rel="noopener noreferrer"}
}
link(el("linkedin"),t.linkedin);
link(el("llamar"),"tel:"+t.telefono);
link(el("whatsapp"),t.whatsapp);
for (const [label,url] of [
  ["Correo electrónico",t.correo && "mailto:"+t.correo],
  ["Facebook · CECATI 70",t.facebookInstitucional],
  ["Facebook personal",t.facebookPersonal],

  ["Instagram",t.instagram]
]) {
  const row=document.createElement(url?"a":"button");
  row.className="row";row.textContent=label;
  const hint=document.createElement("small");
  hint.textContent=url?"↗":"Pendiente";row.append(hint);
  if(url) link(row,url); else row.disabled=true;
  el("canales").append(row);
}
const estado=message=>el("estado").textContent=message;
const escapeVCF=value=>value.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/[,;]/g,"\\$&");
el("guardar").onclick=()=>{
  const fields=["BEGIN:VCARD","VERSION:3.0","N:"+[t.apellidos,t.nombres,"","",""].map(escapeVCF).join(";"),"FN:"+escapeVCF(t.nombre),"TITLE:"+escapeVCF(t.cargo),"ORG:"+escapeVCF(t.institucion),"TEL;TYPE=CELL:"+t.telefono];
  if(t.correo) fields.push("EMAIL:"+escapeVCF(t.correo));
  const blob=new Blob([[...fields,"END:VCARD",""].join("\r\n")],{type:"text/vcard;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Nestor-Guillen-Rodriguez.vcf";
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
  estado("Archivo de contacto preparado.");
};
function urlPublica(){
  try {const u=new URL(t.urlDefinitiva);if(u.protocol==="https:")return u.href}catch{}
  estado("El enlace estará disponible cuando se publique la tarjeta.");
}
el("compartir").onclick=async()=>{
  const url=urlPublica();if(!url)return;
  if(navigator.share)try{await navigator.share({title:t.nombre,url});return}catch(e){if(e.name==="AbortError")return}
  try{await navigator.clipboard.writeText(url);estado("Enlace copiado.")}catch{
    const input=el("copia");input.value=url;input.hidden=false;input.focus();input.select();estado("Selecciona y copia el enlace.");
  }
};
el("codigo").onclick=()=>{
  const url=urlPublica();if(!url)return;
  const canvas=el("qr");if(!canvas.hidden){canvas.hidden=true;return}
  const code=new QRCode(0,0);code.addData(url);code.make();
  const n=code.getModuleCount(),unit=8;
  canvas.width=canvas.height=(n+8)*unit;
  const ctx=canvas.getContext("2d");ctx.fillStyle="white";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="black";
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(code.isDark(y,x))ctx.fillRect((x+4)*unit,(y+4)*unit,unit,unit);
  canvas.hidden=false;estado("Escanea el código para abrir la tarjeta.");
};
const iconPaths = {
  guardar: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 11-3m4-5v8m-4-4h8"/>',
  llamar: '<path d="m7 3 3 5-2.4 2.4a15 15 0 0 0 6 6L16 14l5 3c0 3-2 5-5 4C9 19 5 15 3 8c-1-3 1-5 4-5Z"/>',
  whatsapp: '<path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.4-4.8A9 9 0 1 1 21 11.5Z"/><path d="M8 7c-2 3 4 10 8 8l-2-2-1.4.8a9 9 0 0 1-3.4-3.4L10 9Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/>',
  linkedin: '<path fill="currentColor" stroke="none" d="M3 8h4v13H3zm2-6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 5 2zm5 6h4v1.8c1-1.5 2.4-2.1 4-2.1 3 0 4 2 4 5.4V21h-4v-7.2c0-1.7-.5-2.7-1.9-2.7-1.5 0-2.1 1-2.1 2.7V21h-4z"/>',
  facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" fill="currentColor" stroke="none"/>',
  correo: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  compartir: '<circle cx="18" cy="5" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 11 7-4m-7 6 7 4"/>',
  codigo: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h4v4h-4m-3-3v3"/>'
};
function addIcon(node,key){
  const mark=document.createElement("span");
  mark.className="action-icon";
  mark.setAttribute("aria-hidden","true");
  mark.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+iconPaths[key]+'</svg>';
  node.prepend(mark);
}
el("guardar").textContent="Guardar contacto";
for(const id of ["guardar","llamar","whatsapp","compartir","codigo"]) addIcon(el(id),id);
for(const row of el("canales").children){
  const key=row.href?.includes("linkedin.com")?"linkedin":row.href?.includes("instagram.com")?"instagram":row.href?.includes("facebook.com")?"facebook":"correo";
  row.dataset.channel=key;
  addIcon(row,key);
}


