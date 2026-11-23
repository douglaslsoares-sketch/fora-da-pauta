import Link from "next/link";
import { cookies, headers } from "next/headers";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { IconeMenu } from "@/components/IconeMenu";
import { LogoForaDaPauta } from "@/components/LogoForaDaPauta";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import styles from "@/app/central/page.module.css";
import { linkCompartilhamentoWhatsApp } from "@/lib/compartilhamento";
import { participacaoNomeAberta } from "@/lib/participacaoNome";

export async function MenuPrincipal() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const agente = headerStore.get("user-agent") ?? "";
  const acessoDesktop = !/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(agente);
  const adminAutenticado = acessoDesktop && verifyQuestionsAdminSessionToken(cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value);
  const sugestoesAbertas = await participacaoNomeAberta();
  return (
    <section id="menu" className={styles.pagina} aria-label="Menu do Fora da Pauta">
      <header className={styles.tituloMenu}><LogoForaDaPauta className={styles.logoMenuOficial} /><h1 className="sr-only">Fora da Pauta</h1></header>
      <nav className={styles.menu} aria-label="Menu central">
        <Link className={styles.principal} href="/publicacoes"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="publicacoes" /></span><span className={styles.textoBotao}><span className={styles.publicacoesTitulo}>Publicações</span><span className={styles.publicacoesDescricao}>Leia, ouça e compartilhe</span></span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <a className={styles.seguirForaDaPauta} href="https://whatsapp.com/channel/0029VbDnV1V8aKvH9yaMRY13" target="_blank" rel="noopener noreferrer" aria-label="Siga o Fora da Pauta no WhatsApp"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="recado" /></span><span className={styles.textoBotao}><span className={styles.seguirTitulo}>Siga o Fora da Pauta</span><span className={styles.seguirDescricao}>Receba avisos de novas publicações</span></span><span className={styles.seta} aria-hidden="true">›</span></a>
        <Link className={styles.botao} href="/politicos"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="escolher" /></span><span className={styles.textoBotao}><span className={styles.escolherTitulo}>Escolher um político</span><span className={styles.escolherDescricao}>Escolha quem você quer acompanhar</span></span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <Link className={styles.botao} href="/politicos/acompanhados"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="acompanhando" /></span><span className={styles.textoBotao}>Políticos que eu acompanho</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        {/* Lançamento: recados ainda em validação. Mantemos as páginas e dados,
            mas não as promovemos no menu público até o envio ser homologado. */}
        <Link className={styles.botao} href="/qr-code"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="qr" /></span><span className={styles.textoBotao}>Mostrar QR Code</span><span className={styles.seta} aria-hidden="true">›</span></Link>
        <a className={styles.compartilhar} href={linkCompartilhamentoWhatsApp} target="_blank" rel="noopener noreferrer"><span className={styles.icone} aria-hidden="true"><IconeMenu nome="compartilhar" /></span><span className={styles.textoBotao}>Compartilhar</span><span className={styles.seta} aria-hidden="true">›</span></a>
        {sugestoesAbertas && <Link className={styles.botao} href="/sugira-um-nome"><span className={styles.icone} aria-hidden="true">?</span><span className={styles.textoBotao}>Ajude a escolher nosso nome</span><span className={styles.seta} aria-hidden="true">›</span></Link>}
        <div className={styles.instalarRodape}><InstalarAplicativo tema="escuro" /></div>
        {adminAutenticado ? <Link className={styles.adminDiscreto} href="/admin"><span aria-hidden="true">⚙</span> Administração</Link> : null}
      </nav>
    </section>
  );
}
