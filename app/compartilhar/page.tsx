import type { Metadata } from "next";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
export const metadata: Metadata = { title: "Compartilhar no WhatsApp" };
const texto=encodeURIComponent("Você sabe o que os políticos estão fazendo?\n\nO Fora da Pauta acompanha o dia a dia da política e ajuda você a entender como as decisões afetam a nossa vida.\n\nHá mais para entender.\n\nhttps://foradapauta.org");
export default function Page(){return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl"><p className="my-6">Envie o Fique de Olho para alguém que você conhece.</p><a className="flex min-h-14 items-center justify-center rounded-lg bg-[#25D366] px-5 font-bold text-[#082d16]" href={`https://wa.me/?text=${texto}`}>Enviar pelo WhatsApp →</a><BotaoFecharRodape/></div></main>}
