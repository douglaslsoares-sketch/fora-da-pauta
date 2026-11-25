import Link from "next/link";
import { InstalarAplicativo } from "@/components/InstalarAplicativo";
import { LogoForaDaPauta } from "@/components/LogoForaDaPauta";
import { IconeMenu } from "@/components/IconeMenu";


const iniciativas = [
  { nome: "Políticos", href: "/politicos", desenho: <><path d="M2 12s3.6-8 10-8 10 8 10 8-3.6 8-10 8S2 12 2 12Z"/><circle cx="12" cy="12" r="3.5"/></> },
  { nome: "Editoriais", href: "/editoriais", desenho: <><path d="m3 3 14 4 4 10-4 4-10-4L3 3Zm0 0 9 9m3 5 5-5"/><circle cx="12" cy="12" r="2"/></> },
  { nome: "Curtas", href: null, desenho: <><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z" fill="currentColor"/></> },
  { nome: "Enquetes", href: null, desenho: <><rect x="3" y="11" width="4" height="10" rx="1" fill="currentColor"/><rect x="10" y="3" width="4" height="18" rx="1" fill="currentColor"/><rect x="17" y="7" width="4" height="14" rx="1" fill="currentColor"/></> },
];
const cartao = "flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-2xl bg-[#18283A] px-2 py-5 text-center text-white sm:min-h-[140px]";
const rodape = "flex min-w-0 flex-col items-center justify-center gap-2 py-3 text-center text-xs text-white sm:text-sm";
export function MenuPrincipal() {
  return (
    <section id="menu" className="min-h-screen min-h-[100dvh] bg-[#0E1A29] text-white pb-28" aria-label="Menu do Fora da Pauta">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <header className="flex justify-center pt-5 pb-8 sm:pt-8 sm:pb-10">
          <h1 className="w-full max-w-[340px]"><LogoForaDaPauta className="block w-full h-auto"/></h1>
        </header>
        <nav className="grid grid-cols-2 gap-3 [&>*:only-child]:col-span-2" aria-label="Iniciativas">
          {iniciativas.filter(item => item.href !== null && item.nome !== "Políticos").map(({nome,href,desenho}) => {
            const conteudo = <><svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{desenho}</svg><span className="text-lg font-bold sm:text-2xl">{nome}</span></>;
            return href ? <Link key={nome} href={href} className={cartao+" hover:bg-[#22364C] focus-visible:outline focus-visible:outline-[#F4C64D]"}>{conteudo}</Link> : <div key={nome} className={cartao} aria-disabled="true" title="Em preparação">{conteudo}</div>;
          })}
        </nav>
        <div className="text-center [&_button]:!text-[#F4C64D]"><InstalarAplicativo tema="escuro" /></div>
      </div>
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#344457] bg-[#0E1A29] pb-[env(safe-area-inset-bottom)]">
        <nav className="mx-auto grid max-w-xl grid-cols-3" aria-label="Ações">
          <Link className={rodape} href="/compartilhar"><IconeMenu nome="compartilhar" className="text-[#F4C64D]"/>Compartilhar</Link>
          <Link className={rodape} href="/qr-code"><IconeMenu nome="qr" className="text-[#F4C64D]"/>QR Code</Link>
          <Link className={rodape} href="/loja"><svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="#F4C64D" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m8 3-5 3 2 6 3-1v10h8V11l3 1 2-6-5-3c0 4-8 4-8 0Z"/></svg>Loja</Link>
        </nav>
      </footer>
    </section>
  );
}
