import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { imagemCompartilhamento } from "@/lib/compartilhamento";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Investiga o que não está sendo explicado, apresenta fontes e ajuda você a compreender os acontecimentos e as decisões que afetam sua vida.",
  openGraph: {
    title: "Fora da Pauta — Conhecer é importante. Entender é fundamental.",
    description: "Quem forma a sua opinião: você ou quem escolhe a informação que chega até você?",
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
    description: "Quem forma a sua opinião: você ou quem escolhe a informação que chega até você?",
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
