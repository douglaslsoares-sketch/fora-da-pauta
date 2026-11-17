import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { imagemCompartilhamento } from "@/lib/compartilhamento";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Investigamos interesses e motivações que possam existir na escolha do que vira ou não notícia. Procuramos desvendar o que está por trás da notícia e por que ela é apresentada da maneira como chega até você, para que você tire suas próprias conclusões.",
  openGraph: {
    title: "Fora da Pauta — Conhecer é importante. Entender é fundamental.",
    description: "Quem forma sua opinião? Você ou quem escolhe as notícias que chegam e como chegam a você?",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
    images: [{ url: imagemCompartilhamento, width: 1200, height: 630, alt: "Logomarca Fora da Pauta com dois traços e assinatura editorial em amarelo." }],
  },
  twitter: {
    card: "summary_large_image",
    images: [imagemCompartilhamento],
    title: "Fora da Pauta — Conhecer é importante. Entender é fundamental.",
    description: "Quem forma sua opinião? Você ou quem escolhe as notícias que chegam e como chegam a você?",
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
