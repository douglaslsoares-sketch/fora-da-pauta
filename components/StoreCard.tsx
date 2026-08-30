type StoreCardProps = {
  storeUrl?: string;
};

export function StoreCard({
  storeUrl,
}: StoreCardProps) {
  const content = (
    <>
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
          Leve a mensagem
        </p>

        <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
          Adquirir camiseta
        </h2>

        <p className="mt-4 max-w-lg text-base leading-7 text-white/60">
          Acesse a loja da campanha e veja a camiseta desta mensagem.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="shrink-0 text-2xl transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  if (!storeUrl) {
    return (
      <div className="flex items-end justify-between gap-8 bg-black px-6 py-8 text-white opacity-75 sm:px-8 sm:py-10">
        {content}
      </div>
    );
  }

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex items-end justify-between gap-8 bg-black px-6 py-8 text-white sm:px-8 sm:py-10"
    >
      {content}
    </a>
  );
}