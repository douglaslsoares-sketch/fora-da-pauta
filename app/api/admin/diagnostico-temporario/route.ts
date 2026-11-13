import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql, administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = process.env.FDP_PREVIEW_DIAGNOSTIC_TOKEN;
  const received = request.headers.get("x-diagnostic-token") ?? url.searchParams.get("token");
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "revisao-admin-20261113" ||
      !expected || !received) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const required = [
    "admin_artigos", "admin_artigos_historico", "public_questions",
    "public_question_events", "rate_limit_buckets",
    "telegram_preferencias", "telegram_acompanhamentos",
    "telegram_sessoes_site", "interacoes_politicas",
    "interacoes_politicas_historico",
  ];
  try {
    const dbIdentity = await sql<{ is_test_database: boolean, database: string }[]>`
      SELECT (current_database() = 'neondb') AS is_test_database, current_database() AS database
    `;
    const tables = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public'
      AND table_name IN (
        'admin_artigos', 'admin_artigos_historico', 'public_questions',
        'public_question_events', 'rate_limit_buckets', 'telegram_preferencias',
        'telegram_acompanhamentos', 'telegram_sessoes_site',
        'interacoes_politicas', 'interacoes_politicas_historico'
      )
    `;
    const found = new Set(tables.map(row => row.table_name));
    return NextResponse.json({
      ok: true,
      isolated: administrativeDatabaseWritesAllowed(),
      dbConnected: dbIdentity.length === 1,
      tables: required.map(name => ({ name, present: found.has(name) })),
    }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch {
    return NextResponse.json({ ok: false, code: "DATABASE_CHECK_FAILED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
