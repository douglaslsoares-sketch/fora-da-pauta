"use client";

import { FormEvent, useMemo, useState } from "react";

type InterpretedTopic = {
  interpretedTopicId: string;
  slug: string;
  name: string;
  description: string;
  sourceExcerpt: string;
};

type InterpretationResponse = {
  interpretationId: string;
  summary: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  topics: InterpretedTopic[];
};

type Step =
  | "answer"
  | "processing"
  | "clarify"
  | "review"
  | "confirming"
  | "done"
  | "error";

const PARTICIPANT_KEY =
  "fora-da-pauta:interesses:participant-key";

const MAX_CLARIFICATION_TURNS = 3;

function createParticipantKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getParticipantKey() {
  const existing =
    window.localStorage.getItem(PARTICIPANT_KEY);

  if (existing && existing.length >= 20) {
    return existing;
  }

  const created = createParticipantKey();

  window.localStorage.setItem(
    PARTICIPANT_KEY,
    created,
  );

  return created;
}

function getErrorMessage(
  data: unknown,
  fallback: string,
) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error?: unknown }).error ===
      "string"
  ) {
    return (data as { error: string }).error;
  }

  return fallback;
}

function getClarificationQuestion(
  data: unknown,
) {
  if (
    data &&
    typeof data === "object" &&
    "clarificationQuestion" in data &&
    typeof (
      data as {
        clarificationQuestion?: unknown;
      }
    ).clarificationQuestion === "string"
  ) {
    return (
      data as {
        clarificationQuestion: string;
      }
    ).clarificationQuestion;
  }

  return null;
}

function normalizeInterpretation(
  data: unknown,
): InterpretationResponse {
  if (!data || typeof data !== "object") {
    throw new Error(
      "A interpretação retornou um formato inválido.",
    );
  }

  const raw = data as Record<string, unknown>;

  const interpretationId =
    typeof raw.interpretationId === "string"
      ? raw.interpretationId
      : typeof raw.id === "string"
        ? raw.id
        : null;

  if (!interpretationId) {
    throw new Error(
      "A interpretação não retornou um identificador válido.",
    );
  }

  const rawTopics =
    Array.isArray(raw.topics)
      ? raw.topics
      : [];

  const topics: InterpretedTopic[] =
    rawTopics.flatMap((value) => {
      if (
        !value ||
        typeof value !== "object"
      ) {
        return [];
      }

      const topic =
        value as Record<string, unknown>;

      if (
        typeof topic.interpretedTopicId !== "string" ||
        typeof topic.slug !== "string" ||
        typeof topic.name !== "string" ||
        typeof topic.description !== "string" ||
        typeof topic.sourceExcerpt !== "string"
      ) {
        return [];
      }

      return [
        {
          interpretedTopicId:
            topic.interpretedTopicId,
          slug: topic.slug,
          name: topic.name,
          description: topic.description,
          sourceExcerpt: topic.sourceExcerpt,
        },
      ];
    });

  return {
    interpretationId,
    summary:
      typeof raw.summary === "string"
        ? raw.summary
        : "",
    needsClarification:
      raw.needsClarification === true,
    clarificationQuestion:
      typeof raw.clarificationQuestion ===
      "string"
        ? raw.clarificationQuestion
        : null,
    topics,
  };
}

