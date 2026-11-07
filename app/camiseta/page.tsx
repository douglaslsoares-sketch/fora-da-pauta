import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camiseta Fora da Pauta",
  description: "Conheça a camiseta oficial do Fora da Pauta e acesse a loja Montink para comprar.",
};

export default function CamisetaPage() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Camiseta Fora da Pauta</h1>
        <figure className="mx-auto mt-8 max-w-xl">
          <img src="/camiseta/montagem-camiseta-fora-da-pauta.webp" alt="Montagem ilustrativa da camiseta Fora da Pauta: homem e mulher usando, vista das costas e detalhe da estampa Há mais para entender." width="400" height="267" loading="lazy" className="block h-auto w-full rounded-xl" />
          <figcaption className="mt-3 text-center text-sm text-black/60">Montagem ilustrativa da camiseta Fora da Pauta.</figcaption>
        </figure>
        <p className="mt-5 text-center text-base leading-7">A compra da camiseta ajuda a financiar e manter o projeto.</p>
        <a href="https://montink.com/fora-da-pauta/camiseta-fora-da-pauta-3p5n3" target="_blank" rel="noopener noreferrer" className="mx-auto mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#FFD700] px-5 py-3 text-center text-lg font-bold text-black transition hover:bg-[#ebc700]">Comprar camiseta</a>
      </div>
    </main>
  );
}
