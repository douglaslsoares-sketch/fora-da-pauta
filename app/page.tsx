import Image from "next/image";
import Link from "next/link";

import { estampas } from "@/data/estampas";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <header className="mx-auto max-w-4xl text-center">
          <h1 className="text-[clamp(3.4rem,11vw,8rem)] font-semibold leading-[0.86] tracking-[-0.065em]">
            Fora da Pauta
          </h1>

          <p className="mt-7 text-lg tracking-[-0.02em] text-black/55 sm:text-xl">
            Uma mensagem por vez.
          </p>
        </header>

        <section className="mt-10 sm:mt-24">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {estampas.map((estampa) => (
              <Link
                key={estampa.id}
                href={`/campanhas/${estampa.campanhaSlug}`}
                aria-label={estampa.titulo}
                className="group block overflow-hidden rounded-[30px] bg-black transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                <div className="relative aspect-[1857/2000]">
                  <Image
                    src={estampa.imagem}
                    alt={estampa.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-black/10 pt-8 text-center sm:mt-28">
          <p className="text-sm font-medium">
            Fora da Pauta
          </p>

          <p className="mt-1 text-sm text-black/40">
            Uma mensagem por vez.
          </p>
        </footer>
      </div>
    </main>
  );
}