export function SeusInteressesExperience() {
  const [step, setStep] =
    useState<Step>("answer");

  const [answer, setAnswer] = useState("");
  const [clarificationAnswer, setClarificationAnswer] =
    useState("");

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [interpretation, setInterpretation] =
    useState<InterpretationResponse | null>(null);

  const [clarificationQuestion, setClarificationQuestion] =
    useState<string | null>(null);

  const [clarificationTurns, setClarificationTurns] =
    useState(0);

  const [selectedTopicIds, setSelectedTopicIds] =
    useState<string[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");

  const selectedTopics = useMemo(() => {
    if (!interpretation) {
      return [];
    }

    return interpretation.topics.filter((topic) =>
      selectedTopicIds.includes(
        topic.interpretedTopicId,
      ),
    );
  }, [interpretation, selectedTopicIds]);

  function startFreshAnswer() {
    setStep("answer");
    setAnswer("");
    setClarificationAnswer("");
    setSessionId(null);
    setInterpretation(null);
    setClarificationQuestion(null);
    setClarificationTurns(0);
    setSelectedTopicIds([]);
    setErrorMessage("");
  }

  function correctOriginalAnswer() {
    setStep("answer");
    setClarificationAnswer("");
    setSessionId(null);
    setInterpretation(null);
    setClarificationQuestion(null);
    setClarificationTurns(0);
    setSelectedTopicIds([]);
    setErrorMessage("");
  }

  function toggleTopic(id: string) {
    setSelectedTopicIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function createSession() {
    const participantKey = getParticipantKey();

    const response = await fetch(
      "/api/interesses/session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "text",
          participantKey,
        }),
      },
    );

    const data: unknown =
      await response.json();

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "Não foi possível iniciar a conversa.",
        ),
      );
    }

    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "A sessão retornou um formato inválido.",
      );
    }

    const raw =
      data as Record<string, unknown>;

    const createdSessionId =
      typeof raw.sessionId === "string"
        ? raw.sessionId
        : typeof raw.id === "string"
          ? raw.id
          : null;

    if (!createdSessionId) {
      throw new Error(
        "A sessão foi criada, mas não retornou um identificador válido.",
      );
    }

    return createdSessionId;
  }

  async function sendInputAndInterpret(
    text: string,
    activeSessionId: string,
  ) {
    const inputResponse = await fetch(
      "/api/interesses/entrada",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          text,
        }),
      },
    );

    const inputData: unknown =
      await inputResponse.json();

    if (!inputResponse.ok) {
      throw new Error(
        getErrorMessage(
          inputData,
          "Não foi possível registrar sua resposta.",
        ),
      );
    }

    if (
      !inputData ||
      typeof inputData !== "object"
    ) {
      throw new Error(
        "A resposta foi registrada, mas retornou um formato inválido.",
      );
    }

    const inputRaw =
      inputData as Record<string, unknown>;

    const inputId =
      typeof inputRaw.inputId === "string"
        ? inputRaw.inputId
        : typeof inputRaw.userInputId === "string"
          ? inputRaw.userInputId
          : typeof inputRaw.id === "string"
            ? inputRaw.id
            : null;

    if (!inputId) {
      throw new Error(
        "A resposta foi registrada, mas não retornou um identificador válido.",
      );
    }

    const interpretationResponse = await fetch(
      "/api/interesses/interpretar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          inputId,
        }),
      },
    );

    const interpretationData: unknown =
      await interpretationResponse.json();

    if (!interpretationResponse.ok) {
      const question =
        getClarificationQuestion(
          interpretationData,
        );

      if (
        interpretationResponse.status === 422 &&
        question
      ) {
        return {
          clarificationOnly: true as const,
          question,
        };
      }

      throw new Error(
        getErrorMessage(
          interpretationData,
          "Não foi possível interpretar sua resposta.",
        ),
      );
    }

    return {
      clarificationOnly: false as const,
      interpretation:
        normalizeInterpretation(
          interpretationData,
        ),
    };
  }

  function showInterpretationResult(
    result:
      | {
          clarificationOnly: true;
          question: string;
        }
      | {
          clarificationOnly: false;
          interpretation: InterpretationResponse;
        },
  ) {
    if (result.clarificationOnly) {
      setClarificationQuestion(
        result.question,
      );
      setClarificationAnswer("");
      setStep("clarify");
      return;
    }

    const normalized =
      result.interpretation;

    if (
      normalized.needsClarification &&
      normalized.clarificationQuestion
    ) {
      setInterpretation(normalized);
      setClarificationQuestion(
        normalized.clarificationQuestion,
      );
      setClarificationAnswer("");
      setStep("clarify");
      return;
    }

    setInterpretation(normalized);
    setClarificationQuestion(null);

    setSelectedTopicIds(
      normalized.topics.map(
        (topic) =>
          topic.interpretedTopicId,
      ),
    );

    setStep("review");
  }

  async function submitAnswer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text = answer.trim();

    if (text.length < 3) {
      setErrorMessage(
        "Escreva um pouco mais sobre o que você faria.",
      );
      return;
    }

    setErrorMessage("");
    setStep("processing");

    try {
      const newSessionId =
        await createSession();

      setSessionId(newSessionId);

      const result =
        await sendInputAndInterpret(
          text,
          newSessionId,
        );

      showInterpretationResult(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
      );
      setStep("error");
    }
  }

  async function submitClarification(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text =
      clarificationAnswer.trim();

    if (text.length < 3) {
      setErrorMessage(
        "Conte um pouco mais para conseguirmos entender.",
      );
      return;
    }

    if (!sessionId) {
      setErrorMessage(
        "A conversa perdeu a sessão. Recomece sua resposta.",
      );
      setStep("error");
      return;
    }

    if (
      clarificationTurns >=
      MAX_CLARIFICATION_TURNS
    ) {
      setErrorMessage(
        "Ainda não conseguimos entender com segurança. Tente reescrever sua resposta desde o começo.",
      );
      setStep("error");
      return;
    }

    setErrorMessage("");
    setStep("processing");

    try {
      const result =
        await sendInputAndInterpret(
          text,
          sessionId,
        );

      setClarificationTurns(
        (current) => current + 1,
      );

      showInterpretationResult(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
      );
      setStep("error");
    }
  }

  async function confirmTopics() {
    if (
      !sessionId ||
      !interpretation
    ) {
      return;
    }

    if (selectedTopics.length === 0) {
      setErrorMessage(
        "Selecione pelo menos um tema antes de confirmar.",
      );
      return;
    }

    setErrorMessage("");
    setStep("confirming");

    try {
      const response = await fetch(
        "/api/interesses/confirmar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            interpretationId:
              interpretation.interpretationId,
            topics: selectedTopics.map(
              (topic) => ({
                interpretedTopicId:
                  topic.interpretedTopicId,
              }),
            ),
          }),
        },
      );

      const data: unknown =
        await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Não foi possível confirmar os temas.",
          ),
        );
      }

      setStep("done");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
      );
      setStep("review");
    }
  }

  if (step === "done") {
    return (
      <section
        className="border-t-4 border-[#FFC400] bg-white p-6 shadow-sm sm:p-8"
        aria-live="polite"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Resposta registrada
        </p>

        <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
          Obrigado.
        </h2>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-black/60">
          Sua resposta foi registrada. Ela ajuda a
          mostrar, de forma agregada, o que é
          importante para quem participa.
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
          O Fora da Pauta não usa esta etapa para
          dizer em quem você deve votar. A próxima
          fase é reunir registros públicos dos
          candidatos relacionados aos temas que
          você mencionou.
        </p>

        <button
          type="button"
          onClick={startFreshAnswer}
          className="mt-7 inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          Fazer outra resposta
        </button>
      </section>
    );
  }

  return (
    <section
      className="border-t-4 border-[#FFC400] bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="seus-interesses-titulo"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
        Seus interesses
      </p>

      <h2
        id="seus-interesses-titulo"
        className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl"
      >
        O que você faria se fosse presidente?
      </h2>

      {step === "answer" ||
      step === "error" ? (
        <form
          onSubmit={submitAnswer}
          className="mt-6"
        >
          <p className="max-w-2xl text-base leading-7 text-black/55">
            Não tem resposta certa ou errada.
            Escreva do seu jeito o que você
            mudaria, faria ou priorizaria.
          </p>

          <label
            htmlFor="interesses-resposta"
            className="sr-only"
          >
            Sua resposta
          </label>

          <textarea
            id="interesses-resposta"
            value={answer}
            onChange={(event) =>
              setAnswer(event.target.value)
            }
            rows={7}
            maxLength={4000}
            placeholder="Ex.: Eu criaria mais empregos, melhoraria a saúde pública e reduziria o custo de vida..."
            className="mt-6 w-full resize-y border border-black/15 bg-[#f8f8f5] px-4 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/30 focus:border-black"
          />

          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-black/35">
            <span>Fale do seu jeito.</span>
            <span>{answer.length}/4000</span>
          </div>

          {errorMessage ? (
            <p
              className="mt-4 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/65"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Continuar
          </button>
        </form>
      ) : null}

      {step === "processing" ? (
        <div
          className="mt-7"
          aria-live="polite"
        >
          <p className="text-lg font-semibold">
            Entendendo sua resposta...
          </p>
          <p className="mt-2 text-sm leading-6 text-black/50">
            Estamos identificando os assuntos que
            você mencionou. Se alguma coisa não
            estiver clara, vamos perguntar antes
            de registrar.
          </p>
        </div>
      ) : null}

      {step === "clarify" ? (
        <form
          onSubmit={submitClarification}
          className="mt-7"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Só para entender melhor
          </p>

          <h3 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight">
            {clarificationQuestion ??
              "Você pode explicar um pouco mais?"}
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
            Responda do seu jeito. Essa resposta
            continua na mesma conversa.
          </p>

          <label
            htmlFor="interesses-esclarecimento"
            className="sr-only"
          >
            Seu esclarecimento
          </label>

          <textarea
            id="interesses-esclarecimento"
            value={clarificationAnswer}
            onChange={(event) =>
              setClarificationAnswer(
                event.target.value,
              )
            }
            rows={5}
            maxLength={4000}
            autoFocus
            placeholder="Conte um pouco mais..."
            className="mt-5 w-full resize-y border border-black/15 bg-[#f8f8f5] px-4 py-4 text-base leading-7 text-black outline-none transition placeholder:text-black/30 focus:border-black"
          />

          {errorMessage ? (
            <p
              className="mt-4 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/65"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Continuar
            </button>

            <button
              type="button"
              onClick={correctOriginalAnswer}
              className="inline-flex min-h-12 items-center justify-center border border-black/15 px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
            >
              Reescrever desde o começo
            </button>
          </div>
        </form>
      ) : null}

      {step === "review" ||
      step === "confirming" ? (
        <div className="mt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Foi isso que entendemos
          </p>

          {interpretation?.summary ? (
            <p className="mt-4 max-w-2xl text-lg leading-8 text-black/65">
              {interpretation.summary}
            </p>
          ) : null}

          <h3 className="mt-7 text-xl font-semibold">
            Temas identificados
          </h3>

          <p className="mt-2 text-sm leading-6 text-black/50">
            Marque apenas os temas que realmente
            fazem parte do que você quis dizer.
          </p>

          <div className="mt-4 space-y-3">
            {interpretation?.topics.map(
              (topic) => {
                const checked =
                  selectedTopicIds.includes(
                    topic.interpretedTopicId,
                  );

                return (
                  <label
                    key={topic.interpretedTopicId}
                    className="flex cursor-pointer gap-4 border border-black/10 bg-[#f8f8f5] p-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleTopic(
                          topic.interpretedTopicId,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-black"
                    />

                    <span>
                      <span className="block font-semibold">
                        {topic.name}
                      </span>

                      <span className="mt-1 block text-sm leading-6 text-black/55">
                        {topic.description}
                      </span>

                      <span className="mt-2 block text-xs leading-5 text-black/35">
                        Trecho da sua resposta: "
                        {topic.sourceExcerpt}"
                      </span>
                    </span>
                  </label>
                );
              },
            )}
          </div>

          {errorMessage ? (
            <p
              className="mt-4 border-l-4 border-[#FFC400] pl-4 text-sm leading-6 text-black/65"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={confirmTopics}
              disabled={
                step === "confirming" ||
                selectedTopics.length === 0
              }
              className="inline-flex min-h-12 items-center justify-center bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === "confirming"
                ? "Confirmando..."
                : "É isso"}
            </button>

            <button
              type="button"
              onClick={correctOriginalAnswer}
              disabled={step === "confirming"}
              className="inline-flex min-h-12 items-center justify-center border border-black/15 px-6 py-3 text-sm font-semibold text-black transition hover:bg-black/5 disabled:opacity-40"
            >
              Corrigir minha resposta
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
