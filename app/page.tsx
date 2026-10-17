import Image from "next/image";
import Link from "next/link";
import { campaigns } from "@/data/campanhas";
import styles from "./page.module.css";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export default function Home() {
  const editions = [...campaigns].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">Ir para o conteúdo</a>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" aria-label="Fora da Pauta — início" className={styles.brand}>
            <Image src="/marca/fora-da-pauta-branca.png" alt="Fora da Pauta" width={230} height={166} priority className={styles.logo} />
          </Link>
          <p className={styles.tagline}>há mais para entender.</p>
        </header>

        <section id="conteudo" className={styles.hero} aria-labelledby="titulo" tabIndex={-1}>
          <h1 id="titulo">Como o jogo é jogado</h1>
          <p className={styles.heroLead}>Política, poder, comunicação e decisões que afetam a sua vida.</p>
        </section>

        <section className={styles.telegram} aria-labelledby="telegram-titulo">
          <h2 id="telegram-titulo">Acompanhe o Fora da Pauta</h2>
          <p>Receba novidades e acompanhe a atuação de quem foi eleito pelo Telegram.</p>
          <Link href="/votou-fique-de-olho" className={styles.primaryLink}>
            Acompanhe pelo Telegram <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section id="edicoes" className={styles.section} aria-labelledby="edicoes-titulo">
          <h2 id="edicoes-titulo">Edições do Fora da Pauta</h2>
          <div className={styles.editionList}>
            <Link href="/votou-fique-de-olho" className={styles.edition}>
              <span className={styles.editionTitle}>Votou? E agora?</span>
              <span className={styles.editionDescription}>Acompanhe a atuação de quem foi eleito.</span>
              <span className={styles.editionArrow} aria-hidden="true">→</span>
            </Link>
            {editions.map((edition) => (
              <Link key={edition.slug} href={`/campanhas/${edition.slug}`} className={styles.edition}>
                <span className={styles.editionTitle}>{edition.title}</span>
                <span className={styles.editionDescription}>{edition.statement}</span>
                {edition.publishedAt && <time className={styles.editionDate} dateTime={edition.publishedAt}>{formatDate(edition.publishedAt)}</time>}
                <span className={styles.editionArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
        <footer className={styles.footer}>Fora da Pauta</footer>
      </div>
    </main>
  );
}
