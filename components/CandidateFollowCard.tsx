"use client";

import { useEffect, useState } from "react";

type CandidateFollowCardProps = {
  candidaturaId: string;
};

type Situacao = "conferindo" | "acompanhando" | "disponivel" | "erro";

function normalizarBotUsername(valor: string | undefined) {
  return valor?.trim().replace(/^@/, "") || "ForaDaPautaAcompanhaBot";
}

export function CandidateFollowCard({
  candidaturaId,
}: CandidateFollowCardProps) {
  const [situacao, setSituacao] = useState<Situacao>("conferindo");
  const [tentativa, setTentativa] = useState(0);

  const botUsername = normalizarBotUsername(
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  );
  const telegramHref =
    `https://t.me/${botUsername}?start=${encodeURIComponent(`seguir_${candidaturaId}`)}`;

  useEffect(() => {
    const controller = new AbortController();

    async function conferirAcompanhamento() {
      try {
        const resposta = await fetch("/api/telegram/sessao", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!resposta.ok) throw new Error("Falha ao consultar o Telegram");
        const dados = (await resposta.json()) as {
          ativo?: boolean;
          ids?: unknown;
        };

        if (controller.signal.aborted) return;

        const confirmado =
          dados.ativo === true &&
          Array.isArray(dados.ids) &&
          dados.ids.includes(candidaturaId);

        setSituacao(confirmado ? "acompanhando" : "disponivel");
      } catch {
        if (!controller.signal.aborted) setSituacao("erro");
      }
    }

    void conferirAcompanhamento();
    // Reconfere ao voltar do aplicativo Telegram para a ficha.
    window.addEventListener("focus", conferirAcompanhamento);
    return () => {
      controller.abort();
      window.removeEventListener("focus", conferirAcompanhamento);
    };
  }, [candidaturaId, tentativa]);

  const acompanhando = situacao === "acompanhando";

  return (
    <section
      aria-labelledby="acompanhar-candidato"
      className="border-t border-black/15 py-7 sm:py-9"
    >
      <div className="border border-black/15 bg-white/45 p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Acompanhamento
        </p>

        <h2
          id="acompanhar-candidato"
          className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl"
        >
          {acompanhando
            ? "Você já acompanha esta pessoa pelo Telegram."
            : "Receba no Telegram as atualizações públicas desta pessoa."}
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/60 sm:text-base sm:leading-7">
          {acompanhando
            ? "Quando houver novos registros públicos verificados sobre a atuação desta pessoa, o Fora da Pauta poderá avisar você no Telegram. Não é necessário se inscrever novamente."
            : "Você não precisa voltar ao site para procurar novidades. Quando houver novos registros públicos verificados sobre a atuação desta pessoa, o Fora da Pauta poderá avisar você pelo Telegram."}
        </p>

        {situacao === "conferindo" ? (
          <p className="mt-5 text-sm text-black/60" role="status">
            Conferindo seu acompanhamento no Telegram...
          </p>
        ) : null}

        {situacao === "disponivel" ? (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#FFC400] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
          >
            Acompanhar no Telegram
            <span aria-hidden="true" className="ml-2">→</span>
          </a>
        ) : null}

        {situacao === "erro" ? (
          <div className="mt-5">
            <p className="text-sm text-black/65" role="alert">
              Não foi possível conferir seu acompanhamento neste momento.
              Nenhuma escolha foi alterada.
            </p>
            <button
              type="button"
              onClick={() => {
                setSituacao("conferindo");
                setTentativa((atual) => atual + 1);
              }}
              className="mt-3 min-h-11 border border-black/20 px-4 py-2 text-sm font-semibold"
            >
              Conferir novamente
            </button>
          </div>
        ) : null}

        {acompanhando ? (
          <p className="mt-4 text-xs leading-5 text-black/45">
            Para consultar ou interromper seus acompanhamentos, envie /opcoes ao bot.
          </p>
        ) : (
          <p className="mt-4 text-xs leading-5 text-black/45">
            Você poderá parar de acompanhar quando quiser.
          </p>
        )}
      </div>
    </section>
  );
}
