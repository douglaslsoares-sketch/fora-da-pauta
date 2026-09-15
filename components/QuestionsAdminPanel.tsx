"use client";

import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useState,
} from "react";

type AdminQuestion = {
  id: string;
  inputType: string;
  rawTranscript: string | null;
  confirmedText: string;
  status: string;
  responseText: string | null;
  isPublic: boolean;
  responsePublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

function getErrorMessage(
  body: unknown,
  fallback: string,
) {
  if (
    body &&
    typeof body === "object"
  ) {
    const error =
      (
        body as Record<
          string,
          unknown
        >
      ).error;

    if (
      typeof error === "string" &&
      error.trim()
    ) {
      return error;
    }
  }

  return fallback;
}

function QuestionCard({
  item,
  onSaved,
}: {
  item: AdminQuestion;
  onSaved: () => Promise<void>;
}) {
  const [
    responseText,
    setResponseText,
  ] = useState(
    item.responseText ?? "",
  );

  const [
    publishPublicly,
    setPublishPublicly,
  ] = useState(
    item.isPublic,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const isHidden =
    item.status === "hidden";

  async function save() {
    const answer =
      responseText.trim();

    if (!answer) {
      setMessage(
        "Escreva a resposta antes de salvar.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/perguntas/responder",
          {
            method: "POST",

            credentials:
              "same-origin",

            headers: {
              "Content-Type":
                "application/json; charset=utf-8",
            },

            body:
              JSON.stringify({
                questionId:
                  item.id,

                responseText:
                  answer,

                publishPublicly,
              }),
          },
        );

      const body: unknown =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            "Não foi possível salvar a resposta.",
          ),
        );
      }

      await onSaved();

      setMessage(
        publishPublicly
          ? "Resposta salva e publicada na Home."
          : "Resposta salva. Ela está disponível no link individual, mas não na Home.",
      );
    }
    catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a resposta.",
      );
    }
    finally {
      setSaving(false);
    }
  }

  const statusText =
    item.status === "pending"
      ? "Aguardando resposta"
      : item.status === "answered"
        ? item.isPublic
          ? "Respondida e pública"
          : "Respondida — não pública"
        : "Indisponível";

  return (
    <article className="border border-black/15 bg-white/45 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
            {statusText}
          </p>

          <p className="mt-2 text-xs text-black/40">
            Recebida em{" "}
            {formatDate(
              item.createdAt,
            )}
          </p>
        </div>

        {item.inputType ===
        "voice" ? (
          <span className="border border-black/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">
            Áudio
          </span>
        ) : (
          <span className="border border-black/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">
            Texto
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
          Pergunta
        </p>

        <p className="mt-2 text-lg font-semibold leading-8">
          {item.confirmedText}
        </p>
      </div>

      {item.inputType ===
        "voice" &&
      item.rawTranscript &&
      item.rawTranscript !==
        item.confirmedText ? (
        <details className="mt-5 border-t border-black/10 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-black/55">
            Ver transcrição original
          </summary>

          <p className="mt-3 text-sm leading-7 text-black/55">
            {item.rawTranscript}
          </p>
        </details>
      ) : null}

      {isHidden ? (
        <p className="mt-6 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/65">
          Esta pergunta está indisponível e não pode ser respondida por este painel.
        </p>
      ) : (
        <>
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold">
              Resposta
            </span>

            <textarea
              value={
                responseText
              }
              onChange={(
                event,
              ) => {
                setResponseText(
                  event.target.value,
                );

                setMessage("");
              }}
              rows={6}
              maxLength={10000}
              placeholder="Escreva aqui a resposta."
              className="w-full resize-y border border-black/20 bg-[#eeeee9] px-4 py-4 text-base leading-7 outline-none transition focus:border-black"
            />

            <span className="mt-1 block text-right text-xs text-black/35">
              {responseText.length}/10000
            </span>
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 border border-black/10 bg-[#eeeee9] p-4 text-sm leading-6">
            <input
              type="checkbox"
              checked={
                publishPublicly
              }
              onChange={(
                event,
              ) => {
                setPublishPublicly(
                  event.target.checked,
                );

                setMessage("");
              }}
              className="mt-1 h-4 w-4"
            />

            <span>
              <strong>
                Publicar também na Home.
              </strong>{" "}
              Se ficar desmarcado, a pessoa verá a resposta pelo link individual, mas ela não aparecerá em “Perguntas e respostas”.
            </span>
          </label>

          {item.status ===
            "answered" ? (
            <p className="mt-4 text-xs leading-6 text-black/45">
              Última atualização:{" "}
              {formatDate(
                item.updatedAt,
              )}
              {item.responsePublishedAt
                ? ` · publicada em ${formatDate(
                    item.responsePublishedAt,
                  )}`
                : ""}
            </p>
          ) : null}

          {message ? (
            <p className="mt-5 border-l-4 border-[#FFC400] pl-4 text-sm leading-6">
              {message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void save();
            }}
            disabled={
              saving ||
              !responseText.trim()
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {saving
              ? "Salvando..."
              : item.status ===
                  "answered"
                ? "Atualizar resposta"
                : "Salvar resposta"}
          </button>
        </>
      )}
    </article>
  );
}

export function QuestionsAdminPanel() {
  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    accessCode,
    setAccessCode,
  ] = useState("");

  const [
    loginLoading,
    setLoginLoading,
  ] = useState(false);

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const [
    questions,
    setQuestions,
  ] = useState<
    AdminQuestion[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  useEffect(() => {
    void checkSession();
  }, []);

  async function checkSession() {
    try {
      const response =
        await fetch(
          "/api/admin/perguntas/session",
          {
            credentials:
              "same-origin",

            cache:
              "no-store",
          },
        );

      const body: unknown =
        await response
          .json()
          .catch(
            () => ({}),
          );

      const active =
        Boolean(
          body &&
          typeof body === "object" &&
          (
            body as Record<
              string,
              unknown
            >
          ).authenticated === true,
        );

      setAuthenticated(
        active,
      );

      if (active) {
        await loadQuestions();
      }
    }
    catch {
      setAuthenticated(
        false,
      );
    }
    finally {
      setCheckingSession(
        false,
      );
    }
  }

  async function login(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const code =
      accessCode.trim();

    if (!code) {
      setLoginError(
        "Informe o código de acesso.",
      );
      return;
    }

    setLoginLoading(
      true,
    );

    setLoginError("");

    try {
      const response =
        await fetch(
          "/api/admin/perguntas/login",
          {
            method:
              "POST",

            credentials:
              "same-origin",

            headers: {
              "Content-Type":
                "application/json; charset=utf-8",
            },

            body:
              JSON.stringify({
                accessCode:
                  code,
              }),
          },
        );

      const body: unknown =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (!response.ok) {
        setLoginError(
          getErrorMessage(
            body,
            "Acesso não autorizado.",
          ),
        );

        return;
      }

      setAccessCode("");
      setAuthenticated(
        true,
      );

      await loadQuestions();
    }
    catch {
      setLoginError(
        "Não foi possível concluir o acesso.",
      );
    }
    finally {
      setLoginLoading(
        false,
      );
    }
  }

  async function loadQuestions() {
    setLoading(
      true,
    );

    setLoadError("");

    try {
      const response =
        await fetch(
          "/api/admin/perguntas",
          {
            credentials:
              "same-origin",

            cache:
              "no-store",
          },
        );

      const body: unknown =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        response.status === 401
      ) {
        setAuthenticated(
          false,
        );

        setQuestions([]);

        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            "Não foi possível carregar as perguntas.",
          ),
        );
      }

      if (
        !body ||
        typeof body !== "object"
      ) {
        throw new Error(
          "Resposta inválida do servidor.",
        );
      }

      const value =
        (
          body as Record<
            string,
            unknown
          >
        ).questions;

      if (
        !Array.isArray(
          value,
        )
      ) {
        throw new Error(
          "Resposta inválida do servidor.",
        );
      }

      setQuestions(
        value as AdminQuestion[],
      );
    }
    catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as perguntas.",
      );
    }
    finally {
      setLoading(
        false,
      );
    }
  }

  async function logout() {
    try {
      await fetch(
        "/api/admin/perguntas/logout",
        {
          method:
            "POST",

          credentials:
            "same-origin",
        },
      );
    }
    finally {
      setAuthenticated(
        false,
      );

      setQuestions([]);
      setAccessCode("");
      setLoginError("");
    }
  }

  if (
    checkingSession
  ) {
    return (
      <p className="mt-8 text-sm text-black/50">
        Verificando acesso...
      </p>
    );
  }

  if (
    !authenticated
  ) {
    return (
      <form
        onSubmit={login}
        className="mt-10 max-w-xl border border-black/15 bg-white/45 p-6 sm:p-8"
      >
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/50">
            Código de acesso
          </span>

          <input
            type="password"
            value={
              accessCode
            }
            onChange={(
              event,
            ) => {
              setAccessCode(
                event.target.value,
              );

              setLoginError("");
            }}
            autoComplete="off"
            spellCheck={false}
            required
            placeholder="Cole aqui o código"
            className="w-full border border-black/20 bg-[#eeeee9] px-4 py-3 text-base outline-none transition focus:border-black"
          />

          <span className="mt-2 block text-right text-xs text-black/40">
            {accessCode.length} caracteres
          </span>
        </label>

        {loginError ? (
          <p className="mt-5 border-l-4 border-[#FFC400] pl-4 text-sm leading-6">
            {loginError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            loginLoading
          }
          className="mt-6 inline-flex min-h-11 items-center justify-center bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
        >
          {loginLoading
            ? "Verificando..."
            : "Acessar painel"}
        </button>

        <p className="mt-6 text-xs leading-6 text-black/40">
          Área restrita. O código é usado somente para autenticar esta sessão.
        </p>
      </form>
    );
  }

  const pendingCount =
    questions.filter(
      (item) =>
        item.status ===
          "pending",
    ).length;

  const answeredCount =
    questions.filter(
      (item) =>
        item.status ===
          "answered",
    ).length;

  const publicCount =
    questions.filter(
      (item) =>
        item.status ===
          "answered" &&
        item.isPublic,
    ).length;

  const orderedQuestions =
    [...questions].sort(
      (a, b) => {
        if (
          a.status === "pending" &&
          b.status !== "pending"
        ) {
          return -1;
        }

        if (
          a.status !== "pending" &&
          b.status === "pending"
        ) {
          return 1;
        }

        return (
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime()
        );
      },
    );

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-5 border-y border-black/10 py-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <p>
            <strong>
              {pendingCount}
            </strong>{" "}
            aguardando
          </p>

          <p>
            <strong>
              {answeredCount}
            </strong>{" "}
            respondidas
          </p>

          <p>
            <strong>
              {publicCount}
            </strong>{" "}
            públicas
          </p>
        </div>

        <div className="flex gap-5">
          <button
            type="button"
            onClick={() => {
              void loadQuestions();
            }}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Atualizar
          </button>

          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Encerrar acesso
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="mt-6 border-l-4 border-[#FFC400] pl-4 text-sm leading-6">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-black/50">
          Carregando perguntas...
        </p>
      ) : orderedQuestions.length ===
        0 ? (
        <p className="mt-8 border border-black/15 p-6 text-sm text-black/50">
          Não há perguntas registradas.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {orderedQuestions.map(
            (item) => (
              <QuestionCard
                key={
                  item.id
                }
                item={
                  item
                }
                onSaved={
                  loadQuestions
                }
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}