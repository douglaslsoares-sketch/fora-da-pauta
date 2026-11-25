import Link from "next/link";
export const metadata = { title: "Apoie | Fora da Pauta", description: "Apoie a continuidade do Fora da Pauta." };
export default function ApoiePage() {
  return <main className="min-h-[100dvh] bg-[#0E1A29] text-white"><section className="mx-auto max-w-xl px-5 pt-5 pb-10 text-center">
    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Apoie</h1>
    <div className="mx-auto mt-6 max-w-md space-y-4 text-base leading-relaxed text-slate-300">
      <p>O Fora da Pauta é um projeto de comunicação e formação da consciência crítica.</p>
      <p>Nossas iniciativas de financiamento têm como objetivo garantir a continuidade do projeto, preservar sua independência editorial e manter o acesso gratuito a todos.</p>
    </div>
    <nav className="mx-auto mt-8 flex max-w-md flex-col items-center gap-5" aria-label="Iniciativas de financiamento">
      <Link href="/loja/catalogo" className="w-full rounded-xl bg-[#F4C64D] px-5 py-3 font-bold text-[#0E1A29] hover:brightness-95">Loja</Link>
      <Link href="/" className="py-3 font-semibold text-[#F4C64D] hover:underline">← Fora da Pauta</Link>
    </nav>
  </section></main>;
}
