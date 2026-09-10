import Link from "next/link";

export function EditorialPrinciplesBar() {
  return (
    <aside
      aria-label="Linha editorial do Fora da Pauta"
      className="border-t border-black/15 bg-[#eeeee9]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
            Linha editorial
          </p>

          <p className="mt-2 text-base font-medium leading-7 text-black/75">
            O Fora da Pauta não é acusatório nem promocional. É documental.
          </p>
        </div>

        <Link
          href="/linha-editorial"
          className="shrink-0 text-sm font-semibold text-black underline decoration-black/25 underline-offset-4 transition hover:decoration-black"
        >
          Conheça nossa linha editorial →
        </Link>
      </div>
    </aside>
  );
}
