import Link from "next/link";


export function CabecalhoPoliticos({ titulo }: { titulo: string }) {
  return (
    <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 pb-7 pt-5 text-center">
      <Link href="/politicos" aria-label="Voltar ao menu Políticos" className="block w-full max-w-[380px] rounded-xl focus-visible:outline-2 focus-visible:outline-yellow-300">
        <img src="/marca/politicos-gabarito.png" alt="Políticos" className="block h-auto w-full" />
      </Link>
      {titulo && <><h1 className="m-0 text-2xl font-extrabold text-white">{titulo}</h1><span className="h-0.5 w-12 rounded bg-[#e7b84d]" aria-hidden="true" /></>}
    </header>
  );
}
