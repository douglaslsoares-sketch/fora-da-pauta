import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camiseta Fora da Pauta",
  description: "Conheça os dois modelos de camiseta do Fora da Pauta.",
};

const modelos = [
  { imagem: "/camiseta/modelo-discreto.svg", descricao: "Estampa discreta no lado esquerdo do peito" },
  { imagem: "/camiseta/modelo-centralizado.svg", descricao: "Estampa centralizada no peito" },
];

export default function CamisetaPage() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Camiseta Fora da Pauta</h1>
        <p className="mt-3 text-base leading-7 text-black/65">Vista a ideia. Ajude a levar o Fora da Pauta mais longe.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          {modelos.map((modelo) => (
            <figure key={modelo.imagem} className="flex flex-col">
              <img src={modelo.imagem} alt={modelo.descricao} width="600" height="650" loading="lazy" className="block h-auto w-full rounded-xl" />
              <figcaption className="mt-3 text-center text-sm font-semibold">{modelo.descricao}</figcaption>
              <button type="button" disabled aria-label={`Adquirir esta camiseta: ${modelo.descricao}. Em breve`} className="mt-3 min-h-12 w-full cursor-not-allowed rounded-xl bg-yellow-400 px-2 py-3 text-sm font-bold text-black opacity-75 sm:text-base">Adquirir esta camiseta</button>
              <span className="mt-1 text-center text-xs text-black/60">Em breve</span>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-black/60">Ilustrações dos dois modelos. As fotografias finais serão exibidas aqui após sua recuperação.</p>
        <p className="mt-6 text-center text-base leading-7">A compra das camisetas ajudará a financiar e manter o projeto Fora da Pauta.</p>
        <p className="mt-4 text-center text-sm text-black/60">Os botões de compra serão ativados quando os links dos modelos estiverem disponíveis.</p>
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 text-center font-semibold text-white hover:bg-red-700">
            <span aria-hidden="true" className="text-xl leading-none">×</span> Fechar
          </Link>
        </div>
      </div>
    </main>
  );
}
