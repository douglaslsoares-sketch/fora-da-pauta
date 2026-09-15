"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  AudioTextInput,
} from "@/components/AudioTextInput";

type InputType =
  | "voice"
  | "text";

type SubmittedQuestion = {
  trackingPath: string;
  createdAt: string;
};

type PublicAnswer = {
  id: string;
  question: string;
  answer: string;
  publishedAt: string | null;
};

const STORAGE_KEY =
  "foradapauta:perguntas:v1";

function validTrackingPath(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^\/pergunta\/[A-Za-z0-9_-]{30,100}$/.test(
      value,
    )
  );
}

function formatDate(
  value: string,
) {
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

export function PublicQuestionsExperience() {
  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    rawTranscript,
    setRawTranscript,
  ] = useState<string | null>(
    null,
  );

  const [
    inputType,
    setInputType,
  ] = useState<InputType>(
    "text",
  );

  const [
    website,
    setWebsite,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] =
    useState<SubmittedQuestion | null>(
      null,
    );

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    savedQuestions,
    setSavedQuestions,
  ] = useState<SubmittedQuestion[]>(
    [],
  );

  const [
    answers,
    setAnswers,
  ] = useState<PublicAnswer[]>(
    [],
  );

  const [
    answersLoading,
    setAnswersLoading,
  ] = useState(true);

  const [
    answersError,
    setAnswersError,
  ] = useState("");

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (stored) {
        const parsed: unknown =
          JSON.parse(stored);

        if (
          Array.isArray(parsed)
        ) {
          const valid =
            parsed
              .filter(
                (
                  item,
                ): item is SubmittedQuestion =>
                  Boolean(
                    item &&
                      typeof item === "object" &&
                      validTrackingPath(
                        (
                          item as Record<
                            string,
                            unknown
                          >
                        ).trackingPath,
                      ) &&
                      typeof (
                        item as Record<
                          string,
                          unknown
                        >
                      ).createdAt === "string",
                  ),
              )
              .slice(
                0,
                20,
              );

          setSavedQuestions(
            valid,
          );
        }
      }
    } catch {
      // Armazenamento local é apenas uma conveniência.
    }

    void loadAnswers();
  }, []);

  async function loadAnswers() {
    setAnswersLoading(true);
    setAnswersError("");

    try {
      const response =
        await fetch(
          "/api/perguntas?limit=30",
          {
            cache: "no-store",
          },
        );

      const data: unknown =
        await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          typeof (
            data as Record<
              string,
              unknown
            >
          ).error === "string"
            ? String(
                (
                  data as Record<
                    string,
                    unknown
                  >
                ).error,
              )
            : "Não foi possível carregar as perguntas e respostas.";

        throw new Error(
          message,
        );
      }

      if (
        !data ||
        typeof data !== "object" ||
        !Array.isArray(
          (
            data as Record<
              string,
              unknown
            >
          ).questions,
        )
      ) {
        throw new Error(
          "A lista de perguntas retornou um formato inválido.",
        );
      }

      const rows =
        (
          data as {
            questions: unknown[];
          }
        ).questions;

      const valid =
        rows.filter(
          (
            row,
          ): row is PublicAnswer =>
            Boolean(
              row &&
                typeof row === "object" &&
                typeof (
                  row as Record<
                    string,
                    unknown
                  >
                ).id === "string" &&
                typeof (
                  row as Record<
                    string,
                    unknown
                  >
                ).question === "string" &&
                typeof (
                  row as Record<
                    string,
                    unknown
                  >
                ).answer === "string",
            ),
        );

      setAnswers(
        valid,
      );
    } catch (error) {
      setAnswersError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as perguntas e respostas.",
      );
    } finally {
      setAnswersLoading(false);
    }
  }

  function saveTrackingLink(
    item: SubmittedQuestion,
  ) {
    const next = [
      item,
      ...savedQuestions.filter(
        (saved) =>
          saved.trackingPath !==
          item.trackingPath,
      ),
    ].slice(
      0,
      20,
    );

    setSavedQuestions(
      next,
    );

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          next,
        ),
      );
    } catch {
      // O link continua disponível na tela.
    }
  }

  async function submitQuestion() {
    const confirmedText =
      question.trim();

    if (!confirmedText) {
      setSubmitError(
        "Escreva ou grave sua pergunta antes de enviar.",
      );
      return;
    }

    if (
      confirmedText.length > 2000
    ) {
      setSubmitError(
        "A pergunta ficou longa demais. Reduza o texto antes de enviar.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setCopied(false);

    try {
      const response =
        await fetch(
          "/api/perguntas",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              confirmedText,
              rawTranscript,
              inputType,
              website,
            }),
          },
        );

      const data: unknown =
        await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          typeof (
            data as Record<
              string,
              unknown
            >
          ).error === "string"
            ? String(
                (
                  data as Record<
                    string,
                    unknown
                  >
                ).error,
              )
            : "Não foi possível enviar a pergunta.";

        throw new Error(
          message,
        );
      }

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "O envio retornou um formato inválido.",
        );
      }

      const trackingPath =
        (
          data as Record<
            string,
            unknown
          >
        ).trackingPath;

      const createdAt =
        (
          data as Record<
            string,
            unknown
          >
        ).createdAt;

      if (
        !validTrackingPath(
          trackingPath,
        ) ||
        typeof createdAt !== "string"
      ) {
        throw new Error(
          "Não foi possível criar o link de acompanhamento.",
        );
      }

      const item = {
        trackingPath,
        createdAt,
      };

      setSubmitted(
        item,
      );

      saveTrackingLink(
        item,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a pergunta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyTrackingLink() {
    if (
      !submitted ||
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const url =
      `${window.location.origin}${submitted.trackingPath}`;

    try {
      await navigator.clipboard.writeText(
        url,
      );

      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function resetForm() {
    setQuestion("");
    setRawTranscript(null);
    setInputType("text");
    setWebsite("");
    setSubmitted(null);
    setSubmitError("");
    setCopied(false);
  }

  return (
    <>
      <div className="mt-8 border border-black/15 bg-[#eeeee9] p-5 sm:p-6">
        {submitted ? (
          <div>
            <p className="text-xl font-semibold tracking-[-0.025em]">
              Pergunta enviada.
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
              Guarde o link abaixo. Ele mostra se a pergunta ainda está aguardando resposta e leva diretamente à resposta quando ela for publicada.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={
                  submitted.trackingPath
                }
                className="inline-flex min-h-11 items-center justify-center bg-black px-5 py-2.5 text-sm font-semibold text-white"
              >
                Acompanhar minha pergunta
              </Link>

              <button
                type="button"
                onClick={() => {
                  void copyTrackingLink();
                }}
                className="inline-flex min-h-11 items-center justify-center border border-black/20 px-5 py-2.5 text-sm font-semibold text-black"
              >
                {copied
                  ? "Link copiado"
                  : "Copiar link"}
              </button>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="mt-5 text-sm font-semibold underline underline-offset-4"
            >
              Fazer outra pergunta
            </button>
          </div>
        ) : (
          <div>
            <AudioTextInput
              id="pergunta-publica"
              label="Sua pergunta sobre o Fora da Pauta"
              value={question}
              onChange={(value) => {
                setQuestion(
                  value,
                );

                if (
                  rawTranscript ===
                  null
                ) {
                  setInputType(
                    "text",
                  );
                }
              }}
              onTranscribed={(
                transcript,
              ) => {
                setRawTranscript(
                  transcript,
                );

                setInputType(
                  "voice",
                );
              }}
              placeholder="Sua pergunta aparecerá aqui para você conferir antes do envio."
              helperText="Fale ou escreva. Antes de enviar, confira o texto."
              rows={5}
              maxLength={2000}
            />

            <div
              className="hidden"
              aria-hidden="true"
            >
              <label htmlFor="website">
                Website
              </label>

              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(
                  event,
                ) => {
                  setWebsite(
                    event.target.value,
                  );
                }}
              />
            </div>

            <p className="mt-4 text-sm leading-7 text-black/50">
              O áudio é usado para produzir a transcrição. Nesta versão, a gravação da voz não é armazenada pelo sistema de perguntas. O texto só é enviado depois que você o confere.
            </p>

            {submitError ? (
              <p
                className="mt-4 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/70"
                role="alert"
              >
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                void submitQuestion();
              }}
              disabled={
                isSubmitting ||
                !question.trim()
              }
              className="mt-5 inline-flex min-h-11 items-center justify-center bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? "Enviando..."
                : "Confirmar e enviar"}
            </button>
          </div>
        )}
      </div>

      {savedQuestions.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold">
            Suas perguntas neste dispositivo
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {savedQuestions.map(
              (
                item,
                index,
              ) => (
                <Link
                  key={
                    item.trackingPath
                  }
                  href={
                    item.trackingPath
                  }
                  className="text-sm leading-6 text-black/60 underline underline-offset-4"
                >
                  Pergunta{" "}
                  {
                    savedQuestions.length -
                    index
                  }
                  {formatDate(
                    item.createdAt,
                  )
                    ? ` — enviada em ${formatDate(
                        item.createdAt,
                      )}`
                    : ""}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-[-0.035em]">
            Perguntas e respostas
          </h3>

          <button
            type="button"
            onClick={() => {
              void loadAnswers();
            }}
            disabled={
              answersLoading
            }
            className="text-sm font-semibold underline underline-offset-4 disabled:opacity-40"
          >
            Atualizar
          </button>
        </div>

        <div
          id="perguntas-e-respostas"
          className="mt-5 max-h-80 overflow-y-auto border border-black/15 bg-[#eeeee9] p-5 sm:p-6"
        >
          {answersLoading ? (
            <p className="text-sm leading-7 text-black/45">
              Carregando perguntas e respostas...
            </p>
          ) : answersError ? (
            <p
              className="text-sm leading-7 text-black/60"
              role="alert"
            >
              {answersError}
            </p>
          ) : answers.length === 0 ? (
            <p className="text-sm leading-7 text-black/45">
              Ainda não há perguntas respondidas publicadas.
            </p>
          ) : (
            <div className="divide-y divide-black/10">
              {answers.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                      Pergunta
                    </p>

                    <p className="mt-2 text-base font-semibold leading-7">
                      {item.question}
                    </p>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                      Resposta
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-black/65">
                      {item.answer}
                    </p>

                    {item.publishedAt ? (
                      <p className="mt-3 text-xs text-black/35">
                        Publicada em{" "}
                        {formatDate(
                          item.publishedAt,
                        )}
                      </p>
                    ) : null}
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}