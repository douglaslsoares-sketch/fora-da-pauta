import { LogoForaDaPauta } from "@/components/LogoForaDaPauta";

/** Identidade visual compartilhada com o menu principal. */
export function CabecalhoInterno({ titulo }: { titulo: string }) {
  return <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-5 pb-6 pt-7 text-center">
    <LogoForaDaPauta className="h-auto w-[min(72vw,260px)] max-w-full" />
    <h1 className="m-0 text-2xl font-extrabold tracking-tight text-white">{titulo}</h1>
    <span aria-hidden="true" className="h-0.5 w-12 rounded bg-[#e7b84d]" />
  </header>;
}
