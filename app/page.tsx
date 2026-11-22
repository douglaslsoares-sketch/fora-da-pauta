import { MenuPrincipal } from "@/components/MenuPrincipal";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { imagemCompartilhamento } from "@/lib/compartilhamento";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Investigamos interesses e motivações que possam existir na escolha dos assuntos que ganham destaque e daqueles que ficam de fora. Procuramos desvendar o que está por trás das informações e os motivos pelos quais elas são apresentadas de uma determinada maneira e não de outra, para que você tire suas próprias conclusões. Será que, por trás da informação que chega até você, existe alguma intenção de direcionar sua opinião para determinada conclusão?",
  openGraph: {
    title: "Fora da Pauta",
    description: "Leia, ouça e compartilhe as publicações do Fora da Pauta.",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
    images: [{ url: imagemCompartilhamento, width: 1200, height: 630, alt: "Logomarca oficial Fora da Pauta em branco e amarelo sobre fundo azul-marinho." }],
  },
  twitter: {
    card: "summary_large_image",
    images: [imagemCompartilhamento],
    title: "Fora da Pauta",
    description: "Leia, ouça e compartilhe as publicações do Fora da Pauta.",
  },
};

export default function Home() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#menu">
        Ir para o conteúdo
      </a>

      <MenuPrincipal />
    </main>
  );
}
