import type { ReactNode } from "react";
import Link from "next/link";
import { CabecalhoPoliticos } from "@/components/CabecalhoPoliticos";

export function PaginaPoliticos({
  titulo, children, voltarHref = "/politicos",
}: { titulo: string; children: ReactNode; voltarHref?: string }) {
  return (
    <main className="min-h-screen bg-[#071827] px-5 pb-14 pt-4 text-white">
      <section className="mx-auto w-full max-w-2xl">
        <CabecalhoPoliticos titulo={titulo} />
        {children}
        <div className="mt-9 flex justify-center">
          <Link href={voltarHref} className="inline-flex min-h-11 items-center gap-2 px-4 py-2 text-sm font-semibold text-[#ffd333] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd333]"><span aria-hidden="true">←</span> Voltar</Link>
        </div>
      </section>
    </main>
  );
}
