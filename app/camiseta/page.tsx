import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camiseta Fora da Pauta",
  description: "Conheça a camiseta do Fora da Pauta. A aquisição ainda não está disponível.",
};

export default function CamisetaPage() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Camiseta Fora da Pauta</h1>
        <p className="mt-3 text-base leading-7 text-black/65">Vista a ideia. Ajude a levar o Fora da Pauta mais longe.</p>
        <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl bg-[#f1f1ef] p-6 sm:p-10">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <svg viewBox="0 0 380 470" aria-hidden="true" className="absolute inset-0 h-full w-full drop-shadow-xl">
              <path d="M104 20 L142 8 Q190 47 238 8 L276 20 L365 107 L306 170 L276 141 L276 451 Q190 467 104 451 L104 141 L74 170 L15 107 Z" fill="#fff" stroke="#ddd" strokeWidth="3"/>
              <path d="M142 8 Q190 80 238 8" fill="none" stroke="#ddd" strokeWidth="7"/>
            </svg>
            <div className="absolute left-[28%] top-[30%] w-[44%]">
              <Image src="/marca/fora-da-pauta-icone.svg" alt="Símbolo do Fora da Pauta na camiseta" width={200} height={120} className="mx-auto h-auto w-4/5" />
              <p className="mt-1 text-center text-[clamp(10px,2.3vw,17px)] font-black leading-tight tracking-tight">FORA DA PAUTA</p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-black/60">Apresentação ilustrativa da camiseta.</p>
        <p className="mt-5 text-center text-base leading-7">A compra da camiseta ajudará a financiar e manter o projeto Fora da Pauta.</p>
        <p className="mt-3 text-center text-sm font-semibold text-black/50">Aquisição ainda não disponível.</p>
        <Link href="/#opcoes" className="mt-10 inline-flex min-h-12 items-center rounded-lg bg-black px-5 py-3 font-semibold text-white">Voltar às opções</Link>
      </div>
    </main>
  );
}
