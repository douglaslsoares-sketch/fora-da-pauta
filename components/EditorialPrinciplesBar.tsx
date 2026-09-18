"use client";

import { EditorialTools } from "@/components/EditorialTools";

export function EditorialPrinciplesBar() {
  return (
    <aside
      data-editorial-ignore
      aria-label="Como funciona o Fora da Pauta"
      className="border-t border-black/15 bg-[#eeeee9]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
            Como funciona
          </p>

          <p className="mt-2 text-base font-medium leading-7 text-black/75">
            O Fora da Pauta não é acusatório nem promocional. É documental.
          </p>
        </div>

        <EditorialTools
          rootSelector="main"
          title="Fora da Pauta"
          compact
        />
      </div>
    </aside>
  );
}
