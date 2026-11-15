import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { linkCompartilhamentoWhatsApp } from "@/lib/compartilhamento";
import { sql } from "@/lib/interesses/db";

export const metadata: Metadata = {
  title: "Central | Fora da Pauta",
  description: "Escolha políticos para acompanhar e encontre as opções do Fora da Pauta.",
};

export const dynamic = "force-dynamic";

export default async function Central() {
  // Mesma fonte de dados e critério de publicação utilizados pela página /edicoes.
  let artigosDisponiveis = false;
  let falhaConsulta = false;
  try {
    const resultado = await sql<{ disponivel: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM public.admin_artigos WHERE status = 'publicado'
      ) AS disponivel
    `;
    artigosDisponiveis = resultado[0]?.disponivel === true;
  } catch (erro) {
    console.error("Não foi possível consultar a disponibilidade de artigos:", erro);
    falhaConsulta = true;
  }

  return (
    <main className={styles.pagina}>
      <SiteHeader />
      <nav className={styles.menu} aria-label="Menu central">
        {artigosDisponiveis ? (
          <Link className={styles.principal} href="/edicoes">Últimas notícias e análises</Link>
        ) : (
          <span
            className={styles.principalDesabilitado}
            aria-disabled="true"
            title={falhaConsulta ? "Artigos temporariamente indisponíveis" : "Ainda não há artigos publicados"}
          >
            Últimas notícias e análises
          </span>
        )}
        <Link className={styles.principal} href="/acompanhar">Escolher político para acompanhar</Link>
        <Link className={styles.botao} href="/votou-fique-de-olho?minhas=1">Políticos que eu acompanho</Link>
        <Link className={styles.botao} href="/fazer-uma-pergunta">O que você gostaria de perguntar?</Link>
        <Link className={styles.botao} href="/camiseta">Camiseta</Link>
        <Link className={styles.botao} href="/qr-code">Mostrar QR Code</Link>
        <a className={styles.compartilhar} href={linkCompartilhamentoWhatsApp} target="_blank" rel="noopener noreferrer">Compartilhar</a>
        <InstalarAplicativo tema="escuro" />
        <Link className={styles.voltarInicio} href="/">Ir para o início</Link>
      </nav>
    </main>
  );
}
