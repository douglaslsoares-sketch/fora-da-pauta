import type { Metadata } from "next";
import { VotouFiqueDeOlhoExperience } from "@/components/VotouFiqueDeOlhoExperience";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { inscricaoAtiva, tokenSessao } from "@/lib/telegram/sessao-site";

export const metadata: Metadata = {
  title: "Fique de Olho",
  description: "Escolha quem você quer acompanhar no Fora da Pauta.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VotouFiqueDeOlhoPage({ searchParams }: { searchParams: Promise<{ minhas?: string }> }) {
  const parametros = await searchParams;
  if (parametros.minhas === "1") {
    let inscrito = false;
    try {
      inscrito = await inscricaoAtiva(await tokenSessao());
    } catch (erro) {
      console.error("Falha ao conferir inscrição para lista pessoal:", erro);
    }
    if (!inscrito) redirect("/central?inscricao=necessaria");
  }
  return (
    <div className={styles.page}>
      <main>
        <VotouFiqueDeOlhoExperience />
      </main>
    </div>
  );
}
