import type {
  Metadata,
} from "next";

import {
  QuestionsAdminPanel,
} from "@/components/QuestionsAdminPanel";

export const metadata: Metadata = {
  title:
    "Perguntas recebidas | Fora da Pauta",

  description:
    "Área restrita para acompanhamento e resposta das perguntas recebidas pelo Fora da Pauta.",

  robots: {
    index: false,
    follow: false,
  },
};

export default function QuestionsAdminPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] px-5 py-14 text-[#151515] sm:px-8 sm:py-20 lg:px-10">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Área restrita
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          Perguntas recebidas
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
          Aqui é possível responder às perguntas recebidas e decidir separadamente se cada resposta também será publicada na página inicial.
        </p>

        <QuestionsAdminPanel />
      </section>
    </main>
  );
}