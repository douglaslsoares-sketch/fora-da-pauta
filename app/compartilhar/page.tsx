import type { Metadata } from "next";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
export const metadata: Metadata = { title: "Compartilhar no WhatsApp" };
const texto=encodeURIComponent("Conheça o Fora da Pauta. Acompanhe o que seu representante faz depois de eleito. https://www.foradapauta.org/");
export default function Page(){return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-bold">Compartilhar no WhatsApp</h1><p className="my-6">Envie o Fora da Pauta para alguém que você conhece.</p><a className="flex min-h-14 items-center justify-center rounded-lg bg-[#25D366] px-5 font-bold text-[#082d16]" href={`https://wa.me/?text=${texto}`}>Enviar pelo WhatsApp →</a><BotaoFecharRodape/></div></main>}
