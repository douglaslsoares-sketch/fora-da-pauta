import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { HomeTelegramButton } from "@/components/HomeTelegramButton";

import { campaigns } from "@/data/campanhas";
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

function formatPublicationDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export default function Home() {
  // Edições ocultas da home permanecem acessíveis pelo endereço original.
  // As demais entram somente quando tiverem data editorial de publicação.
  const publicacoes = campaigns
    .filter((campaign) => campaign.slug !== "fim-escala-6x1" &&
      campaign.slug !== "seus-interesses" &&
      campaign.publishedAt)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/marca/fora-da-pauta-branca.png"
              alt="Fora da Pauta"
              width={230}
              height={166}
              priority
              className={styles.logo}
            />
            <p className={styles.tagline}>Há mais para entender.</p>
          </div>
        </header>

        <section
          id="conteudo"
          className={styles.hero}
          aria-labelledby="home-titulo"
          tabIndex={-1}
        >
          <div className={styles.featureIntro}>
            <h1 id="home-titulo" className={styles.featureSubtitle}>Do povo para o povo.</h1>
            <p className={styles.featureTitle}>Decisões que afetam a sua vida.</p>
            <p className={styles.featureBenefit}>
              Entenda o que os políticos dizem, votam e fazem e como o jogo é jogado.
            </p>
          </div>

          <HomeTelegramButton
            className={styles.primaryLink}
            textClassName={styles.primaryText}
            arrowClassName={styles.primaryArrow}
          />

        </section>

        {publicacoes.length > 0 && (
        <section
          id="edicoes"
          className={styles.section}
          aria-labelledby="edicoes-titulo"
        >
          <div className={styles.sectionHeading}>
            <h2 id="edicoes-titulo">Edições já publicadas</h2>
            <p>Leia ou ouça as edições anteriores do Fora da Pauta.</p>
          </div>

          <div className={styles.publicationGrid}>
          {publicacoes.map((campaign) => (
            <article key={campaign.slug} className={styles.cardWrapper}>
              <Link href={`/campanhas/${campaign.slug}`} className={styles.card}>
                <div className={styles.cardMeta}>
                  {campaign.publishedAt ? (
                    <time dateTime={campaign.publishedAt}>
                      {formatPublicationDate(campaign.publishedAt)}
                    </time>
                  ) : (
                    <span>Edição</span>
                  )}
                </div>
                <h3>{campaign.title}</h3>
                <p>{campaign.statement}</p>
                <span className={styles.cardAction}>
                  Abrir edição <span aria-hidden="true">→</span>
                </span>
              </Link>
            </article>
          ))}
          </div>
        </section>
        )}

        <footer className={styles.footer}>
          <p>Fora da Pauta</p>
        </footer>
      </div>
    </main>
  );
}
