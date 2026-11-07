import type { Metadata } from "next";
import { EscolherQuemAcompanhar } from "@/components/EscolherQuemAcompanhar";
export const metadata: Metadata = { title: "Escolha quem acompanhar" };
export default function Page() { return <EscolherQuemAcompanhar />; }
