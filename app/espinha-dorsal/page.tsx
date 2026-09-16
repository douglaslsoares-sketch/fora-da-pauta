import type {
  Metadata,
} from "next";

import {
  getProjectTimelineEvents,
} from "@/data/espinha-dorsal-projeto";
import { HomeReadingButton } from "@/components/HomeReadingButton";

export const metadata: Metadata = {
  title:
    "Espinha Dorsal do Fora da Pauta",
  description:
    "Histórico público da construção e do funcionamento do Fora da Pauta.",
};

function dataBrasil(
  date: string,
) {
  const [
    ano,
    mes,
    dia,
  ] = date.split("-");

  return `${dia}/${mes}/${ano}`;
}

export default function EspinhaDorsalPage() {
  const eventos =
    getProjectTimelineEvents();

  return (
    <main id="espinha-dorsal-reading" data-editorial-root className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Transparência
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">
            Espinha Dorsal
            <br />
            do Fora da Pauta
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-black/65">
            Acompanhe como o projeto está sendo construído e como continuará funcionando.
            Os registros aparecem do mais recente para o mais antigo.
          </p>

          <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
            <p className="font-semibold leading-7">
              O princípio é registrar todos os acontecimentos do projeto.
            </p>
          </div>

          <p className="mt-5 text-sm leading-7 text-black/45">
            A consolidação retrospectiva dos acontecimentos anteriores
            ainda está sendo incorporada a este histórico.
          </p>

          <div className="mt-8">
            <HomeReadingButton
              rootId="espinha-dorsal-reading"
              title="Espinha Dorsal do Fora da Pauta"
              timeTone="dark"
            />
          </div>

          <div className="mt-12 border-t border-black/15">
            {eventos.map(
              (evento) => (
                <article
                  key={evento.id}
                  className="grid gap-4 border-b border-black/15 py-7 sm:grid-cols-[150px_1fr] sm:gap-8"
                >
                  <div>
                    <time className="text-sm font-semibold">
                      {dataBrasil(
                        evento.date,
                      )}
                    </time>

                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                      {evento.category}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.025em]">
                      {evento.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">
                      {evento.description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}