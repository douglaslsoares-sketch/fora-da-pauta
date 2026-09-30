import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">

        <header className="flex items-start justify-between gap-8">
          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={230}
            height={166}
            priority
            className="h-auto w-[115px] sm:w-[135px]"
          />

          <p className="max-w-[180px] pt-2 text-right text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC400]">
            Há mais para entender.
          </p>
        </header>

        <section className="my-auto max-w-3xl py-14 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Eleições 2026
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
            {"Acompanhe seu candidato depois de eleito."}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Escolha o candidato que você quer acompanhar.
            Quando houver novos registros documentados sobre a atuação dele,
            o aviso chega diretamente pelo Telegram.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
            Você escolhe uma vez. Depois, não precisa voltar ao site
            para procurar novidades.
          </p>

          <Link
            href="/conheca-seu-candidato"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#FFC400] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
          >
            Escolher candidato para acompanhar →
          </Link>
        </section>

      </div>
    </main>
  );
}