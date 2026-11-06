import Link from "next/link";
export function BotaoFecharRodape() {
  return <div className="mt-10 flex justify-center pb-8"><Link href="/#opcoes" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white hover:bg-[#a71d1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"><span aria-hidden="true">✕</span> Fechar</Link></div>;
}
