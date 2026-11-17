import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { linkCompartilhamentoWhatsApp } from "@/lib/compartilhamento";
import { MenuLinksRestritos } from "@/components/MenuLinksRestritos";
import { inscricaoAtiva, tokenSessao } from "@/lib/telegram/sessao-site";
import { sql } from "@/lib/interesses/db";

export const metadata: Metadata = {
  title: "Central | Fora da Pauta",
  description: "Escolha políticos para acompanhar e encontre as opções do Fora da Pauta.",
};

export const dynamic = "force-dynamic";

export default async function Central({ searchParams }: { searchParams: Promise<{ inscricao?: string }> }) {
  const parametros = await searchParams;
  let inscrito = false;
  let artigosDisponiveis = false;
  try {
    inscrito = await inscricaoAtiva(await tokenSessao());
  } catch (erro) {
    console.error("Falha ao conferir inscrição do menu:", erro);
  }
  try {
    const resultado = await sql<{ disponivel: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM public.admin_artigos WHERE status = 'publicado') AS disponivel
    `;
    artigosDisponiveis = resultado[0]?.disponivel === true;
  } catch (erro) {
    console.error("Falha ao conferir artigos publicados:", erro);
  }
  return (
    <main className={styles.pagina}>
      <SiteHeader />
      <nav className={styles.menu} aria-label="Menu central">
        {artigosDisponiveis ? (
          <Link className={styles.principal} href="/edicoes">Reflexões</Link>
        ) : (
          <span className={styles.principalDesabilitado} aria-disabled="true"
            title="Ainda não há artigos publicados">Reflexões</span>
        )}
        <Link className={styles.principal} href="/acompanhar">Escolher um político</Link>
        <MenuLinksRestritos inscrito={inscrito} avisoInicial={!inscrito && parametros.inscricao === "necessaria"} />
        <Link className={styles.botao} href="/loja">Loja</Link>
        <Link className={styles.botao} href="/qr-code">Mostrar QR Code</Link>
        <a className={styles.botao} href="https://whatsapp.com/channel/0029VbDnV1V8aKvH9yaMRY13" target="_blank" rel="noopener noreferrer">Seguir no WhatsApp</a>
        <a className={styles.compartilhar} href={linkCompartilhamentoWhatsApp} target="_blank" rel="noopener noreferrer">Compartilhar</a>
        <InstalarAplicativo tema="escuro" />
        <Link className={styles.voltarInicio} href="/">Ir para o início</Link>
      </nav>
    </main>
  );
}
