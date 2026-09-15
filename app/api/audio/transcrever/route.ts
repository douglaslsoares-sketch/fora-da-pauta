import { NextResponse } from "next/server";
import { experimental_transcribe as transcribe } from "ai";
import { gateway } from "@ai-sdk/gateway";

import {
  consumeRateLimit,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES =
  3 * 1024 * 1024;

/*
 * Inclui uma margem para o envelope multipart/form-data.
 * O arquivo de audio continua limitado a 3 MB.
 */
const MAX_REQUEST_BYTES =
  4 * 1024 * 1024;

const AUDIO_BURST_LIMIT = 10;
const AUDIO_BURST_WINDOW_SECONDS =
  10 * 60;

const AUDIO_24H_LIMIT = 60;
const AUDIO_24H_WINDOW_SECONDS =
  24 * 60 * 60;

const ACCEPTED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
]);

function isAcceptedAudioType(
  value: string,
) {
  if (!value) {
    return true;
  }

  const baseType =
    value
      .toLowerCase()
      .split(";")[0]
      ?.trim();

  return Boolean(
    baseType &&
      ACCEPTED_AUDIO_TYPES.has(
        baseType,
      ),
  );
}

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  /*
   * Alguns clientes legitimos podem nao enviar Origin.
   * A ausencia nao desliga o rate limit.
   */
  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).origin ===
      new URL(request.url).origin
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
    bytes > MAX_REQUEST_BYTES
  );
}

function tooManyRequests(
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    {
      error:
        "Muitas tentativas de transcrição em pouco tempo. Aguarde um pouco e tente novamente.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control":
          "no-store",

        "Retry-After":
          String(
            Math.max(
              1,
              retryAfterSeconds,
            ),
          ),
      },
    },
  );
}

export async function POST(
  request: Request,
) {
  try {

    /*
     * Impede que uma pagina de outro site use o navegador
     * de terceiros para consumir o servico de transcricao.
     */
    if (
      !isSameOrigin(
        request,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Origem da requisição não permitida.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * Rejeita antecipadamente corpos declaradamente grandes,
     * antes de processar multipart/form-data.
     */
    if (
      declaredRequestTooLarge(
        request,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O áudio ficou grande demais. Grave uma resposta mais curta.",
        },
        {
          status: 413,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * Limite curto contra rajadas.
     */
    const burstLimit =
      await consumeRateLimit({
        request,
        scope:
          "audio:transcribe:10m",
        limit:
          AUDIO_BURST_LIMIT,
        windowSeconds:
          AUDIO_BURST_WINDOW_SECONDS,
      });

    if (!burstLimit.allowed) {
      return tooManyRequests(
        burstLimit
          .retryAfterSeconds,
      );
    }

    /*
     * Limite mais amplo para evitar consumo prolongado.
     */
    const longLimit =
      await consumeRateLimit({
        request,
        scope:
          "audio:transcribe:24h",
        limit:
          AUDIO_24H_LIMIT,
        windowSeconds:
          AUDIO_24H_WINDOW_SECONDS,
      });

    if (!longLimit.allowed) {
      return tooManyRequests(
        longLimit
          .retryAfterSeconds,
      );
    }

    const formData =
      await request.formData();

    const audio =
      formData.get(
        "audio",
      );

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Áudio não enviado.",
        },
        {
          status: 400,
        },
      );
    }

    if (audio.size <= 0) {
      return NextResponse.json(
        {
          error:
            "O áudio está vazio.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      audio.size >
      MAX_AUDIO_BYTES
    ) {
      return NextResponse.json(
        {
          error:
            "O áudio ficou grande demais. Grave uma resposta mais curta.",
        },
        {
          status: 413,
        },
      );
    }

    if (
      !isAcceptedAudioType(
        audio.type,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Formato de áudio não suportado no momento.",
        },
        {
          status: 415,
        },
      );
    }

    const bytes =
      new Uint8Array(
        await audio.arrayBuffer(),
      );

    const result =
      await transcribe({
        model:
          gateway.transcriptionModel(
            "google/gemini-3.5-transcribe",
          ),

        audio:
          bytes,

        abortSignal:
          AbortSignal.timeout(
            45000,
          ),
      });

    const text =
      result.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Não conseguimos entender o áudio. Tente falar novamente.",
        },
        {
          status: 422,
        },
      );
    }

    if (
      text.length >
      20000
    ) {
      return NextResponse.json(
        {
          error:
            "A transcrição excedeu o tamanho permitido.",
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json(
      {
        text,

        language:
          result.language ??
          null,

        durationInSeconds:
          result
            .durationInSeconds ??
          null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
  catch (error) {
    console.error(
      "Falha ao transcrever áudio:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível transcrever o áudio.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}