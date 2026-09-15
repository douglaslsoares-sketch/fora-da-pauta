import {
  NextResponse,
} from "next/server";

import {
  createQuestionsAdminSessionToken,
  QUESTIONS_ADMIN_COOKIE,
  QUESTIONS_ADMIN_SESSION_MAX_AGE_SECONDS,
  verifyQuestionsAdminAccessCode,
} from "@/lib/questionsAdminAuth";

import {
  consumeRateLimit,
  inspectRateLimit,
} from "@/lib/rateLimit";

export const dynamic =
  "force-dynamic";

const MAX_LOGIN_BODY_BYTES =
  4 * 1024;

const LOGIN_SHORT_LIMIT = 5;
const LOGIN_SHORT_WINDOW_SECONDS =
  15 * 60;

const LOGIN_24H_LIMIT = 20;
const LOGIN_24H_WINDOW_SECONDS =
  24 * 60 * 60;

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(
        origin,
      ).origin ===
      new URL(
        request.url,
      ).origin
    );
  }
  catch {
    return false;
  }
}

function declaredRequestTooLarge(
  request: Request,
) {
  const value =
    request.headers.get(
      "content-length",
    );

  if (!value) {
    return false;
  }

  const bytes =
    Number(value);

  return (
    Number.isFinite(bytes) &&
    bytes > MAX_LOGIN_BODY_BYTES
  );
}

function noStoreJson(
  body: unknown,
  status: number,
) {
  const response =
    NextResponse.json(
      body,
      {
        status,
      },
    );

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}

function tooManyAttempts(
  retryAfterSeconds: number,
) {
  const response =
    noStoreJson(
      {
        ok: false,
        error:
          "Muitas tentativas de acesso. Aguarde e tente novamente.",
      },
      429,
    );

  response.headers.set(
    "Retry-After",
    String(
      Math.max(
        1,
        retryAfterSeconds,
      ),
    ),
  );

  return response;
}

export async function POST(
  request: Request,
) {

  /*
   * A verificacao de origem acontece antes de qualquer
   * consulta de autenticacao ou de rate limit.
   */
  if (
    !isSameOrigin(
      request,
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Origem não autorizada.",
      },
      403,
    );
  }

  /*
   * Evita carregar JSON excessivo em memoria.
   */
  if (
    declaredRequestTooLarge(
      request,
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Solicitação excede o tamanho permitido.",
      },
      413,
    );
  }

  /*
   * Antes de comparar o codigo, consulta se esta origem
   * ja acumulou falhas suficientes para estar bloqueada.
   *
   * Esta consulta nao incrementa contador.
   */
  const shortStatus =
    await inspectRateLimit({
      request,
      scope:
        "admin:questions:login-failed:15m",
      limit:
        LOGIN_SHORT_LIMIT,
      windowSeconds:
        LOGIN_SHORT_WINDOW_SECONDS,
    });

  const longStatus =
    await inspectRateLimit({
      request,
      scope:
        "admin:questions:login-failed:24h",
      limit:
        LOGIN_24H_LIMIT,
      windowSeconds:
        LOGIN_24H_WINDOW_SECONDS,
    });

  if (
    !shortStatus.allowed ||
    !longStatus.allowed
  ) {
    const retryAfter =
      Math.max(
        !shortStatus.allowed
          ? shortStatus
              .retryAfterSeconds
          : 0,

        !longStatus.allowed
          ? longStatus
              .retryAfterSeconds
          : 0,

        1,
      );

    return tooManyAttempts(
      retryAfter,
    );
  }

  const body =
    (
      await request
        .json()
        .catch(
          () => ({}),
        )
    ) as {
      accessCode?: unknown;
    };

  const accessCode =
    typeof body.accessCode ===
      "string"
      ? body.accessCode.trim()
      : "";

  const validAccessCode =
    accessCode.length >= 32 &&
    accessCode.length <= 200 &&
    verifyQuestionsAdminAccessCode(
      accessCode,
    );

  /*
   * Somente uma tentativa que efetivamente falhou
   * na autenticacao consome os contadores.
   */
  if (!validAccessCode) {

    const shortFailure =
      await consumeRateLimit({
        request,
        scope:
          "admin:questions:login-failed:15m",
        limit:
          LOGIN_SHORT_LIMIT,
        windowSeconds:
          LOGIN_SHORT_WINDOW_SECONDS,
      });

    const longFailure =
      await consumeRateLimit({
        request,
        scope:
          "admin:questions:login-failed:24h",
        limit:
          LOGIN_24H_LIMIT,
        windowSeconds:
          LOGIN_24H_WINDOW_SECONDS,
      });

    /*
     * A tentativa que atinge o limite ja ativa
     * imediatamente o bloqueio temporario.
     */
    if (
      shortFailure.count >=
        LOGIN_SHORT_LIMIT ||
      longFailure.count >=
        LOGIN_24H_LIMIT
    ) {
      const shortRetryAfter =
        shortFailure.count >=
          LOGIN_SHORT_LIMIT
          ? Math.max(
              1,
              Math.ceil(
                (
                  Date.parse(
                    shortFailure.resetAt,
                  ) -
                  Date.now()
                ) /
                1000,
              ),
            )
          : 0;

      const longRetryAfter =
        longFailure.count >=
          LOGIN_24H_LIMIT
          ? Math.max(
              1,
              Math.ceil(
                (
                  Date.parse(
                    longFailure.resetAt,
                  ) -
                  Date.now()
                ) /
                1000,
              ),
            )
          : 0;

      const retryAfter =
        Math.max(
          shortRetryAfter,
          longRetryAfter,
          1,
        );

      return tooManyAttempts(
        retryAfter,
      );
    }

    return noStoreJson(
      {
        ok: false,
        error:
          "Acesso não autorizado.",
      },
      401,
    );
  }

  /*
   * Login correto:
   * nenhum contador de falha e incrementado.
   */
  const token =
    createQuestionsAdminSessionToken();

  const response =
    noStoreJson(
      {
        ok: true,
      },
      200,
    );

  response.cookies.set({
    name:
      QUESTIONS_ADMIN_COOKIE,

    value:
      token,

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path:
      "/",

    maxAge:
      QUESTIONS_ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}