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

  // A ficha é para conhecer a pessoa. Quem já acompanha não recebe outro convite.
  // Durante a verificação também não exibimos um convite prematuro.
  if (situacao === "acompanhando" || situacao === "conferindo") {
    return null;
  }

  if (situacao === "erro") {
    return (
      <p className="border-t border-black/10 py-3 text-xs leading-5 text-black/50">
        Não foi possível conferir o acompanhamento neste navegador.
        <button
          type="button"
          onClick={() => {
            setSituacao("conferindo");
            setTentativa((atual) => atual + 1);
          }}
          className="ml-2 font-semibold underline underline-offset-4"
        >
          Conferir novamente
        </button>
      </p>
    );
  }

  return (
    <aside className="border-t border-black/10 py-4">
      <p className="text-sm leading-6 text-black/65">
        Ainda não acompanha esta pessoa neste navegador?{" "}
        <a
          href={telegramHref}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-black underline decoration-[#bd8c00] underline-offset-4"
        >
          Acompanhar pelo Telegram ↗
        </a>
      </p>
    </aside>
  );
}
