import { MenuPrincipal } from "@/components/MenuPrincipal";
import { RetornoMenu } from "@/components/RetornoMenu";
import { HomeAcessoTelegram } from "@/components/HomeAcessoTelegram";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { imagemCompartilhamento } from "@/lib/compartilhamento";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Investigamos interesses e motivações que possam existir na escolha dos assuntos que ganham destaque e daqueles que ficam de fora. Procuramos desvendar o que está por trás das informações e os motivos pelos quais elas são apresentadas de uma determinada maneira e não de outra, para que você tire suas próprias conclusões. Será que, por trás da informação que chega até você, existe alguma intenção de direcionar sua opinião para determinada conclusão?",
  openGraph: {
    title: "Fora da Pauta — Há mais para entender.",
    description: "Quem forma sua opinião? Você ou quem escolhe a informação que chega até você?",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
    images: [{ url: imagemCompartilhamento, width: 1200, height: 630, alt: "Logomarca Fora da Pauta com dois traços e assinatura editorial em amarelo." }],
  },
  twitter: {
    card: "summary_large_image",
    images: [imagemCompartilhamento],
    title: "Fora da Pauta — Há mais para entender.",
    description: "Quem forma sua opinião? Você ou quem escolhe a informação que chega até você?",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.watermark} aria-hidden="true" />

      <RetornoMenu />
      <HomeAcessoTelegram versaoEdicoes={versaoEdicoes} versaoEntregas={versaoEntregas} />
      <MenuPrincipal />
    </main>
  );
}
