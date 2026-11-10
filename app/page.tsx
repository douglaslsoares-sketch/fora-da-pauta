import { NovaHomeFiqueDeOlho } from "@/components/NovaHomeFiqueDeOlho";
import { versaoEdicoes, versaoEntregas } from "@/lib/novidades-publicacoes";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { tokenSessao, inscricaoAtiva } from "@/lib/telegram/sessao-site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Fora da Pauta",
  description: "Acompanhe o dia a dia dos políticos. Entenda como as decisões políticas afetam a nossa vida.",
  openGraph: {
    title: "Fora da Pauta — Há mais para entender.",
    description: "Acompanhe o dia a dia dos políticos. Entenda como as decisões políticas afetam a nossa vida.",
    url: "https://www.foradapauta.org/",
    type: "website",
    locale: "pt_BR",
    siteName: "Fora da Pauta",
    images: [{ url: "/compartilhar/olho-v2", width: 1200, height: 630, alt: "Olho amarelo do Fora da Pauta, sem texto." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/compartilhar/olho-v2"],
    title: "Fora da Pauta — Há mais para entender.",
    description: "Acompanhe o dia a dia dos políticos. Entenda como as decisões políticas afetam a nossa vida.",
  },
};

export default async function Home() {
  // Quem ja confirmou o Telegram neste navegador entra diretamente no menu.
  const token = await tokenSessao();
  if (token && await inscricaoAtiva(token)) {
    const pendente = (await cookies()).get("fdp_primeira_inscricao")?.value === "1";
    redirect(pendente ? "/api/telegram/primeira-inscricao" : "/ha-mais-para-entender");
  }
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>

      <div className={styles.watermark} aria-hidden="true" />

      <NovaHomeFiqueDeOlho />
    </main>
  );
}
