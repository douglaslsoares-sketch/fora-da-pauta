import Image from "next/image";
import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Como o jogo é jogado. Decisões que afetam a sua vida.",
  openGraph: {
    title: "Fora da Pauta — Há mais para entender.",
    description: "Como o jogo é jogado. Decisões que afetam a sua vida.",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fora da Pauta — Há mais para entender.",
    description: "Como o jogo é jogado. Decisões que afetam a sua vida.",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.watermark} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.header}>
          <Image
            src="/marca/fora-da-pauta-horizontal-branco.svg"
            alt="Fora da Pauta"
            width={2325}
            height={374}
            priority
            className={styles.logo}
          />
        </header>

        <section
          className={styles.hero}
          id="conteudo"
          aria-labelledby="home-titulo"
          tabIndex={-1}
        >
          <h1 id="home-titulo" className={styles.title}>
            Há mais para entender.
          </h1>

          <div className={styles.statement}>
            <p>Como o jogo é jogado.</p>
            <p>Decisões que afetam a sua vida.</p>
          </div>

          <HomeAcessoTelegram />
        </section>
      </div>
    </main>
  );
}
