import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edições | Fora da Pauta",
  description: "As novas análises serão publicadas conforme os acontecimentos justificarem uma investigação.",
  robots: { index: false, follow: true },
};

export default function EdicoesPublicadas() {
  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-6 py-10 text-black">
      <section className="mx-auto max-w-[720px]">
        <h1 className="text-2xl font-bold">Edições</h1>
        <p className="mt-5 text-base leading-7">
          O Fora da Pauta investiga o que existe por trás dos acontecimentos,
          apresenta fontes e explica como as decisões afetam a vida das pessoas.
          As novas análises aparecerão aqui quando houver fatos que justifiquem
          uma investigação.
        </p>
        <div className="mt-7 rounded-lg border border-yellow-400 bg-yellow-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide">Teste temporário de publicação</p>
          <h2 className="mt-2 text-xl font-semibold">Fim da escala 6x1</h2>
          <p className="mt-2 text-sm leading-6">Artigo do acervo anterior, disponibilizado exclusivamente para verificar a publicação e a abertura pelo Telegram. O conteúdo não foi atualizado para a data de hoje.</p>
          <Link href="/campanhas/fim-escala-6x1" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-black px-5 py-3 font-semibold text-white">Ler artigo de teste</Link>
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">
            <span aria-hidden="true" className="text-xl leading-none">×</span>
            Fechar
          </Link>
        </div>
      </section>
    </main>
  );
}
