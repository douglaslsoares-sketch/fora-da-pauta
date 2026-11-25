import Link from "next/link";
import { mensagemCompartilhamento, linkCompartilhamentoWhatsApp } from "@/lib/compartilhamento";
export const metadata = { title: "Compartilhar | Fora da Pauta" };
export default function Compartilhar() {
  return <main className="min-h-[100dvh] bg-[#0E1A29] text-white"><section className="mx-auto max-w-xl px-5 pt-5 pb-10 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Compartilhar</h1>
    <p className="mt-4 text-sm text-slate-300">Veja a mensagem antes de compartilhar.</p>
    <div className="mt-6 rounded-2xl bg-[#18283A] p-5 text-left"><p className="whitespace-pre-wrap leading-relaxed">{mensagemCompartilhamento.replace(/\*([^*]+)\*/g,"$1")}</p></div>
    <a href={linkCompartilhamentoWhatsApp} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#F4C64D] px-4 py-3 font-bold text-[#0C192B]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z"/><path d="M8 7c-2 2 4 8 6 8l2-2"/></svg>Compartilhar no WhatsApp</a>
    <Link href="/" className="mx-auto mt-7 block min-h-12 text-center font-semibold text-[#F4C64D] hover:underline">← Fora da Pauta</Link>
  </section></main>;
}
