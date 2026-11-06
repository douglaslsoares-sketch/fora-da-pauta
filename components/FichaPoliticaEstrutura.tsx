import type { ReactNode } from "react";
export function FichaPoliticaEstrutura({nome,subtitulo,fonteIdentidade,children}:{nome:string;subtitulo?:string;fonteIdentidade?:string;children:ReactNode}) {
 return <main className="min-h-screen bg-white px-5 py-10 text-black"><article className="mx-auto max-w-[760px]">
 <header className="border-b border-black/15 pb-6"><p className="mb-6 text-center text-3xl font-bold">Ficha Política</p><h1 className="text-2xl font-semibold">{nome}</h1>{subtitulo?<p className="mt-2 text-black/70">{subtitulo}</p>:null}{fonteIdentidade?<a href={fonteIdentidade} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline">Fonte de identificação ↗</a>:null}</header>
 {children}
 </article></main>;
}
