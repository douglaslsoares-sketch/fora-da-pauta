import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Como o jogo é jogado. Decisões políticas que afetam a sua vida.",
  openGraph: {
    images: [{ url: "/api/compartilhar/imagem?tipo=home", width: 1200, height: 630, alt: "Fora da Pauta — Há mais para entender." }],
    title: "Fora da Pauta — Há mais para entender.",
    description: "Como o jogo é jogado. Decisões políticas que afetam a sua vida.",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/compartilhar/imagem?tipo=home"],
    title: "Fora da Pauta — Há mais para entender.",
    description: "Como o jogo é jogado. Decisões políticas que afetam a sua vida.",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.watermark} aria-hidden="true" />

      <HomeAcessoTelegram />
    </main>
  );
}
