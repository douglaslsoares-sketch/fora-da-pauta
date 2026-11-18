"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/admin", nome: "Visão geral", simbolo: "▦" },
  { href: "/admin/recados", nome: "Recados", simbolo: "✉" },
  { href: "/admin/perguntas", nome: "Perguntas", simbolo: "?" },
  { href: "/admin/artigos", nome: "Artigos", simbolo: "▤" },
  { href: "/admin/notificacoes", nome: "Notificações", simbolo: "◉" },
  { href: "/admin/inscricoes", nome: "Inscrições", simbolo: "♙" },
  { href: "/admin/politicos", nome: "Políticos", simbolo: "♧" },
  { href: "/admin/configuracoes", nome: "Configurações", simbolo: "⚙" },
];
export function AdminNavigation() {
  const pathname = usePathname();
  return <aside className="admin-desktop-nav" aria-label="Navegação administrativa">
    <div className="admin-desktop-brand"><span className="admin-desktop-eyebrow">FORA DA PAUTA</span><strong>Administração</strong><small>Central de trabalho</small></div>
    <nav aria-label="Módulos do painel">
      {itens.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={"admin-desktop-navlink" + (pathname === item.href ? " is-active" : "")}><span aria-hidden="true" className="admin-desktop-symbol">{item.simbolo}</span>{item.nome}</Link>)}
    </nav>
    <Link href="/" className="admin-desktop-back">← Voltar ao site</Link>
  </aside>;
}
