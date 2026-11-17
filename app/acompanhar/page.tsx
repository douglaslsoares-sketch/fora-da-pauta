import type { Metadata } from "next";
import { AcompanhamentoSite } from "@/components/AcompanhamentoSite";
export const metadata: Metadata = { title: "Escolher um político | Fora da Pauta" };
export default function Page() { return <main className="min-h-screen bg-slate-50"><AcompanhamentoSite modo="escolher" /></main>; }
