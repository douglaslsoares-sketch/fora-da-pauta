import type { Metadata } from "next";
import { FormularioPergunta } from "@/components/FormularioPergunta";

export const metadata: Metadata = {
  title: "Fazer uma pergunta | EU VIGIO",
  description: "Faça sua pergunta ao EU VIGIO e acompanhe a resposta.",
};

export default function FazerUmaPergunta() {
  return (
    <main className="min-h-screen bg-white">
      <FormularioPergunta />
    </main>
  );
}
