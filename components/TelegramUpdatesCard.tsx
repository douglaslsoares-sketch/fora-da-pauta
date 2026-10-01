function obterBotUsername() {
  return (
    process.env
      .NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
      ?.trim()
      .replace(/^@/, "") ||
    "ForaDaPautaAcompanhaBot"
  );
}

export function TelegramUpdatesCard() {
  const botUsername =
    obterBotUsername();

  const telegramHref =
    `https://t.me/${botUsername}?start=edicoes`;

  return (
    <section className="border-t border-black/15 py-8 sm:py-10">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
        Continue acompanhando
      </p>

      <div className="flex items-end justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-3xl">
            Receba as próximas edições
          </h2>

          <p className="mt-4 text-base leading-7 text-black/55">
            Ative no bot do Fora da Pauta o recebimento de novas edições.
            Os avisos chegam diretamente pelo Telegram.
          </p>

          <p className="mt-3 text-sm leading-6 text-black/40">
            Essa escolha é independente do acompanhamento de candidatos.
          </p>
        </div>

        <a
          href={telegramHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Receber novas edições pelo bot do Fora da Pauta"
          className="shrink-0 text-2xl transition-transform duration-300 hover:translate-x-1"
        >
          →
        </a>
      </div>
    </section>
  );
}
