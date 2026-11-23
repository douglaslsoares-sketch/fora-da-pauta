import Link from "next/link";
import { PoliticosMarca } from "@/components/PoliticosMarca";

export function CabecalhoPoliticos({ titulo }: { titulo: string }) {
  return (
    <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 pb-7 pt-5 text-center">
      <Link href="/politicos" aria-label="Voltar ao menu Políticos" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-yellow-300">
        <PoliticosMarca className="h-[66px] w-[85px]" />
        <span className="text-3xl font-extrabold tracking-tight text-[#edc439]">Políticos</span>
      </Link>
      <h1 className="m-0 text-2xl font-extrabold text-white">{titulo}</h1>
      <span className="h-0.5 w-12 rounded bg-[#e7b84d]" aria-hidden="true" />
    </header>
  );
}
