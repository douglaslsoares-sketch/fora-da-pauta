import type { Metadata } from "next";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { FormularioAvaliacaoPoliticos } from "@/components/politicos/FormularioAvaliacaoPoliticos";

export const metadata: Metadata = {
  title: "Avaliar o aplicativo | Políticos",
  description: "Envie sua avaliação e sugestões para melhorar a experiência no aplicativo Políticos.",
};

export default function AvaliarPoliticos() {
  return (
    <PaginaPoliticos titulo="Avaliar o aplicativo">
      <p className="mb-6 text-center text-base leading-7 text-slate-200">
        Sua opinião ajuda a melhorar o Políticos. Conte como foi sua experiência.
      </p>
      <FormularioAvaliacaoPoliticos />
    </PaginaPoliticos>
  );
}
