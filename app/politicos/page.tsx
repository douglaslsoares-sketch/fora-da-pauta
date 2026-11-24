"use client";
import Link from "next/link";
import { useState } from "react";

import { AcompanhamentoSite } from "@/components/AcompanhamentoSite";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";


export default function Politicos() {
  const [perfilAberto, setPerfilAberto] = useState(false);
  return <main className="bg-[#0C192B] px-5 pt-5 pb-2 text-white">
    <div className="mx-auto w-full max-w-xl">
      <header className="flex flex-col items-center justify-center pb-5">
        <h1 className="w-full max-w-[380px]"><img src="/marca/politicos-gabarito.png" alt="Políticos" className="block h-auto w-full" /></h1>{!perfilAberto && <p className="mt-1 text-center text-sm font-medium text-white">Seguir <span className="text-red-500">•</span> Fiscalizar <span className="text-red-500">•</span> Cobrar</p>}
      </header>
      <h2 hidden={perfilAberto} className="text-base font-semibold">Escolher um político</h2>
      <AcompanhamentoSite modo="escolher" voltarPara="/politicos" incorporado onPerfilChange={setPerfilAberto} />
      {!perfilAberto && <>
      <Link href="/politicos/acompanhados" className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl bg-[#F4C64D] px-4 py-3 font-bold text-[#0C192B]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v2"/></svg>
        <span className="flex-1">Políticos que sigo</span><span aria-hidden="true">›</span>
      </Link>
      
      <InstalarAplicativo tema="escuro" />
      </>}
    </div>
  </main>;
}
