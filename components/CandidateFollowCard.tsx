type CandidateFollowCardProps = {
  candidaturaId: string;
};

function normalizarBotUsername(
  valor: string | undefined,
) {
  return (
    valor
      ?.trim()
      .replace(/^@/, "") ?? ""
  );
}

export function CandidateFollowCard({
  candidaturaId,
}: CandidateFollowCardProps) {
  const botUsername =
    normalizarBotUsername(
      process.env
        .NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    );

  const payload =
    `seguir_${candidaturaId}`;

  const telegramHref =
    botUsername
      ? `https://t.me/${botUsername}?start=${encodeURIComponent(
          payload,
        )}`
      : null;

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
          Acompanhe este candidato depois de eleito.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/60 sm:text-base sm:leading-7">
          Se for eleito, você poderá receber no Telegram avisos
          quando houver novos registros documentados sobre sua atuação.
        </p>

        {telegramHref ? (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#FFC400] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
          >
            Acompanhar no Telegram
            <span
              aria-hidden="true"
              className="ml-2"
            >
              →
            </span>
          </a>
        ) : (
          <div className="mt-5 border-l-4 border-[#FFC400] pl-4">
            <p className="font-semibold">
              Acompanhamento pelo Telegram em preparação
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
              Esta ficha já está preparada para ativar o
              acompanhamento individual quando o bot do Fora da Pauta
              for conectado.
            </p>
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-black/45">
          Você poderá parar de acompanhar quando quiser.
        </p>
      </div>
    </section>
  );
}
