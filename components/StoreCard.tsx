type StoreCardProps = {
  storeUrl?: string;
};

export function StoreCard({ storeUrl }: StoreCardProps) {
  const content = (
    <>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
          Leve a mensagem
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Adquirir camiseta
        </h2>
        <p className="mt-3 max-w-lg text-base leading-7 text-white/65">
          Acesse a loja da campanha e veja a camiseta desta mensagem.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xl text-black transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  if (!storeUrl) {
    return (
      <div className="flex items-center justify-between gap-6 rounded-[30px] bg-[#151515] px-6 py-7 text-white opacity-75 sm:px-8 sm:py-8">
        {content}
      </div>
    );
  }

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-6 rounded-[30px] bg-[#151515] px-6 py-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.16)] transition-transform duration-300 hover:-translate-y-1 sm:px-8 sm:py-8"
    >
      {content}
    </a>
  );
}
