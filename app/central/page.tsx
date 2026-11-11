import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Central | Fora da Pauta",
  description: "Escolha políticos para acompanhar e encontre as opções do Fora da Pauta.",
};

const compartilhar = "https://wa.me/?text=" + encodeURIComponent("👁️ *FORA DA PAUTA*\n\n*Existe muito mais por trás das notícias.*\n\nQuem toma as decisões? Quais interesses estão em jogo? Como tudo isso afeta a nossa vida?\n\nO Fora da Pauta ajuda você a entender o que está acontecendo, acompanhar os políticos e tirar suas próprias conclusões.\n\nÉ gratuito.\n\n👉 https://www.foradapauta.org/?compartilhar=whatsapp");

export default function Central() {
  return (
    <main className={styles.pagina}>
      <SiteHeader />
      <nav className={styles.menu} aria-label="Menu central">
        <Link className={styles.principal} href="/edicoes">Últimas notícias e análises</Link>
        <Link className={styles.principal} href="/acompanhar">Escolher político para acompanhar</Link>
        <Link className={styles.botao} href="/votou-fique-de-olho?minhas=1">Políticos que eu acompanho</Link>
        <Link className={styles.botao} href="/fazer-uma-pergunta">O que você gostaria de perguntar?</Link>
        <Link className={styles.botao} href="/camiseta">Camiseta</Link>
        <Link className={styles.botao} href="/qr-code">Mostrar QR Code</Link>
        <a className={styles.compartilhar} href={compartilhar} target="_blank" rel="noopener noreferrer">Compartilhar</a>
        <InstalarAplicativo tema="escuro" />
        <Link className={styles.voltarInicio} href="/">Ir para o início</Link>
      </nav>
    </main>
  );
}
