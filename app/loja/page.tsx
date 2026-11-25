import Link from "next/link";
export const metadata = { title: "Loja | Fora da Pauta", description: "Apoie a continuidade do Fora da Pauta." };
export default function LojaPage() {
  return <main className="min-h-[100dvh] bg-[#0E1A29] text-white"><section className="mx-auto max-w-xl px-5 pt-5 pb-10 text-center">
    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Loja</h1>
    <h2 className="mt-6 text-lg font-semibold">Apoie o Fora da Pauta</h2>
    <div className="mx-auto mt-4 max-w-md space-y-4 text-base leading-relaxed text-slate-300">
      <p>A loja foi criada para ajudar a financiar o projeto Fora da Pauta e contribuir para a sua manutenção e independência.</p>
      <p>Ao adquirir nossos produtos, você ajuda a manter o projeto e suas iniciativas acessíveis gratuitamente.</p>
    </div>
    <nav className="mt-8 flex items-center justify-between gap-4 text-[#F4C64D] font-semibold" aria-label="Navegação da loja">
      <Link href="/" className="py-3 hover:underline">← Fora da Pauta</Link>
      <Link href="/loja/catalogo" className="py-3 hover:underline">Loja →</Link>
    </nav>
  </section></main>;
}
