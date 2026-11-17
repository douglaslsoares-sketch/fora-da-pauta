import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { CriarTabelasAcompanhamento } from "@/components/CriarTabelasAcompanhamento";
import { TesteAcompanhamentos } from "@/components/TesteAcompanhamentos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teste de acompanhamentos | Administração", robots: { index: false, follow: false } };

export default async function AdminTesteAcompanhamentos() {
  const token = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) redirect("/admin/perguntas");
  let pronto = false;
  let erro = "";
  try {
    const resultado = await sql<{ visitantes: string | null; acompanhamentos: string | null }[]>`
      SELECT to_regclass('public.site_visitantes')::text AS visitantes,
             to_regclass('public.site_acompanhamentos')::text AS acompanhamentos
    `;
    pronto = Boolean(resultado[0]?.visitantes && resultado[0]?.acompanhamentos);
  } catch {
    erro = "Não foi possível consultar a estrutura do banco.";
  }
  return <main className="min-h-screen bg-white p-6 text-black">
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="underline">Voltar à administração</Link>
      <h1 className="mt-6 text-2xl font-bold">Preparação do acompanhamento</h1>
      <p className="mt-3" role="status">
        {erro || (pronto ? "As duas tabelas foram encontradas." : "As tabelas ainda não estão disponíveis. A migração precisa ser executada.")}
      </p>
      {pronto ? <TesteAcompanhamentos /> : <><p className="mt-4">O teste de gravação ficará disponível somente depois da criação das tabelas.</p><CriarTabelasAcompanhamento /></>}
    </div>
  </main>;
}
