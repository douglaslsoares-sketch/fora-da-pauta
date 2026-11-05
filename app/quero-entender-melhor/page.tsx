import type { Metadata } from "next";
import Link from "next/link";
import { PublicQuestionsExperience } from "@/components/PublicQuestionsExperience";

export const metadata: Metadata = {
  title: "Quero entender melhor — Fora da Pauta",
  description: "Envie sua dúvida. O Fora da Pauta pesquisa, verifica e publica esclarecimentos de interesse geral.",
};

export default function QueroEntenderMelhorPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-3xl font-bold">Quero entender melhor</h1>
        <p className="mt-4 text-base leading-7 text-black/75">
          Tem alguma dúvida sobre um assunto que afeta sua vida? Pergunte do seu jeito.
          Vamos analisar, pesquisar e verificar antes de publicar uma resposta.
        </p>
        <p className="mt-3 text-sm leading-6 text-black/65">
          Perguntas de interesse geral poderão ser respondidas publicamente, sem divulgar
          quem perguntou. As respostas também poderão ser compartilhadas no canal geral
          do Telegram depois de revisão editorial.
        </p>
        <PublicQuestionsExperience />
        <Link href="/#opcoes" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg border border-black/20 px-5 py-3 font-semibold">
          ← Ir para o início
        </Link>
      </div>
    </main>
  );
}
