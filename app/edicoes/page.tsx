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
        <h1 className="text-2xl font-bold">Novas análises em preparação</h1>
        <p className="mt-5 text-base leading-7">
          O Fora da Pauta investiga o que existe por trás dos acontecimentos,
          apresenta fontes e explica como as decisões afetam a vida das pessoas.
          As novas análises aparecerão aqui quando houver fatos que justifiquem
          uma investigação.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">
            Fechar
          </Link>
        </div>
      </section>
    </main>
  );
}
