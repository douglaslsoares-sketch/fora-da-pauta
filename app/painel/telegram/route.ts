import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "@/lib/interesses/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headersSeguros = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
};

function igualSeguro(a: string, b: string) {
  const h1 = createHash("sha256").update(a).digest();
  const h2 = createHash("sha256").update(b).digest();
  return timingSafeEqual(h1, h2);
}

function autenticar(request: Request) {
  const usuario = process.env.FDP_PAINEL_USUARIO;
  const senha = process.env.FDP_PAINEL_SENHA;
  // Sem credenciais configuradas o painel permanece fechado.
  if (!usuario || !senha || senha.length < 20) return "desativado" as const;
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Basic ")) return "negado" as const;
  let credenciais = "";
  try {
    credenciais = Buffer.from(auth.slice(6), "base64").toString("utf8");
  } catch {
    return "negado" as const;
  }
  const separador = credenciais.indexOf(":");
  if (separador < 1) return "negado" as const;
  const correto = igualSeguro(credenciais.slice(0, separador), usuario) &&
    igualSeguro(credenciais.slice(separador + 1), senha);
  return correto ? "autorizado" as const : "negado" as const;
}

function html(conteudo: string, status = 200, outros: Record<string, string> = {}) {
  return new Response(conteudo, {
    status,
    headers: { ...headersSeguros, ...outros, "Content-Type": "text/html; charset=utf-8" },
  });
}

function numero(n: number | string | undefined) {
  return Number(n ?? 0).toLocaleString("pt-BR");
}

