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
  const publications = campaigns.filter((campaign) => campaign.slug === "fim-escala-6x1");

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

          <nav className={styles.navigation} aria-label="Navegação da página inicial">
            <a href="#publicacoes">Publicações</a>
            <a href="#consultas">Consultas</a>
            
          </nav>
        </header>

        <section
          id="conteudo"
          className={styles.hero}
          aria-labelledby="acompanhamento-titulo"
          tabIndex={-1}
        >
          <p className={styles.eyebrow}>Acompanhamento</p>
          <h1 id="acompanhamento-titulo">Votou? Fique de olho.</h1>
          <p className={styles.heroLead}>Acompanhe os eleitos pelo Telegram.</p>
          <p className={styles.heroDescription}>
            Escolha quem você quer acompanhar. Quando houver novos registros
            documentados sobre a atuação de quem você escolheu, o aviso chega pelo
            Telegram.
          </p>
          <Link href="/votou-fique-de-olho" className={styles.primaryLink}>
            Escolher quem acompanhar <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section
          id="publicacoes"
          className={styles.section}
          aria-labelledby="publicacoes-titulo"
        >
          <div className={styles.sectionHeading}>
            <h2 id="publicacoes-titulo">Publicações</h2>
            <p>Entenda as propostas, consulte as fontes e tire suas conclusões.</p>
          </div>

          
            {publications.map((campaign) => (
              <article key={campaign.slug} className={styles.cardWrapper}>
                <Link href={`/campanhas/${campaign.slug}`} className={styles.card}>
                  <div className={styles.cardMeta}>
                    {campaign.publishedAt ? (
                      <time dateTime={campaign.publishedAt}>
                        {formatPublicationDate(campaign.publishedAt)}
                      </time>
                    ) : (
                      <span>Publicação</span>
                    )}
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.statement}</p>
                  <span className={styles.cardAction}>
                    Abrir publicação <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </article>
            ))}
          
        </section>

        <section
          id="consultas"
          className={styles.section}
          aria-labelledby="consultas-titulo"
        >
          <div className={styles.sectionHeading}>
            <h2 id="consultas-titulo">Consultas</h2>
            <p>Encontre candidatos e consulte seus registros públicos.</p>
          </div>

          <Link href="/conheca-seu-candidato" className={styles.card}>
            <h3>Conheça seu candidato</h3>
            <p>Consulte a ficha, as votações e as proposições disponíveis.</p>
            <span className={styles.cardAction}>
              Buscar candidato <span aria-hidden="true">→</span>
            </span>
          </Link>
        </section>

        

        <footer className={styles.footer}>
          <p>Fora da Pauta</p>
        </footer>
      </div>
    </main>
  );
}
