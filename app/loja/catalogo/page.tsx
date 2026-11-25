import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja | Fora da Pauta",
  description: "Conheça os produtos do Fora da Pauta e acompanhe a preparação da nossa loja.",
};

const camisetas = [
  { imagem: "/camiseta/modelo-discreto.svg", descricao: "Camiseta com assinatura discreta no peito" },
  { imagem: "/camiseta/modelo-centralizado.svg", descricao: "Camiseta com assinatura centralizada" },
];

const proximasCategorias = ["Bonés", "Cadernos", "Canecas", "Outros produtos"];

export default function LojaPage() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-[#171717] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-black/55">Fora da Pauta</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Loja</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/75">
          Uma maneira de apoiar a continuidade do Fora da Pauta é adquirir produtos com a nossa marca.
          As publicações continuam abertas para todos.
        </p>
        <section aria-labelledby="titulo-camisetas" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="titulo-camisetas" className="text-2xl font-bold">Camisetas</h2>
            <span className="text-sm font-medium text-black/55">Modelos em preparação</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-6">
            {camisetas.map((modelo) => (
              <figure key={modelo.imagem} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-[#fafafa]">
                <img
                  src={modelo.imagem}
                  alt={modelo.descricao}
                  width={600}
                  height={650}
                  loading="lazy"
                  className="block h-auto w-full"
                />
                <figcaption className="flex flex-1 flex-col justify-between gap-3 p-3 sm:p-4">
                  <span className="text-sm font-semibold leading-5">{modelo.descricao}</span>
                  <span className="rounded-lg bg-black/5 px-3 py-2 text-center text-sm font-medium text-black/60">
                    Em preparação
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-black/60">
            Imagens ilustrativas dos modelos. Os links de compra serão disponibilizados quando os produtos estiverem cadastrados.
          </p>
        </section>
        <section aria-labelledby="titulo-outros" className="mt-10 border-t border-black/15 pt-8">
          <h2 id="titulo-outros" className="text-2xl font-bold">Outros produtos</h2>
          <p className="mt-3 text-sm leading-6 text-black/65">
            Também estamos avaliando novas opções para a loja, conforme o catálogo e a disponibilidade do fornecedor.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {proximasCategorias.map((categoria) => (
              <div key={categoria} className="flex min-h-28 flex-col justify-between rounded-xl border border-black/10 bg-[#f7f7f7] p-4">
                <span className="font-semibold">{categoria}</span>
                <span className="mt-3 text-xs font-medium text-black/55">Em estudo</span>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-9 text-center text-sm leading-6 text-black/65">
          A loja está sendo preparada. Ainda não há compras disponíveis nesta página.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/loja" className="inline-flex min-h-12 items-center justify-center gap-2 px-7 py-3 font-semibold text-[#171717]">
            ← Loja
          </Link>
        </div>
      </div>
    </main>
  );
}
