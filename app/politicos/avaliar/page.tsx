import type { Metadata } from "next";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { FormularioAvaliacaoPoliticos } from "@/components/politicos/FormularioAvaliacaoPoliticos";

export const metadata: Metadata = {
  title: "Avaliar o aplicativo | Políticos",
  description: "Grave sua opinião enquanto navega pelo aplicativo e nos ajude a melhorá-lo.",
};

export default function AvaliarPoliticos() {
  return (
    <PaginaPoliticos titulo="Avaliar o aplicativo">
      <p className="mb-6 text-center text-base leading-7 text-slate-200">
        Queremos ouvir você. Grave seu feedback e nos ajude a melhorar a experiência no Políticos.
      </p>
      <FormularioAvaliacaoPoliticos />
    </PaginaPoliticos>
  );
}
