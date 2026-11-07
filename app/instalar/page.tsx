import type { Metadata } from "next";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
export const metadata: Metadata = { title: "Instalar Fora da Pauta" };
export default function Page(){return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-bold">Instalar Fora da Pauta</h1><p className="mt-5">Coloque o Fora da Pauta na tela inicial do seu celular.</p><InstalarAplicativo tema="claro"/><BotaoFecharRodape/></div></main>}
