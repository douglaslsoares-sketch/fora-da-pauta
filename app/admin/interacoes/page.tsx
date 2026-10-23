import type { Metadata } from "next";
import { InteracoesAdminPanel } from "@/components/InteracoesAdminPanel";

export const metadata: Metadata = {
  title: "Manifestações recebidas | Fora da Pauta",
  robots: { index: false, follow: false },
};

export default function InteracoesAdminPage() {
  return <main className="min-h-screen bg-[#eeeee9] px-5 py-12 text-[#151515] sm:px-8">
    <section className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-black/50">Área restrita</p>
      <h1 className="mt-3 text-3xl font-bold">Manifestações à pessoa pública</h1>
      <p className="mt-3 text-sm leading-6 text-black/60">
        Acompanhamento interno dos pedidos dos cidadãos. O envio ao destinatário
        requer canal verificado, e a resposta deve ter autoria confirmada.
      </p>
      <InteracoesAdminPanel />
    </section>
  </main>;
}
