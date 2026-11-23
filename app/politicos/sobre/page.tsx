import type { Metadata } from "next";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Sobre o projeto | Políticos" };
export default function SobrePoliticos() {
  return (
    <PaginaPoliticos titulo="Sobre o projeto">
      <article className="space-y-5 border-t-2 border-[#ffd02a] pt-7 text-base leading-8 text-slate-200">
        <h2 className="text-2xl font-extrabold leading-tight text-white">Por que acompanhar nossos representantes?</h2>
        <p>Quando elegemos alguém, confiamos a essa pessoa a responsabilidade de participar das decisões que afetam nossa vida.</p>
        <p>Mas o acompanhamento não precisa terminar depois da eleição.</p>
        <p>O Políticos foi criado para ajudar você a acompanhar a atuação dos representantes, conhecer suas decisões e consultar informações sobre o que fazem.</p>
        <p>Aqui, você escolhe quem deseja acompanhar. O sistema de avisos sobre sua atuação está sendo preparado.</p>
        <p>As informações devem indicar datas e fontes, para que cada pessoa possa verificar os registros e formar sua própria opinião.</p>
      </article>
    </PaginaPoliticos>
  );
}
