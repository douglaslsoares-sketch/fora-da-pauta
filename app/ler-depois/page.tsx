import type { Metadata } from "next";

import ListaLerDepois from "../../components/ListaLerDepois";

export const metadata: Metadata = {
  title: {
    absolute:
      "FORA DA PAUTA - Ler depois",
  },
  description:
    "Páginas do Fora da Pauta guardadas para ler depois.",
};

export default function LerDepoisPage() {
  return <ListaLerDepois />;
}
