import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VotouFiqueDeOlhoExperience } from "@/components/VotouFiqueDeOlhoExperience";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Votou? Fique de olho.",
  description: "Escolha quem você quer acompanhar no Fora da Pauta.",
  robots: { index: false, follow: false },
};

export default function VotouFiqueDeOlhoPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            aria-label="Fora da Pauta — página inicial"
            className={styles.brandLink}
          >
            <Image
              src="/marca/fora-da-pauta-branca.png"
              alt="Fora da Pauta"
              width={72}
              height={72}
              priority
              className={styles.logo}
            />
          </Link>

          <p className={styles.tagline}>
            há mais para entender.
          </p>
        </div>
      </header>

      <main>
        <section aria-labelledby="fique-conteudos" className="bg-[#eeeee9] text-[#151515]">
          <div className="mx-auto max-w-[760px] px-6 pb-7 pt-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55">
              Fique de Olho · Matérias
            </p>
            <h2 id="fique-conteudos" className="mt-3 text-2xl font-bold tracking-tight">
              Uma votação documentada
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-black/70">
              Veja um registro real, consulte a fonte e conheça o espaço
              para escrever ao representante.
            </p>
            <Link
              href="/conheca-seu-candidato/100002535230/votacoes/2236186-60"
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-[#FFC400] px-5 py-3 text-sm font-bold text-black hover:bg-[#e9b300]"
            >
              Abrir matéria de exemplo →
            </Link>
            <p className="mt-3 text-xs leading-5 text-black/55">
              Esta é uma matéria para demonstrar a participação.
              Não altera suas escolhas nem seus acompanhamentos no Telegram.
            </p>
          </div>
        </section>

        <section aria-labelledby="titulo-acompanhamento-3-poderes" className="bg-[#eeeee9] text-[#151515]">
          <div className="mx-auto max-w-[760px] px-6 pb-8 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55">
              Fique de Olho · Acompanhamento
            </p>
            <h2 id="titulo-acompanhamento-3-poderes" className="mt-3 text-2xl font-bold tracking-tight">
              Acompanhe os três Poderes
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-black/70">
              Encontre o acompanhamento de representantes eleitos e consulte
              a agenda do presidente e os julgamentos do STF.
            </p>
            <Link
              href="/votou-fique-de-olho/acompanhamento"
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-black px-5 py-3 text-sm font-bold text-white hover:bg-black/85"
            >
              Abrir áreas de acompanhamento →
            </Link>
          </div>
        </section>

        <VotouFiqueDeOlhoExperience />
      </main>
    </div>
  );
}
