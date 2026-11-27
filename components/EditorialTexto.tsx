import type { ReactNode } from "react";

function inline(texto:string):ReactNode[]{
  const partes=texto.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\+\+[^+\n]+\+\+|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/g);
  return partes.map((p,i)=>{
    const link=p.match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if(link)return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{link[1]}</a>;
    if(p.startsWith("**")&&p.endsWith("**")&&p.length>4)return <strong key={i}>{p.slice(2,-2)}</strong>;
    if(p.startsWith("*")&&p.endsWith("*")&&p.length>2)return <em key={i}>{p.slice(1,-1)}</em>;
    if(p.startsWith("++")&&p.endsWith("++")&&p.length>4)return <u key={i}>{p.slice(2,-2)}</u>;
    return p;
  });
}
export default function EditorialTexto({texto}:{texto:string}){
  return <div className="space-y-5 break-words">{texto.replace(/\r\n/g,"\n").split(/\n\s*\n/).filter(p=>p.trim()).map((p,i)=>{
    const linhas=p.split("\n");
    if(linhas.length===1){
      const h=p.match(/^#{1,3}\s+(.+)$/);
      if(h)return <h2 key={i} className="mt-7 text-xl font-bold leading-snug">{inline(h[1])}</h2>;
      if(/^\*\*[^*\n]+\*\*$/.test(p.trim()))return <h2 key={i} className="mt-7 text-xl font-bold leading-snug">{inline(p.trim())}</h2>;
    }
    if(linhas.every(l=>/^[-•] +/.test(l)))return <ul key={i} className="list-disc space-y-1 pl-6">{linhas.map((l,j)=><li key={j}>{inline(l.replace(/^[-•] +/,""))}</li>)}</ul>;
    if(linhas.every(l=>/^\d+\. +/.test(l)))return <ol key={i} className="list-decimal space-y-1 pl-6">{linhas.map((l,j)=><li key={j}>{inline(l.replace(/^\d+\. +/,""))}</li>)}</ol>;
    return <p key={i} className="whitespace-pre-line">{inline(p)}</p>;
  })}</div>;
}
