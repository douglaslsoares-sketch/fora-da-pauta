import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

import { formatEditionDate, getPublishedEditions } from "@/data/edicoes-publicadas";
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
  const publicacoes = getPublishedEditions().slice(0, 3);

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
          <h1 id="home-titulo">Como o jogo é jogado</h1>
          <p className={styles.heroLead}>
            Conhecer é importante. Entender como o jogo é jogado é fundamental.
          </p>
          <p className={styles.heroDescription}>
            Decisões que afetam a sua vida.
          </p>
          <p className={styles.eyebrow}>Votou? Fique de olho.</p>
          <nav className={styles.heroActions} aria-label="Comece por aqui">
            <Link href="/votou-fique-de-olho" className={styles.primaryLink}>
              Acompanhe pelo Telegram <span aria-hidden="true">→</span>
            </Link>
            <Link href="/conheca-seu-candidato" className={styles.secondaryLink}>
              Conheça seu candidato <span aria-hidden="true">→</span>
            </Link>
          </nav>
          <p className={styles.heroNote}>
            Você pode receber as novidades pelo Telegram mesmo sem escolher ninguém
            para acompanhar.
          </p>
        </section>

        {publicacoes.length > 0 ? (
        <section
          id="edicoes"
          className={styles.section}
          aria-labelledby="edicoes-titulo"
        >
          <div className={styles.sectionHeading}>
            <h2 id="edicoes-titulo">Edições</h2>
          </div>

          {publicacoes.map((campaign) => (
            <article key={campaign.slug} className={styles.cardWrapper}>
              <Link href={`/campanhas/${campaign.slug}`} className={styles.card}>
                <div className={styles.cardMeta}>
                  {campaign.publishedAt ? (
                    <time dateTime={campaign.publishedAt}>
                      {formatEditionDate(campaign.publishedAt)}
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
          <Link href="/edicoes" className={styles.allEditionsLink}>
            Ver todas as edições publicadas <span aria-hidden="true">→</span>
          </Link>
        </section>
        ) : (
          <div className={styles.editionsAccess}>
            <Link href="/edicoes" className={styles.allEditionsLink}>
              Ver todas as edições publicadas <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        <footer className={styles.footer}>
          <p>Fora da Pauta</p>
        </footer>
      </div>
    </main>
  );
}
