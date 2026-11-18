import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { sql } from "@/lib/interesses/db";

export const dynamic = "force-dynamic";

async function autorizado() {
  const store = await cookies();
  return verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
}
const semCache = { "Cache-Control": "no-store" };

export async function GET() {
  if (!(await autorizado())) return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  try {
    const rows = await sql`SELECT id, destinatario, texto, status, criado_em FROM public.recados_site ORDER BY criado_em DESC LIMIT 100`;
    return NextResponse.json({ recados: rows }, { headers: semCache });
  } catch (error) {
    console.error("Erro ao consultar recados:", error);
    return NextResponse.json({ erro: "Não foi possível carregar os recados." }, { status: 500, headers: semCache });
  }
}

export async function PATCH(request: Request) {
  if (!(await autorizado())) return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  const origin = request.headers.get("origin");
  if (!origin || (() => { try { return new URL(origin).origin !== new URL(request.url).origin; } catch { return true; } })()) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: semCache });
  }
  let data: { id?: unknown; status?: unknown };
  try { data = await request.json(); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 }); }
  const id = typeof data.id === "string" ? data.id : "";
  const status = data.status;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    !["recebido", "em_analise", "respondido", "arquivado"].includes(String(status))) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  try {
    const rows = await sql`UPDATE public.recados_site SET status = ${status as string} WHERE id = ${id}::uuid RETURNING id, status`;
    if (!rows.length) return NextResponse.json({ erro: "Recado não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true, recado: rows[0] }, { headers: semCache });
  } catch (error) {
    console.error("Erro ao atualizar recado:", error);
    return NextResponse.json({ erro: "Não foi possível atualizar o recado." }, { status: 500 });
  }
}
