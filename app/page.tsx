import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Entenda o que acontece, acompanhe os políticos e tire suas próprias conclusões.",
  openGraph: {
    title: "Fora da Pauta — Existe muito mais por trás das notícias.",
    description: "Entenda o que acontece, acompanhe os políticos e tire suas próprias conclusões.",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
    images: [{ url: "/compartilhar/olho-v2?v=3", width: 1200, height: 630, alt: "Olho humano dourado e nome Fora da Pauta sobre fundo preto." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/compartilhar/olho-v2?v=3"],
    title: "Fora da Pauta — Existe muito mais por trás das notícias.",
    description: "Entenda o que acontece, acompanhe os políticos e tire suas próprias conclusões.",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.watermark} aria-hidden="true" />

      <HomeAcessoTelegram versaoEdicoes={versaoEdicoes} versaoEntregas={versaoEntregas} />
    </main>
  );
}
