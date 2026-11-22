import Link from "next/link";
import PrepararEditorial from "@/components/AdminPrepararEditorial";
import AdminResendDomainStatus from "@/components/AdminResendDomainStatus";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
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
  // Verificação passiva: não chama o Resend nem autoriza qualquer envio.
  const remetenteRecadosCorreto =
    process.env.FDP_RECADOS_EMAIL_REMETENTE?.trim().toLowerCase() === "recados@foradapauta.org";
  const chaveResendPresente = Boolean(process.env.RESEND_API_KEY?.trim());
  const checks = [
    { nome: "Banco de dados", situacao: database === "disponivel" ? "Conexão disponível" : "Não foi possível confirmar a conexão", descricao: "Usado por artigos, inscrições e preferências." },
    { nome: "Estrutura editorial", situacao: editorial, descricao: "Confere a existência das tabelas de artigos e histórico sem alterar dados." },
    { nome: "Integração legada do Telegram", situacao: process.env.TELEGRAM_BOT_TOKEN ? "Credencial antiga presente" : "Sem credencial antiga", descricao: "Canal anterior do projeto; esta verificação não mede o funcionamento do WhatsApp." },
    { nome: "Resend — transporte de e-mail", situacao: chaveResendPresente ? "Chave presente neste ambiente" : "Chave ausente neste ambiente", descricao: "A presença da chave não comprova que o domínio esteja verificado no Resend." },
    { nome: "Remetente de recados aos políticos", situacao: remetenteRecadosCorreto ? "recados@foradapauta.org — configurado" : "Endereço remetente não configurado como esperado", descricao: "Somente confere a configuração. Não cria e não envia e-mails." },
    { nome: "Prontidão técnica do transporte", situacao: chaveResendPresente && remetenteRecadosCorreto ? "Configurações básicas presentes; envio desabilitado" : "Configuração incompleta; envio desabilitado", descricao: "A chave é restrita ao envio, e esta tela não a utiliza. A validação de domínio e a entrega exigem verificações separadas. Nenhuma mensagem é enviada." },
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
        {editorial !== "Tabelas de artigos e histórico presentes" && database === "disponivel" && <PrepararEditorial />}
        <div className="mt-8 space-y-4">
          {checks.map(check => (
            <section key={check.nome} className="rounded-xl border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{check.nome}</h2>
              <p className="mt-2 font-medium">{check.situacao}</p>
              <p className="mt-2 text-sm leading-6 text-black/60">{check.descricao}</p>
              {check.nome === "Resend — transporte de e-mail" && <AdminResendDomainStatus />}
            </section>
          ))}
        </div>
        <p className="mt-7 text-sm leading-6 text-black/55">A verificação de credenciais ou conexões não substitui os testes reais de publicação e navegação. Esta página não comprova a entrega de avisos pelo WhatsApp.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
