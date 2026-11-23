import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { LoginAdministracaoPoliticos } from "@/components/politicos/LoginAdministracaoPoliticos";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { garantirTabelaFeedbackVozPoliticos } from "@/lib/politicos/feedbackVoz";
import { sql } from "@/lib/interesses/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Feedbacks de voz | Administração | Políticos",
  robots: { index: false, follow: false },
};
type FeedbackVoz = {
  id: string;
  data: string;
  duracao_segundos: number | null;
};
function duracao(segundos: number | null) {
  if (segundos === null) return "Duração não informada";
  return \`\${Math.floor(segundos / 60)}min \${String(segundos % 60).padStart(2, "0")}s\`;
}

export default async function FeedbacksVozAdministracao() {
  const token = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) return <LoginAdministracaoPoliticos />;

  let feedbacks: FeedbackVoz[] = [];
  let total = 0;
  let falha = false;
  try {
    await garantirTabelaFeedbackVozPoliticos();
    const [registros, contagem] = await Promise.all([
      sql<FeedbackVoz[]>\`
        SELECT id::text AS id, duracao_segundos,
          to_char(criado_em AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data
        FROM public.politicos_feedback_voz ORDER BY criado_em DESC LIMIT 100
      \`,
      sql<{ total: string }[]>\`SELECT COUNT(*)::text AS total FROM public.politicos_feedback_voz\`,
    ]);
    feedbacks = registros;
    total = Number(contagem[0]?.total ?? 0);
  } catch (e) {
    console.error("Falha ao consultar feedbacks de voz:", e);
    falha = true;
  }

  return (
    <PaginaPoliticos titulo="Feedbacks de voz">
      <Link href="/politicos/admin" className="mb-5 inline-block font-semibold text-[#ffd333] underline underline-offset-4">← Administração</Link>
      {falha ? <p role="alert" className="rounded-xl border border-red-500/50 p-5 text-white">Não foi possível consultar os áudios. Verifique os registros do servidor.</p> : (
        <>
          <div className="rounded-xl border border-[#38556f] bg-[#162d44] p-5">
            <p className="text-3xl font-extrabold text-[#ffd333]">{total.toLocaleString("pt-BR")}</p>
            <p className="mt-2 text-sm text-slate-200">Feedbacks em áudio recebidos</p>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">As gravações ficam disponíveis apenas na área administrativa. Os dados de voz não são divulgados no aplicativo.</p>
          {feedbacks.length === 0 ? (
            <p className="mt-6 rounded-xl bg-[#162d44] p-5 text-slate-200">Nenhum áudio recebido até agora.</p>
          ) : (
            <ol className="mt-6 space-y-4">
              {feedbacks.map(item => (
                <li key={item.id} className="rounded-xl border border-[#38556f] bg-[#162d44] p-5">
                  <p className="font-semibold text-[#ffd333]">{item.data} (Brasília)</p>
                  <p className="mt-1 text-sm text-slate-300">{duracao(item.duracao_segundos)}</p>
                  <audio controls preload="none" className="mt-4 w-full" src={\`/api/politicos/avaliacoes/voz/\${item.id}\`} aria-label={\`Feedback recebido em \${item.data}\`} />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </PaginaPoliticos>
  );
}
