import Image from "next/image";
import Link from "next/link";

import { campaigns } from "@/data/campanhas";
import styles from "./page.module.css";

function formatPublicationDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export default function Home() {
  // A edição 6x1 já estava publicada na home original.
  // As demais entram somente quando tiverem data editorial de publicação.
  const publicacoes = campaigns
    .filter((campaign) => campaign.slug !== "fim-escala-6x1" && campaign.publishedAt)
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
          <h1 id="home-titulo">Como o jogo é jogado</h1>
          <p className={styles.heroLead}>
            Política, poder, decisões e comunicação que afetam a sua vida.
          </p>
          <a
            href="https://t.me/ForaDaPautaAcompanhaBot?start=projeto"
            className={styles.primaryLink}
          >
            Acompanhe pelo Telegram <span aria-hidden="true">→</span>
          </a>
        </section>

        <section
          id="edicoes"
          className={styles.section}
          aria-labelledby="edicoes-titulo"
        >
          <div className={styles.sectionHeading}>
            <h2 id="edicoes-titulo">Edições</h2>
          </div>

          <article className={styles.cardWrapper}>
            <Link href="/votou-fique-de-olho" className={styles.card}>
              <div className={styles.cardMeta}>Edição</div>
              <h3>Votou? Fique de olho.</h3>
              <p>Acompanhe a atuação dos eleitos.</p>
              <span className={styles.cardAction}>
                Abrir edição <span aria-hidden="true">→</span>
              </span>
            </Link>
          </article>

          <article className={styles.cardWrapper}>
            <Link href="/campanhas/fim-escala-6x1" className={styles.card}>
              <div className={styles.cardMeta}>Edição</div>
              <h3>Fim da escala 6x1</h3>
              <p>
                A proposta é trocar a escala 6x1 pela 5x2, sem redução de salário.
                Veja o que muda e quem apoia essa mudança.
              </p>
              <span className={styles.cardAction}>
                Abrir edição <span aria-hidden="true">→</span>
              </span>
            </Link>
          </article>

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
        </section>

        <footer className={styles.footer}>
          <p>Fora da Pauta</p>
        </footer>
      </div>
    </main>
  );
}
