import { createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { eleitos2026 } from "@/data/eleicoes/eleitos";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT_USERNAME = "ForaDaPautaAcompanhaBot";
const DURACAO_TOKEN_MINUTOS = 15;
const LIMITE_ACOMPANHAMENTOS = 100;

const LIMITE_VINCULOS_10_MIN = 10;
const JANELA_VINCULOS_10_MIN_SEGUNDOS = 10 * 60;

const LIMITE_VINCULOS_24_H = 50;
const JANELA_VINCULOS_24_H_SEGUNDOS = 24 * 60 * 60;

type CorpoRequisicao = {
  ids?: unknown;
};

function hashToken(token: string) {
  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

function muitasRequisicoes(
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    {
      erro:
        "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(
          Math.max(
            1,
            retryAfterSeconds,
          ),
        ),
      },
    },
  );
}

export async function POST(request: Request) {
  let body: CorpoRequisicao;

  try {
    body = await request.json() as CorpoRequisicao;
  } catch {
    return NextResponse.json(
      { erro: "Requisição inválida." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json(
      { erro: "Lista de pessoas inválida." },
      { status: 400 },
    );
  }

  const idsSolicitados = [
    ...new Set(
      body.ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => /^\d{8,20}$/.test(id)),
    ),
  ];

  if (
    idsSolicitados.length < 1 ||
    idsSolicitados.length > LIMITE_ACOMPANHAMENTOS
  ) {
    return NextResponse.json(
      { erro: "Escolha entre 1 e 100 pessoas para acompanhar." },
      { status: 400 },
    );
  }

  const idsEleitos = new Set(
    eleitos2026.map((pessoa) => pessoa.id),
  );

  const idsValidos = idsSolicitados.filter(
    (id) => idsEleitos.has(id),
  );

  if (idsValidos.length !== idsSolicitados.length) {
    return NextResponse.json(
      {
        erro:
          "Uma ou mais pessoas escolhidas não constam na lista atual de eleitos.",
      },
      { status: 400 },
    );
  }

  const limiteCurto =
    await consumeRateLimit({
      request,
      scope: "telegram:vinculo:10m",
      limit: LIMITE_VINCULOS_10_MIN,
      windowSeconds:
        JANELA_VINCULOS_10_MIN_SEGUNDOS,
    });

  if (!limiteCurto.allowed) {
    return muitasRequisicoes(
      limiteCurto.retryAfterSeconds,
    );
  }

  const limiteDiario =
    await consumeRateLimit({
      request,
      scope: "telegram:vinculo:24h",
      limit: LIMITE_VINCULOS_24_H,
      windowSeconds:
        JANELA_VINCULOS_24_H_SEGUNDOS,
    });

  if (!limiteDiario.allowed) {
    return muitasRequisicoes(
      limiteDiario.retryAfterSeconds,
    );
  }

  const token = randomBytes(24).toString("base64url");
  const tokenHash = hashToken(token);

  await sql`
    INSERT INTO public.telegram_vinculos_pendentes (
      token_hash,
      candidatura_ids,
      expires_at
    )
    VALUES (
      ${tokenHash},
      ${idsValidos},
      now() + (${DURACAO_TOKEN_MINUTOS}::integer * interval '1 minute')
    )
  `;

  const payload = `v_${token}`;

  return NextResponse.json(
    {
      url: `https://t.me/${BOT_USERNAME}?start=${payload}`,
      expiresInMinutes: DURACAO_TOKEN_MINUTOS,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}