export async function GET(request: Request) {
  const acesso = autenticar(request);
  if (acesso === "desativado") return new Response(null, { status: 404, headers: headersSeguros });
  if (acesso !== "autorizado") {
    return html("Acesso restrito ao administrador.", 401, {
      "WWW-Authenticate": 'Basic realm="Painel privado Fora da Pauta", charset="UTF-8"',
    });
  }

  try {
    // Agregados anonimizados: nenhum identificador de usuario do Telegram sai do banco.
    const [totais, preferencias, acompanhamentos, avisos, historico] = await Promise.all([
      sql<{ total: number }[]>`
        SELECT COUNT(*)::int AS total FROM (
          SELECT p.telegram_chat_id FROM public.telegram_preferencias p
          WHERE p.tipo = 'novas_edicoes' AND p.status = 'ativo' AND p.cancelled_at IS NULL
          UNION
          SELECT a.telegram_chat_id FROM public.telegram_acompanhamentos a
          WHERE a.status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
            AND a.cancelled_at IS NULL
        ) AS inscritos
      `,
      sql<{ total: number }[]>`
        SELECT COUNT(DISTINCT telegram_chat_id)::int AS total
        FROM public.telegram_preferencias
        WHERE tipo = 'novas_edicoes' AND status = 'ativo' AND cancelled_at IS NULL
      `,
      sql<{ pessoas: number; vinculos: number }[]>`
        SELECT COUNT(DISTINCT telegram_chat_id)::int AS pessoas,
          COUNT(*)::int AS vinculos
        FROM public.telegram_acompanhamentos
        WHERE status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
          AND cancelled_at IS NULL
      `,
      sql<{ status: string; total: number }[]>`
        SELECT status, COUNT(*)::int AS total
        FROM public.telegram_fila_avisos GROUP BY status
      `,
      sql<{ id: string; chat_id: string; tipo: string; status: string; tentativas: number; criado: string; enviado: string | null; erro: string | null; evento_categoria: string; mensagem_confirmada: boolean }[]>`
        SELECT id::text, telegram_chat_id::text AS chat_id, tipo, status, tentativas,
          created_at::text AS criado, enviado_at::text AS enviado,
          ultimo_erro_codigo AS erro,
          CASE WHEN evento_id LIKE 'votacao:%' THEN 'Votação'
               WHEN evento_id LIKE 'proposicao:%' THEN 'Proposição'
               WHEN evento_id LIKE 'dossie:%' THEN 'Ficha política'
               ELSE 'Outro registro' END AS evento_categoria,
          telegram_message_id IS NOT NULL AS mensagem_confirmada
        FROM public.telegram_fila_avisos
        ORDER BY created_at DESC, id DESC LIMIT 50
      `,
    ]);

    const porStatus = new Map(avisos.map(a => [a.status, Number(a.total)]));
    const statusHtml = avisos
      .filter(a => /^[a-z_]+$/.test(a.status))
      .sort((a, b) => a.status.localeCompare(b.status))
      .map(a => `<tr><td>${a.status}</td><td>${numero(a.total)}</td></tr>`).join("");

    const segredoIdentificacao = process.env.FDP_PAINEL_SENHA ?? "";
    const rotulo = (chatId: string) => "Contato " + createHmac("sha256", segredoIdentificacao).update(chatId).digest("hex").slice(0, 10).toUpperCase();
    const data = (valor: string | null) => valor && !Number.isNaN(Date.parse(valor)) ? new Date(valor).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—";
    const seguro = (valor: string) => valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\x27/g, "&#39;");
    const linhasHistorico = historico.map(a => `<tr><td>${seguro(data(a.enviado ?? a.criado))}</td><td>${seguro(a.tipo)}</td><td>${seguro(a.evento_categoria)}</td><td>${seguro(a.status)}</td><td>${seguro(rotulo(a.chat_id))}</td><td>${a.tentativas}</td><td>${a.mensagem_confirmada ? "Sim" : "Não"}</td><td>${seguro(a.erro ?? "—")}</td></tr>`).join("");

    const documento = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Painel Telegram — Fora da Pauta</title>
      <style>
        *{box-sizing:border-box}body{font:16px system-ui,sans-serif;margin:0;background:#f5f5f2;color:#171717}
        header{background:#080808;color:white;padding:28px max(20px,calc((100vw - 1050px)/2))}
        header p{color:#ddd;margin:8px 0 0}
        main{max-width:1050px;margin:auto;padding:30px 20px 70px}
        h1{font-size:27px;margin:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
        .card,section{background:#fff;border:1px solid #dededb;border-radius:12px;padding:22px}
        .card strong{display:block;font-size:35px;margin:10px 0}.card span{color:#444}
        section{margin-top:20px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:12px;border-bottom:1px solid #eee}
        td:last-child,th:last-child{text-align:right}.note{color:#555;line-height:1.55;font-size:14px}
        a{color:#3b3600}.table-scroll{overflow-x:auto}.table-scroll table{min-width:720px}
      </style></head><body>
      <header><h1>Fora da Pauta · Painel Telegram</h1><p>Consulta privada — somente leitura</p></header>
      <main><div class="grid">
        <div class="card"><span>Pessoas com acompanhamento ativo no bot</span><strong>${numero(totais[0]?.total)}</strong></div>
        <div class="card"><span>Inscritas para novas edições</span><strong>${numero(preferencias[0]?.total)}</strong></div>
        <div class="card"><span>Acompanham representantes</span><strong>${numero(acompanhamentos[0]?.pessoas)}</strong></div>
        <div class="card"><span>Vínculos ativos com representantes</span><strong>${numero(acompanhamentos[0]?.vinculos)}</strong></div>
      </div>
      <section><h2>Situação da fila de notificações</h2><table>
        <thead><tr><th>Estado no sistema</th><th>Quantidade</th></tr></thead>
        <tbody>${statusHtml || '<tr><td colspan="2">Nenhum aviso registrado</td></tr>'}</tbody></table>
      </section>
      <section><h2>Histórico de notificações</h2><p class="note">Últimos 50 registros. Contatos identificados por códigos protegidos, sem exibir números ou identificadores do Telegram. Horários de Brasília.</p><div class="table-scroll"><table><thead><tr><th>Data</th><th>Tipo</th><th>Origem do aviso</th><th>Situação</th><th>Destinatário</th><th>Tentativas</th><th>Telegram confirmou</th><th>Erro</th></tr></thead><tbody>${linhasHistorico || '<tr><td colspan="8">Nenhum registro encontrado</td></tr>'}</tbody></table></div></section>
      <section><h2>Como interpretar</h2><p class="note">
      Estes números representam registros ativos vinculados ao bot do Fora da Pauta no banco de dados.
      Não são necessariamente a contagem de membros de um canal público do Telegram.
      A fila mostra registros históricos por situação; não representa necessariamente mensagens únicas nem pessoas.
      Nenhum aviso pode ser enviado por este painel.
      </p><p class="note">Para atualizar os números, recarregue esta página.</p></section>
      </main></body></html>`;
    return html(documento);
  } catch {
    return html("Não foi possível consultar os indicadores. Nenhum dado foi alterado.", 503);
  }
}
