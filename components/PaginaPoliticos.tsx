import type { ReactNode } from "react";
import Link from "next/link";
import { CabecalhoPoliticos } from "@/components/CabecalhoPoliticos";

export function PaginaPoliticos({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#071827] px-5 pb-14 pt-4 text-white">
      <section className="mx-auto w-full max-w-2xl">
        <CabecalhoPoliticos titulo={titulo} />
        {children}
        <div className="mt-9 flex justify-center">
          <Link href="/politicos" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-red-600 px-9 py-3 font-bold text-white hover:bg-red-700">× Fechar</Link>
        </div>
      </section>
    </main>
  );
}
