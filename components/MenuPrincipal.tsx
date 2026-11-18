import Link from "next/link";
import { cookies, headers } from "next/headers";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { IconeMenu } from "@/components/IconeMenu";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import styles from "@/app/central/page.module.css";
import { linkCompartilhamentoWhatsApp } from "@/lib/compartilhamento";
import { sql } from "@/lib/interesses/db";

export async function MenuPrincipal() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const agente = headerStore.get("user-agent") ?? "";
  const acessoDesktop = !/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(agente);
  const adminAutenticado = acessoDesktop && verifyQuestionsAdminSessionToken(cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value);
  let artigosDisponiveis = false;
  try {
    const resultado = await sql<{ disponivel: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM public.admin_artigos WHERE status = 'publicado') AS disponivel
    `;
    artigosDisponiveis = resultado[0]?.disponivel === true;
  } catch (erro) {
    console.error("Falha ao conferir artigos publicados:", erro);
  }
  return (
    <section id="menu" className={styles.pagina} aria-label="Menu do Fora da Pauta">
      <header className={styles.tituloMenu}><h2>Menu</h2><span aria-hidden="true" /></header>
      <nav className={styles.menu} aria-label="Menu central">
        {artigosDisponiveis ? (
          <Link className={styles.principal} href="/edicoes"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="publicacoes" /></span><span className={styles.textoBotao}><span className={styles.publicacoesTitulo}>Publicações</span><span className={styles.publicacoesDescricao}>Leia, ouça, compartilhe</span></span><span className={styles.seta} aria-hidden="true">›</span></Link>
        ) : (
          <span className={styles.principalDesabilitado} aria-disabled="true"
            title="Ainda não há artigos publicados"><span className={styles.publicacoesTitulo}>Publicações</span><span className={styles.publicacoesDescricao}>Leia, ouça, compartilhe</span></span>
        )}
        <Link className={styles.escolherPolitico} href="/acompanhar"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="escolher" /></span><span className={styles.textoBotao}><span className={styles.escolherTitulo}>Escolher um político</span><span className={styles.escolherDescricao}>Acompanhe as decisões de quem representa você.</span></span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <Link className={styles.botao} href="/meus-acompanhamentos"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="acompanhando" /></span><span className={styles.textoBotao}>Políticos que eu acompanho</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <Link className={styles.botao} href="/mandar-recado"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="recado" /></span><span className={styles.textoBotao}>Mandar um recado</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <Link className={styles.botao} href="/meus-recados"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="historico" /></span><span className={styles.textoBotao}>Meus recados</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <Link className={styles.botao} href="/qr-code"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="qr" /></span><span className={styles.textoBotao}>Mostrar QR Code</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <a className={styles.compartilhar} href={linkCompartilhamentoWhatsApp} target="_blank" rel="noopener noreferrer"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="compartilhar" /></span><span className={styles.textoBotao}>Compartilhar</span><span className={styles.seta} aria-hidden="true">›</span></a>
        <div className={styles.instalarRodape}><InstalarAplicativo tema="escuro" /></div>
        {adminAutenticado ? <Link className={styles.adminDiscreto} href="/admin"><span aria-hidden="true">⚙</span> Administração</Link> : null}
      </nav>
    </section>
  );
}
