"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

type TrackingData = {
  questionId: string;
  question: string;
  status: string;
  answer: string | null;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type QuestionTrackingExperienceProps = {
  token: string;
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );
}

export function QuestionTrackingExperience({
  token,
}: QuestionTrackingExperienceProps) {
  const [
    data,
    setData,
  ] =
    useState<TrackingData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    void load();
  }, [token]);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/perguntas/acompanhar?token=${encodeURIComponent(
            token,
          )}`,
          {
            cache: "no-store",
          },
        );

      const body: unknown =
        await response.json();

      if (!response.ok) {
        const message =
          body &&
          typeof body === "object" &&
          typeof (
            body as Record<
              string,
              unknown
            >
          ).error === "string"
            ? String(
                (
                  body as Record<
                    string,
                    unknown
                  >
                ).error,
              )
            : "Não foi possível consultar esta pergunta.";

        throw new Error(
          message,
        );
      }

      setData(
        body as TrackingData,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível consultar esta pergunta.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <p className="text-base leading-7 text-black/55">
        Consultando sua pergunta...
      </p>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <div>
        <p
          className="border-l-4 border-[#FFC400] pl-5 text-base leading-7 text-black/65"
          role="alert"
        >
          {error ||
            "Pergunta não encontrada."}
        </p>

        <Link
          href="/#perguntas"
          className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
        >
          Voltar ao Fora da Pauta
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
        Acompanhamento
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
        Sua pergunta
      </h1>

      <div className="mt-8 border border-black/15 bg-white/45 p-5 sm:p-6">
        <p className="text-base font-semibold leading-7">
          {data.question}
        </p>

        <p className="mt-3 text-xs text-black/40">
          Enviada em{" "}
          {formatDate(
            data.createdAt,
          )}
        </p>
      </div>

      {data.status ===
      "pending" ? (
        <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
          <p className="font-semibold leading-7">
            Aguardando resposta.
          </p>

          <p className="mt-2 text-sm leading-7 text-black/55">
            Quando a resposta for publicada, este mesmo link passará a mostrá-la.
          </p>
        </div>
      ) : data.status ===
          "answered" &&
        data.answer ? (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">
            Resposta
          </p>

          <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-black/70">
            {data.answer}
          </p>

          {data.publishedAt ? (
            <p className="mt-4 text-xs text-black/40">
              Respondida em{" "}
              {formatDate(
                data.publishedAt,
              )}
            </p>
          ) : null}

          {data.isPublic ? (
            <p className="mt-5 text-sm leading-7 text-black/50">
              Esta pergunta e esta resposta também estão publicadas na página inicial.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
          <p className="font-semibold leading-7">
            Esta pergunta não está disponível para publicação.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-5">
        <button
          type="button"
          onClick={() => {
            void load();
          }}
          className="text-sm font-semibold underline underline-offset-4"
        >
          Atualizar situação
        </button>

        <Link
          href="/#perguntas"
          className="text-sm font-semibold underline underline-offset-4"
        >
          Voltar ao Fora da Pauta
        </Link>
      </div>
    </div>
  );
}