import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql, administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";
import { prepararEstruturaDeTestes } from "@/lib/admin/preparar-banco-testes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  // Endpoint operacional transitório: não pode ser usado em produção, em
  // qualquer outra branch nem para um banco já inicializado.
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "revisao-admin-20261113" ||
      !administrativeDatabaseWritesAllowed()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const expected = process.env.FDP_PREVIEW_DIAGNOSTIC_TOKEN;
  const received = request.headers.get("x-setup-token");
  if (!expected || !received) return NextResponse.json({ ok: false }, { status: 404 });
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ ok: false }, { status: 404 });
  if (request.headers.get("content-type") !== "application/json") {
    return NextResponse.json({ ok: false }, { status: 415 });
  }
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "CRIAR BANCO VAZIO DE TESTES") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const current = await sql<{ total: number }[]>`
      SELECT count(*)::integer AS total FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'admin_artigos'
    `;
    if (current[0]?.total !== 0) return NextResponse.json({ ok: false, code: "JA_INICIALIZADO" }, { status: 409 });
    const total = await prepararEstruturaDeTestes();
    return NextResponse.json({ ok: total === 14, tabelas: total },
      { status: total === 14 ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, code: "SETUP_FAILED" }, { status: 503 });
  }
}
