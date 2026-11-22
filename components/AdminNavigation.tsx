"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName = "overview" | "mail" | "help" | "file" | "bell" | "users" | "landmark" | "settings";
const itens: { href: string; nome: string; icone: IconName }[] = [
  { href: "/admin", nome: "Visão geral", icone: "overview" },
  { href: "/admin/recados", nome: "Recados", icone: "mail" },
  { href: "/admin/perguntas", nome: "Perguntas", icone: "help" },
  { href: "/admin/artigos", nome: "Artigos", icone: "file" },
  { href: "/admin/participacao", nome: "Participação", icone: "users" },
  { href: "/admin/notificacoes", nome: "Notificações", icone: "bell" },
  { href: "/admin/inscricoes", nome: "Inscrições", icone: "users" },
  { href: "/admin/politicos", nome: "Políticos", icone: "landmark" },
  { href: "/admin/configuracoes", nome: "Configurações", icone: "settings" },
];
const desenhos: Record<IconName, React.ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"/><path d="M12 17h.01"/></>,
  file: <><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h7M9 16h7"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></>,
  landmark: <><path d="m3 9 9-6 9 6M4 9h16M6 10v9M10 10v9M14 10v9M18 10v9M3 21h18"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M9 3h6l1 3 3 1 2 3-2 2 0 2 2 2-2 3-3 1-1 3H9l-1-3-3-1-2-3 2-2v-2l-2-2 2-3 3-1z"/></>,
};
export function AdminNavigation() {
  const pathname = usePathname();
  return <aside className="admin-desktop-nav" aria-label="Navegação administrativa">
    <div className="admin-desktop-brand"><span className="admin-desktop-eyebrow">FORA DA PAUTA</span><strong>Administração</strong><small>Central de trabalho</small></div>
    <nav aria-label="Módulos do painel">
      {itens.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={"admin-desktop-navlink" + (pathname === item.href ? " is-active" : "")}><span aria-hidden="true" className="admin-desktop-symbol"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{desenhos[item.icone]}</svg></span>{item.nome}</Link>)}
    </nav>
    <Link href="/" className="admin-desktop-back">← Voltar ao site</Link>
  </aside>;
}
