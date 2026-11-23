import type { Metadata } from "next";
import { AcompanhamentoSite } from "@/components/AcompanhamentoSite";
export const metadata: Metadata = { title: "Escolher um político | Políticos" };
export default function Page() { return <main className="min-h-screen bg-[#071827]"><AcompanhamentoSite modo="escolher" voltarPara="/politicos" /></main>; }
