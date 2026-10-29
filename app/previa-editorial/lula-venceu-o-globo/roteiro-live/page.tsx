import { notFound } from "next/navigation";
import { lulaVenceuOGloboRascunho } from "@/data/edicoes/rascunhos/lula-venceu-o-globo";
import { criarTrechosLive } from "@/lib/editorial/roteiro-narracao-live";
import { PainelRoteiroLive } from "@/components/PainelRoteiroLive";

export const metadata = { title: "Roteiro de gravação — revisão privada", robots: { index: false, follow: false } };

export default function RoteiroLivePreview() {
  // Não oferecer a ferramenta na produção. Somente local ou Vercel Preview.
  const local = process.env.NODE_ENV === "development";
  const preview = process.env.VERCEL_ENV === "preview";
  if (!local && !preview) notFound();
  const edicao = lulaVenceuOGloboRascunho;
  const blocos = [
    { tipo: "titulo" as const, texto: edicao.title },
    { tipo: "subtitulo" as const, texto: edicao.statement ?? "" },
    ...edicao.sections.flatMap(s => [
      { tipo: "subtitulo" as const, texto: s.title },
      ...s.paragraphs.map(texto => ({ tipo: "paragrafo" as const, texto })),
    ]),
  ];
  return <PainelRoteiroLive trechos={criarTrechosLive(blocos)} />;
}
