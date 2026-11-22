import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { participacaoNomeAberta } from "@/lib/participacaoNome";
import { FormularioSugestaoNome } from "@/components/FormularioSugestaoNome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sugira um nome | Fora da Pauta", robots: { index: false, follow: false } };

export default async function SugiraUmNome() {
  if (!(await participacaoNomeAberta())) notFound();
  return <FormularioSugestaoNome />;
}
