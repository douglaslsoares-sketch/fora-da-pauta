import type { Metadata } from "next";
import { FormularioPergunta } from "@/components/FormularioPergunta";
import { redirect } from "next/navigation";
import { inscricaoAtiva, tokenSessao } from "@/lib/telegram/sessao-site";

export const metadata: Metadata = {
  title: "Fazer uma pergunta | EU VIGIO",
  description: "Faça sua pergunta ao EU VIGIO e acompanhe a resposta.",
};

export const dynamic = "force-dynamic";

export default async function FazerUmaPergunta() {
  let inscrito = false;
  try {
    inscrito = await inscricaoAtiva(await tokenSessao());
  } catch (erro) {
    console.error("Falha ao conferir inscrição para perguntas:", erro);
  }
  if (!inscrito) redirect("/central?inscricao=necessaria");
  return (
    <main className="min-h-screen bg-white">
      <FormularioPergunta />
    </main>
  );
}
