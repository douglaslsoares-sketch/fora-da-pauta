import Image from "next/image";
import Link from "next/link";
import { campaigns } from "@/data/campanhas";
import styles from "./page.module.css";

export default function Home() {
  const editions = [...campaigns].sort((a, b) => {
    if (a.slug === "fim-escala-6x1") return -1;
    if (b.slug === "fim-escala-6x1") return 1;
    return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
  });

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
          <p className={styles.heroLead}>Política, poder, decisões e comunicação que afetam a sua vida.</p>
          <Link href="/votou-fique-de-olho" className={styles.primaryLink}>
            Acompanhe pelo Telegram <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section id="edicoes" className={styles.section} aria-labelledby="edicoes-titulo">
          <h2 id="edicoes-titulo">Edições</h2>
          <div className={styles.editionList}>
            <Link href="/votou-fique-de-olho" className={styles.edition}>
              <span className={styles.editionTitle}>Votou? Fique de olho.</span>
              <span className={styles.editionDescription}>Acompanhe a atuação dos eleitos.</span>
              <span className={styles.editionArrow} aria-hidden="true">→</span>
            </Link>
            {editions.map((edition) => (
              <Link key={edition.slug} href={`/campanhas/${edition.slug}`} className={styles.edition}>
                <span className={styles.editionTitle}>{edition.title}</span>
                <span className={styles.editionDescription}>{edition.statement}</span>
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
