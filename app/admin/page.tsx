import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administração | Fora da Pauta",
  description: "Central administrativa do Fora da Pauta.",
  robots: { index: false, follow: false },
};

const modulos = [
  { nome: "Perguntas recebidas", descricao: "Responder perguntas e decidir quais respostas serão públicas.", href: "/admin/perguntas", ativo: true },
  { nome: "Artigos", descricao: "Consultar o acervo preservado; publicação em preparação.", href: "/admin/artigos", ativo: true },
  { nome: "Notificações", descricao: "Preparar testes individuais e avisos aos inscritos; envios ainda desativados.", href: "/admin/notificacoes", ativo: true },
  { nome: "Inscrições", descricao: "Consultar indicadores agregados de inscrições e acompanhamentos.", href: "/admin/inscricoes", ativo: true },
  { nome: "Políticos acompanhados", descricao: "Consultar quantidade de contas por político acompanhado.", href: "/admin/politicos", ativo: true },
  { nome: "Configurações", descricao: "Acompanhar rotinas, integrações e possíveis falhas.", ativo: false },
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) {
    redirect("/admin/perguntas");
  }
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Painel do Fora da Pauta</h1>
        <p className="mt-4 max-w-2xl leading-7 text-black/65">Um lugar para administrar o projeto. As funções ainda não disponíveis estão identificadas como em preparação.</p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {modulos.map((modulo) => (
            <div key={modulo.nome} className="flex flex-col justify-between rounded-xl border border-black/10 bg-white p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{modulo.nome}</h2>
                  {!modulo.ativo && <span className="shrink-0 text-xs text-black/45">Em preparação</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-black/65">{modulo.descricao}</p>
              </div>
              {modulo.ativo && modulo.href && <Link href={modulo.href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-black px-5 py-3 font-semibold text-white">Abrir</Link>}
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-black/55">A central não publica artigos nem envia notificações automaticamente. Essas ações exigirão controles próprios e confirmação.</p>
        <div className="mt-8 flex justify-center"><Link href="/central" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-3 font-semibold text-white"><span aria-hidden="true">×</span> Fechar</Link></div>
      </section>
    </main>
  );
}
