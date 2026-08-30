export function TelegramUpdatesCard() {
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
            Entre no canal oficial do Fora da Pauta no Telegram e receba um
            aviso quando uma nova edição for publicada.
          </p>

          <p className="mt-3 text-sm leading-6 text-black/40">
            Sem excesso de mensagens. Só o necessário para acompanhar o projeto.
          </p>
        </div>

        <a
          href="https://t.me/foradapauta"
          target="_blank"
          rel="noreferrer"
          aria-label="Entrar no canal Fora da Pauta no Telegram"
          className="shrink-0 text-2xl transition-transform duration-300 hover:translate-x-1"
        >
          →
        </a>
      </div>
    </section>
  );
}