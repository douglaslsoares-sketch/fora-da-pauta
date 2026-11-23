import Link from "next/link";
import type { Metadata } from "next";
import { PoliticosMarca } from "@/components/PoliticosMarca";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const metadata: Metadata = {
  title: "Políticos",
  description: "Acompanhe quem nos representa. Escolha políticos, consulte suas escolhas e conheça o aplicativo Políticos.",
};

type TipoIcone = "buscar" | "pessoas" | "sino" | "qr" | "compartilhar" | "sacola" | "recado" | "historico" | "avaliar";
function Icone({ tipo }: { tipo: TipoIcone }) {
  const desenho = {
    buscar: <><circle cx="11" cy="11" r="7"/><path d="m16 16 6 6"/></>,
    pessoas: <><circle cx="9" cy="7.5" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 4.7a3.5 3.5 0 0 1 0 6.4M18 14a5 5 0 0 1 4 5v1"/></>,
    sino: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9"/><path d="M10 21h4"/></>,
    qr: <><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M5 5h2M17 5h2M5 17h2M14 14h4v4h-4zM21 14v4M14 21h4M21 21v.1"/></>,
    compartilhar: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 10.8 7.3-4.3M8.3 13.2l7.3 4.3"/></>,
    sacola: <><path d="M4 8h16l1.5 13h-19L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    recado: <><path d="M4 5h16v12H8l-4 4V5Z"/><path d="M7 9h10M7 13h7"/></>,
    historico: <><path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/><path d="M12 7v5l3.5 2"/></>,
    avaliar: <><path d="m12 2.8 3 6.1 6.8 1-4.9 4.8 1.2 6.7-6.1-3.2-6.1 3.2 1.2-6.7-4.9-4.8 6.8-1z"/></>,
  }[tipo];
  return <svg viewBox="0 0 24 24" className={styles.iconeSvg} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{desenho}</svg>;
}
const opcoes: Array<{ titulo: string; descricao: string; href: string; tipo: TipoIcone; destaque?: boolean }> = [
  { titulo: "Escolher um político", descricao: "Pesquise e acompanhe quem você quer.", href: "/politicos/escolher", tipo: "buscar", destaque: true },
  { titulo: "Políticos que eu acompanho", descricao: "Veja e gerencie suas escolhas.", href: "/politicos/acompanhados", tipo: "pessoas" },
  { titulo: "Histórico de um político", descricao: "Veja a trajetória e os registros do passado.", href: "/politicos/historico", tipo: "historico" },
  { titulo: "Receber avisos", descricao: "Saiba o que fazem os políticos que você acompanha.", href: "/politicos/avisos", tipo: "sino" },
  { titulo: "Mostrar QR Code", descricao: "Acesse pelo celular.", href: "/politicos/qr-code", tipo: "qr" },
  { titulo: "Compartilhar", descricao: "Indique o aplicativo para outras pessoas.", href: "/politicos/compartilhar", tipo: "compartilhar" },
  { titulo: "Avaliar o aplicativo", descricao: "Grave sua opinião enquanto usa o aplicativo.", href: "/politicos/avaliar", tipo: "avaliar" },
  { titulo: "Loja", descricao: "Produtos que ajudam a manter o projeto.", href: "/politicos/loja", tipo: "sacola" },
];

export default async function Politicos() {
  const sessao = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  const acessoAdministrativo = verifyQuestionsAdminSessionToken(sessao);
  return (
    <main className={styles.pagina}>
      <div className={styles.conteudo}>
        <header className={styles.cabecalho}>
          <PoliticosMarca className={styles.marca} />
          <h1 className={styles.titulo}>Políticos</h1>
        </header>
        <p className={styles.subtitulo}>Acompanhe quem nos representa.</p>
        <nav aria-label="Menu do aplicativo Políticos" className={styles.menu}>
          {opcoes.map(opcao => (
            <Link key={opcao.href} href={opcao.href} className={opcao.destaque ? styles.principal : styles.cartao}>
              <span className={styles.icone}><Icone tipo={opcao.tipo}/></span>
              <span className={styles.textos}><strong>{opcao.titulo}</strong><span>{opcao.descricao}</span></span>
              <span className={styles.seta} aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>
        <footer className={styles.rodape}>
          <Link href="/politicos/sobre" className={styles.sobre}>ⓘ Sobre o projeto</Link>
          {acessoAdministrativo ? <Link href="/politicos/admin" className={styles.sobre}>⚙ Administração do Políticos</Link> : null}
        </footer>
      </div>
    </main>
  );
}
