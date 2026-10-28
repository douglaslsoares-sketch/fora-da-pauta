import { notFound } from "next/navigation";
import Link from "next/link";
export const metadata = {
  title: "Prévia da coluna — O jogo sendo jogado",
  robots: { index: false, follow: false },
};
export default function PreviaColuna() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <div className="bg-[#f5d763] p-3 text-center text-xs font-bold">PRÉVIA EDITORIAL — NÃO PUBLICAR</div>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Fora da Pauta · Coluna permanente</p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight">O jogo sendo jogado</h1>
        <p className="mt-5 max-w-2xl text-xl leading-8">O mesmo acontecimento. Diferentes manchetes. O que muda na maneira de contar?</p>
        <section className="mt-12 border-t border-black/20 pt-8">
          <h2 className="text-2xl font-bold">O que vamos comparar?</h2>
          <p className="mt-3 leading-7 text-neutral-700">Manchetes de veículos do Brasil e do exterior sobre o mesmo acontecimento, com suas fontes, datas, países e traduções identificadas quando necessário.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="border border-black/15 bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Fonte 1</p>
              <p className="mt-3 font-semibold">Manchete ainda não selecionada</p>
              <p className="mt-2 text-sm text-neutral-600">Veículo, país, data, link original e tradução</p>
            </div>
            <div className="border border-black/15 bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Fonte 2</p>
              <p className="mt-3 font-semibold">Manchete ainda não selecionada</p>
              <p className="mt-2 text-sm text-neutral-600">Veículo, país, data, link original e tradução</p>
            </div>
          </div>
          <div className="mt-8 border-l-4 border-black pl-5">
            <h3 className="text-xl font-bold">O que mudou na maneira de contar?</h3>
            <p className="mt-2 leading-7 text-neutral-700">Aqui vamos destacar escolhas de palavras, enfoques e diferenças comprováveis, separando observações das nossas interpretações.</p>
          </div>
        </section>
        <section className="mt-14 border-t border-black/20 pt-8">
          <h2 className="text-2xl font-bold">Artigos relacionados</h2>
          <p className="mt-3 text-neutral-600">Um artigo por assunto, com fontes e opção de áudio.</p>
          <Link className="mt-5 inline-block text-lg font-semibold underline underline-offset-4" href="/previa-editorial/lula-venceu-o-globo">Lula venceu. O que O Globo disse no dia seguinte?</Link>
          <p className="mt-2 text-sm text-neutral-500">Rascunho não publicado. Link funciona apenas em desenvolvimento.</p>
        </section>
      </div>
    </main>
  );
}
