import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suas opções | Fora da Pauta",
  description: "Volte ao site, acompanhe novas pessoas ou consulte as edições do Fora da Pauta.",
  robots: { index: false, follow: true },
};

const botoes = [
  { titulo: "Acompanhar pessoas", descricao: "Escolha novas pessoas para acompanhar.", href: "/votou-fique-de-olho" },
  { titulo: "Minhas escolhas", descricao: "Consulte ou remova pessoas acompanhadas.", href: "/votou-fique-de-olho?minhas=1" },
  { titulo: "Buscar pessoas", descricao: "Pesquise pelo nome.", href: "/votou-fique-de-olho" },
  { titulo: "Ver ficha política", descricao: "Pesquise e abra a ficha de uma pessoa.", href: "/votou-fique-de-olho" },
  { titulo: "Edições já publicadas", descricao: "Leia ou ouça as edições disponíveis.", href: "/edicoes" },
  { titulo: "Página inicial", descricao: "Voltar ao Fora da Pauta.", href: "/" },
];

export default function OpcoesTelegram() {
  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-5 pb-16 pt-9 text-black sm:pt-14">
      <section className="mx-auto max-w-[600px]">
        <div className="mb-9 flex flex-col items-center gap-3 text-center">
          <Image
            src="/marca/fora-da-pauta-icone.svg"
            alt=""
            width={66}
            height={66}
            className="h-[66px] w-[66px]"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.13em]">Fique de Olho</p>
        </div>
        <h1 className="text-center text-[clamp(28px,5vw,38px)] font-bold leading-tight tracking-[-0.045em]">O que você quer fazer?</h1>
        <p className="mx-auto mb-8 mt-4 max-w-[40ch] text-center text-base leading-7 text-black/65">
          Escolha uma opção. Você pode voltar ao Telegram quando quiser.
        </p>
        <nav aria-label="Opções do Fora da Pauta" className="flex flex-col gap-4">
          {botoes.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex min-h-20 flex-col justify-center rounded-xl border border-[#e2b100] bg-[#ffd700] px-6 py-4 text-black transition hover:bg-[#f3cc00] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black">
              <span className="text-lg font-bold">{item.titulo} <span aria-hidden="true">→</span></span>
              <span className="mt-1 text-sm text-black/70">{item.descricao}</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
