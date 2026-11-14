import Link from "next/link";
import PrepararEditorial from "@/components/AdminPrepararEditorial";
import PrepararBancoTestes from "@/components/PrepararBancoTestes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sql, administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Configurações | Administração | Fora da Pauta", robots: { index: false, follow: false } };

export default async function AdminConfiguracoes() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  let database: "disponivel" | "indisponivel" = "indisponivel";
  try {
    const result = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
    if (result[0]?.ok === 1) database = "disponivel";
  } catch { /* Não revelar detalhes de conexão. */ }
  let editorial = "Não foi possível verificar";
  if (database === "disponivel") {
    try {
      const tables = await sql<{ nome: string }[]>`
        SELECT table_name AS nome FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name IN ('admin_artigos', 'admin_artigos_historico')
      `;
      const found = new Set(tables.map(t => t.nome));
      editorial = found.has("admin_artigos") && found.has("admin_artigos_historico")
        ? "Tabelas de artigos e histórico presentes"
        : found.has("admin_artigos")
          ? "Tabela de artigos presente; histórico ainda não inicializado"
          : "Tabelas editoriais ainda não inicializadas";
    } catch { editorial = "Não foi possível verificar as tabelas editoriais"; }
  }
  const isPreview = process.env.VERCEL_ENV === "preview";
  const isolated = isPreview && administrativeDatabaseWritesAllowed();
  let otherTables = "Não foi possível verificar";
  if (database === "disponivel") {
    try {
      const required = ["public_questions", "public_question_events", "telegram_preferencias", "telegram_acompanhamentos", "telegram_sessoes_site", "interacoes_politicas", "interacoes_politicas_historico"];
      const present = await sql<{ nome: string }[]>`
        SELECT table_name AS nome FROM information_schema.tables WHERE table_schema = 'public'
        AND table_name IN ('public_questions', 'public_question_events', 'telegram_preferencias', 'telegram_acompanhamentos', 'telegram_sessoes_site', 'interacoes_politicas', 'interacoes_politicas_historico')
      `;
      const found = new Set(present.map(item => item.nome));
      const missing = required.filter(name => !found.has(name));
      otherTables = missing.length ? "Faltam: " + missing.join(", ") : "Tabelas essenciais presentes";
    } catch { otherTables = "Não foi possível verificar as tabelas essenciais"; }
  }
  const checks = [
    ...(isPreview ? [{ nome: "Isolamento da prévia", situacao: isolated ? "Banco de testes separado e branch de revisão confirmada" : "Gravações bloqueadas: isolamento não confirmado", descricao: "As alterações só são permitidas na ramificação de revisão com banco separado." }] : []),
    { nome: "Estruturas de perguntas, Telegram e interações", situacao: otherTables, descricao: "Verificação somente de tabelas; não lê dados de inscritos." },
    { nome: "Banco de dados", situacao: database === "disponivel" ? "Conexão disponível" : "Não foi possível confirmar a conexão", descricao: "Usado por artigos, inscrições e preferências." },
    { nome: "Estrutura editorial", situacao: editorial, descricao: "Confere a existência das tabelas de artigos e histórico sem alterar dados." },
    { nome: "Bot do Telegram", situacao: process.env.TELEGRAM_BOT_TOKEN ? "Credencial configurada" : "Credencial não configurada", descricao: "A presença da credencial não confirma a entrega de mensagens." },
    { nome: "Acesso administrativo", situacao: "Sessão autenticada", descricao: "Acesso restrito à área administrativa." },
    { nome: "Notificações gerais", situacao: "Envio pelo painel desativado", descricao: "Nenhuma mensagem geral pode ser disparada por este painel nesta etapa." },
    { nome: "Publicação de artigos", situacao: "Controles implementados — testes pendentes", descricao: "Publicação e arquivamento exigem confirmação no painel." },
  ];
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Configurações e serviços</h1>
        <p className="mt-4 leading-7 text-black/65">Visão de diagnóstico. Esta página não modifica configurações, não revela senhas e não executa tarefas automáticas.</p>
        {isPreview && isolated && database === "disponivel" && otherTables !== "Tabelas essenciais presentes" && <PrepararBancoTestes />}
        {editorial !== "Tabelas de artigos e histórico presentes" && database === "disponivel" && !isPreview && <PrepararEditorial />}
        <div className="mt-8 space-y-4">
          {checks.map(check => (
            <section key={check.nome} className="rounded-xl border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{check.nome}</h2>
              <p className="mt-2 font-medium">{check.situacao}</p>
              <p className="mt-2 text-sm leading-6 text-black/60">{check.descricao}</p>
            </section>
          ))}
        </div>
        <p className="mt-7 text-sm leading-6 text-black/55">A verificação de uma credencial ou conexão não substitui os testes reais de publicação, navegação e entrega pelo Telegram.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
