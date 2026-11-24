import Link from "next/link";
import { cookies } from "next/headers";
import { AdminLogin } from "@/components/AdminLogin";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { sql } from "@/lib/interesses/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administração | Fora da Pauta",
  description: "Central administrativa do Fora da Pauta.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Indicador = number | null;
async function contarRecados(): Promise<Indicador> {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM public.recados_site WHERE status IN ('recebido', 'em_analise')`;
    return Number(rows[0]?.total ?? 0);
  } catch (error) {
    console.error("Indicador de recados indisponível:", error);
    return null;
  }
}
async function contarPerguntas(): Promise<Indicador> {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM public_questions WHERE status = 'pending'`;
    return Number(rows[0]?.total ?? 0);
  } catch (error) {
    console.error("Indicador de perguntas indisponível:", error);
    return null;
  }
}

const modulos = [
  { nome: "Editoriais", descricao: "Administração exclusiva de Editoriais.", href: "/admin/editoriais" },
  { nome: "Participação", descricao: "Gerenciar sugestões de nome e abrir a consulta quando for oportuno.", href: "/admin/participacao" },
  { nome: "Notificações", descricao: "Preparar avisos e testar envios individuais.", href: "/admin/notificacoes" },
  { nome: "Inscrições", descricao: "Consultar os indicadores de inscrições.", href: "/admin/inscricoes" },
  { nome: "Políticos acompanhados", descricao: "Consultar os acompanhamentos.", href: "/admin/politicos" },
  { nome: "Configurações", descricao: "Verificar integrações e serviços essenciais.", href: "/admin/configuracoes" },
];

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) return <AdminLogin />;
  const [recados, perguntas] = await Promise.all([contarRecados(), contarPerguntas()]);
  const pendencias = [
    { titulo: "Recados para analisar", valor: recados, href: "/admin/recados", descricao: "Recebidos ou em análise" },
    { titulo: "Perguntas aguardando resposta", valor: perguntas, href: "/admin/perguntas", descricao: "Perguntas pendentes" },
  ];
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515] sm:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Visão geral</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65">Acompanhe o que precisa de atenção e acesse as ferramentas do Fora da Pauta.</p>
        <h2 className="mt-9 text-lg font-bold">Pendências</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pendencias.map(item => <Link key={item.href} href={item.href} className="group rounded-xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-[#315b92] hover:shadow-md">
            <p className="text-sm font-semibold text-black/65">{item.titulo}</p>
            <p className="mt-3 text-4xl font-extrabold tabular-nums text-[#182b46]">{item.valor === null ? "—" : item.valor}</p>
            <p className="mt-2 text-xs text-black/55">{item.valor === null ? "Indicador temporariamente indisponível" : item.descricao}</p>
            <span className="mt-5 inline-block text-sm font-bold text-[#315b92] group-hover:underline">Ver {item.href.endsWith("recados") ? "recados" : "perguntas"} →</span>
          </Link>)}
        </div>
        <div className="mt-10 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Ferramentas</h2>
          <span className="text-xs text-black/50">Também disponíveis no menu lateral</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modulos.map(item => <Link key={item.href} href={item.href} className="group rounded-xl border border-black/10 bg-white p-5 transition hover:border-[#315b92] hover:shadow-sm">
            <h3 className="font-semibold">{item.nome}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-black/60">{item.descricao}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-[#315b92] group-hover:underline">Acessar →</span>
          </Link>)}
        </div>
        <p className="mt-8 text-xs leading-6 text-black/50">Os indicadores mostram registros atuais do sistema, não mensagens lidas por você. Publicações e notificações exigem confirmação nas respectivas ferramentas.</p>
      </section>
    </main>
  );
}
