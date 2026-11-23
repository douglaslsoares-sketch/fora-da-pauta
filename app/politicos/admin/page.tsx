import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { LoginAdministracaoPoliticos } from "@/components/politicos/LoginAdministracaoPoliticos";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { sql } from "@/lib/interesses/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administração | Políticos", robots: { index: false, follow: false } };

type Indicador = number | null;
async function total(tabela: "pessoas" | "acompanhamentos" | "politicos") : Promise<Indicador> {
  try {
    const linhas = tabela === "pessoas"
      ? await sql<{ total: string }[]>`SELECT COUNT(*)::text AS total FROM public.site_visitantes`
      : tabela === "acompanhamentos"
        ? await sql<{ total: string }[]>`SELECT COUNT(*)::text AS total FROM public.site_acompanhamentos`
        : await sql<{ total: string }[]>`SELECT COUNT(DISTINCT candidatura_id)::text AS total FROM public.site_acompanhamentos`;
    return Number(linhas[0]?.total ?? 0);
  } catch (error) {
    console.error("Falha ao consultar indicador Políticos:", error);
    return null;
  }
}

export default async function AdministracaoPoliticos() {
  const sessao = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(sessao)) return <LoginAdministracaoPoliticos />;
  const [visitantes, escolhas, politicos] = await Promise.all([
    total("pessoas"), total("acompanhamentos"), total("politicos")
  ]);
  const indicadores = [
    { titulo: "Visitantes registrados", valor: visitantes },
    { titulo: "Escolhas de acompanhamento", valor: escolhas },
    { titulo: "Políticos com acompanhamentos", valor: politicos },
    { titulo: "Registros na base eleitoral", valor: candidaturas.length },
  ];
  return <PaginaPoliticos titulo="Administração">
    <p className="mb-6 text-sm leading-6 text-slate-300">Painel de acompanhamento do aplicativo Políticos. Usa a base de dados compartilhada com o Fora da Pauta.</p>
    <section className="grid grid-cols-2 gap-3">
      {indicadores.map(item=><div key={item.titulo} className="rounded-xl border border-[#344760] bg-[#152d45] p-4">
        <p className="text-2xl font-extrabold text-[#ffd02a]">{item.valor===null?"—":item.valor.toLocaleString("pt-BR")}</p>
        <p className="mt-2 text-sm leading-5 text-slate-200">{item.titulo}</p>
      </div>)}
    </section>
    <section className="mt-7 rounded-xl border border-[#344760] bg-[#152d45] p-5">
      <h2 className="text-lg font-bold text-[#ffd02a]">Serviços do Políticos</h2>
      <p className="mt-3 text-sm leading-6 text-slate-200">Pesquisa e escolhas: usam a base eleitoral e o registro de acompanhamentos do site.</p>
      <p className="mt-3 text-sm leading-6 text-slate-200">Envio de recados individuais: bloqueado até a verificação do contato institucional.</p>
      <p className="mt-3 text-sm leading-6 text-slate-200">Avisos individuais automáticos: ainda em preparação. Não há disparo de notificações nesta página.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/politicos/admin/avaliacoes" className="inline-flex rounded-lg bg-[#ffd02a] px-4 py-3 text-sm font-bold text-[#071827]">Ouvir feedbacks de voz</Link>
        <Link href="/admin/politicos/contatos" className="inline-flex rounded-lg border border-[#ffd02a] px-4 py-3 text-sm font-semibold text-white">Conferir contatos institucionais</Link>
      </div>
    </section>
  </PaginaPoliticos>;
}
