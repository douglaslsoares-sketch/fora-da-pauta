import {
  createHmac,
} from "node:crypto";

import {
  sql,
} from "@/lib/interesses/db";

type ConsumeRateLimitInput = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  count: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: string;
};

function getRateLimitSecret() {
  const value =
    process.env
      .FDP_RATE_LIMIT_SECRET;

  if (!value) {
    throw new Error(
      "FDP_RATE_LIMIT_SECRET nao configurado.",
    );
  }

  return value;
}

function validateConfig({
  scope,
  limit,
  windowSeconds,
}: {
  scope: string;
  limit: number;
  windowSeconds: number;
}) {
  if (
    !scope ||
    scope.length > 80 ||
    !/^[a-z0-9:_-]+$/.test(
      scope,
    )
  ) {
    throw new Error(
      "Escopo de rate limit invalido.",
    );
  }

  if (
    !Number.isInteger(
      limit,
    ) ||
    limit < 1 ||
    limit > 1000000
  ) {
    throw new Error(
      "Limite de rate limit invalido.",
    );
  }

  if (
    !Number.isInteger(
      windowSeconds,
    ) ||
    windowSeconds < 60 ||
    windowSeconds > 604800
  ) {
    throw new Error(
      "Janela de rate limit invalida.",
    );
  }
}

function getClientSubject(
  request: Request,
) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    const first =
      forwarded
        .split(",")[0]
        ?.trim()
        .toLowerCase();

    if (first) {
      return first.slice(
        0,
        256,
      );
    }
  }

  const realIp =
    request.headers
      .get(
        "x-real-ip",
      )
      ?.trim()
      .toLowerCase();

  if (realIp) {
    return realIp.slice(
      0,
      256,
    );
  }

  /*
   * Em desenvolvimento local normalmente nao existe
   * cabecalho de IP encaminhado.
   *
   * Em producao, a ausencia do endereco nao desliga
   * a protecao: requisicoes sem identificador ficam
   * agrupadas em um mesmo bucket conservador.
   */
  return process.env.NODE_ENV ===
    "production"
    ? "unknown-production-client"
    : "local-development-client";
}

function subjectHash(
  request: Request,
  scope: string,
) {
  const subject =
    getClientSubject(
      request,
    );

  /*
   * O escopo entra no HMAC para impedir correlacao
   * direta do mesmo identificador entre finalidades.
   */
  return createHmac(
    "sha256",
    getRateLimitSecret(),
  )
    .update(
      `${scope}\u0000${subject}`,
      "utf8",
    )
    .digest(
      "hex",
    );
}

export async function consumeRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
}: ConsumeRateLimitInput): Promise<RateLimitResult> {

  validateConfig({
    scope,
    limit,
    windowSeconds,
  });

  const hash =
    subjectHash(
      request,
      scope,
    );

  const windowMilliseconds =
    windowSeconds * 1000;

  const nowMilliseconds =
    Date.now();

  const windowStartMilliseconds =
    Math.floor(
      nowMilliseconds /
        windowMilliseconds,
    ) *
    windowMilliseconds;

  const windowEndMilliseconds =
    windowStartMilliseconds +
    windowMilliseconds;

  const windowStart =
    new Date(
      windowStartMilliseconds,
    ).toISOString();

  const expiresAt =
    new Date(
      windowEndMilliseconds,
    ).toISOString();

  const row =
    await sql.begin(
      async (tx) => {

        /*
         * Limpeza oportunista.
         *
         * Nao existe IP bruto nesta tabela e buckets
         * vencidos nao precisam permanecer guardados.
         */
        await tx`
          DELETE FROM rate_limit_buckets
          WHERE expires_at <= now()
        `;

        const rows =
          await tx`
            INSERT INTO rate_limit_buckets (
              scope,
              subject_hash,
              window_start,
              window_seconds,
              hit_count,
              expires_at
            )
            VALUES (
              ${scope}::text,
              ${hash}::text,
              ${windowStart}::timestamptz,
              ${windowSeconds}::integer,
              1,
              ${expiresAt}::timestamptz
            )

            ON CONFLICT (
              scope,
              subject_hash,
              window_start,
              window_seconds
            )

            DO UPDATE SET
              hit_count =
                LEAST(
                  rate_limit_buckets.hit_count + 1,
                  1000000
                ),

              expires_at =
                EXCLUDED.expires_at

            RETURNING
              hit_count,
              expires_at
          `;

        if (
          rows.length !== 1
        ) {
          throw new Error(
            "Nao foi possivel atualizar o contador de rate limit.",
          );
        }

        return rows[0] as {
          hit_count:
            | number
            | string;

          expires_at:
            | string
            | Date;
        };
      },
    );

  const count =
    Number(
      row.hit_count,
    );

  if (
    !Number.isFinite(
      count,
    ) ||
    count < 1
  ) {
    throw new Error(
      "Contador de rate limit invalido.",
    );
  }

  const allowed =
    count <= limit;

  const remaining =
    Math.max(
      0,
      limit - count,
    );

  const secondsUntilReset =
    Math.max(
      1,
      Math.ceil(
        (
          windowEndMilliseconds -
          Date.now()
        ) /
        1000,
      ),
    );

  return {
    allowed,
    limit,
    count,
    remaining,

    retryAfterSeconds:
      allowed
        ? 0
        : secondsUntilReset,

    resetAt:
      new Date(
        windowEndMilliseconds,
      ).toISOString(),
  };
}
/*
 * Consulta o bucket atual sem incrementar o contador.
 *
 * Uso principal:
 * verificar se uma origem ja esta temporariamente
 * bloqueada antes de executar uma operacao sensivel.
 */
export async function inspectRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
}: ConsumeRateLimitInput): Promise<RateLimitResult> {

  validateConfig({
    scope,
    limit,
    windowSeconds,
  });

  const hash =
    subjectHash(
      request,
      scope,
    );

  const windowMilliseconds =
    windowSeconds * 1000;

  const nowMilliseconds =
    Date.now();

  const windowStartMilliseconds =
    Math.floor(
      nowMilliseconds /
        windowMilliseconds,
    ) *
    windowMilliseconds;

  const windowEndMilliseconds =
    windowStartMilliseconds +
    windowMilliseconds;

  const windowStart =
    new Date(
      windowStartMilliseconds,
    ).toISOString();

  const rows =
    await sql`
      SELECT
        hit_count
      FROM rate_limit_buckets
      WHERE
        scope =
          ${scope}::text
        AND subject_hash =
          ${hash}::text
        AND window_start =
          ${windowStart}::timestamptz
        AND window_seconds =
          ${windowSeconds}::integer
      LIMIT 1
    `;

  const count =
    rows.length === 1
      ? Number(
          rows[0].hit_count,
        )
      : 0;

  if (
    !Number.isFinite(
      count,
    ) ||
    count < 0
  ) {
    throw new Error(
      "Contador de rate limit invalido.",
    );
  }

  /*
   * Se ja existem "limit" falhas no bucket,
   * a proxima tentativa deve ser bloqueada antes
   * de executar a operacao protegida.
   */
  const allowed =
    count < limit;

  const remaining =
    Math.max(
      0,
      limit - count,
    );

  const secondsUntilReset =
    Math.max(
      1,
      Math.ceil(
        (
          windowEndMilliseconds -
          Date.now()
        ) /
        1000,
      ),
    );

  return {
    allowed,
    limit,
    count,
    remaining,

    retryAfterSeconds:
      allowed
        ? 0
        : secondsUntilReset,

    resetAt:
      new Date(
        windowEndMilliseconds,
      ).toISOString(),
  };
}
