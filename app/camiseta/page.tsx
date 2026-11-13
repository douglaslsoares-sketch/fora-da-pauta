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
            <figure key={modelo.imagem}>
              <img src={modelo.imagem} alt={modelo.descricao} width="600" height="650" loading="lazy" className="block h-auto w-full rounded-xl" />
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-black/60">Ilustrações dos dois modelos. As imagens finais dos produtos serão exibidas quando estiverem cadastrados na loja.</p>
        <p className="mt-6 text-center text-base leading-7">A compra das camisetas ajudará a financiar e manter o projeto Fora da Pauta.</p>
        <p className="mt-4 text-center text-sm text-black/60">Os links individuais de compra serão disponibilizados após o cadastro dos dois modelos na Montink.</p>
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 text-center font-semibold text-white hover:bg-red-700">
            <span aria-hidden="true" className="text-xl leading-none">×</span> Fechar
          </Link>
        </div>
      </div>
    </main>
  );
}
