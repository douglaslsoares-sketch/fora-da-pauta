import Link from "next/link";
import type { Metadata } from "next";

import { AcompanhamentoSite } from "@/components/AcompanhamentoSite";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";

export const metadata: Metadata = { title: "Políticos", description: "Acompanhar, fiscalizar e cobrar." };

export default function Politicos() {
  return <main className="min-h-[100dvh] bg-[#0C192B] px-5 py-6 text-white">
    <div className="mx-auto w-full max-w-xl">
      <header className="flex flex-col items-center justify-center pb-6">
        <h1 className="w-full max-w-[380px]"><img src="/marca/politicos-gabarito.png" alt="Políticos" className="block h-auto w-full" /></h1><p className="mt-3 text-center text-sm font-medium text-white">Seguir <span className="text-red-500">•</span> Fiscalizar <span className="text-red-500">•</span> Cobrar</p>
      </header>
      <h2 className="text-base font-semibold">Escolher um político</h2>
      <AcompanhamentoSite modo="escolher" voltarPara="/politicos" incorporado />
      <Link href="/politicos/acompanhados" className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl bg-[#F4C64D] px-4 py-3 font-bold text-[#0C192B]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v2"/></svg>
        <span className="flex-1">Políticos que sigo</span><span aria-hidden="true">›</span>
      </Link>
      <nav aria-label="Recursos adicionais" className="mt-10 grid grid-cols-3 gap-2 text-center text-xs">
        <a href={"https://wa.me/?text="+encodeURIComponent("Políticos — Acompanhar, fiscalizar e cobrar. https://foradapauta.org/politicos")} target="_blank" rel="noopener noreferrer" className="flex min-h-14 flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#F4C64D" strokeWidth="1.8" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8 11 8-5M8 13l8 5"/></svg>Compartilhar
        </a>
        <Link href="/politicos/qr-code" className="flex min-h-14 flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#F4C64D" strokeWidth="1.8" aria-hidden="true"><rect x="2" y="2" width="8" height="8"/><rect x="14" y="2" width="8" height="8"/><rect x="2" y="14" width="8" height="8"/><path d="M5 5h2v2H5zM17 5h2v2h-2zM5 17h2v2H5zM14 14h4v4h-4zM22 14v4M14 22h4M22 22h-1"/></svg>QR Code
        </Link>
        <Link href="/politicos/loja" className="flex min-h-14 flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#F4C64D" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m8 3-6 4 3 6 3-2v10h8V11l3 2 3-6-6-4a4 4 0 0 1-8 0Z"/></svg>Loja
        </Link>
      </nav>
      <InstalarAplicativo tema="escuro" />
    </div>
  </main>;
}
