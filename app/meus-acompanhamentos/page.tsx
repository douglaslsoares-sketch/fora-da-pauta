import type { Metadata } from "next";
import { AcompanhamentoSite } from "@/components/AcompanhamentoSite";
export const metadata: Metadata = { title: "Políticos que eu acompanho | Fora da Pauta" };
export default function Page() { return <main className="min-h-screen bg-slate-50"><AcompanhamentoSite modo="lista" /></main>; }
