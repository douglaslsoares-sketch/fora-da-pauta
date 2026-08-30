import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">

      {/* HERO */}
      <section className="bg-black text-white">
        <div className="mx-auto flex min-h-[86svh] w-full max-w-6xl flex-col px-5 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10">

          <header className="flex items-start justify-between">
            <Link
              href="/"
              aria-label="Fora da Pauta"
              className="block"
            >
              <Image
                src="/marca/fora-da-pauta-branca.png"
                alt="Fora da Pauta"
                width={210}
                height={150}
                priority
                className="h-auto w-[118px] sm:w-[142px]"
              />
            </Link>

            <span
              className="mt-1 h-2.5 w-2.5 rounded-full bg-[#f2c94c]"
              aria-hidden="true"
            />
          </header>

          <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Fora da Pauta
            </p>

            <h1 className="max-w-4xl text-[clamp(3.7rem,16vw,8rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              Há mais
              <br />
              para entender.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/68 sm:text-xl sm:leading-9">
              Temas que fazem parte da nossa vida, explicados de forma
              clara, direta e com espaço para você formar a própria opinião.
            </p>

            <div className="mt-7 pb-7 sm:mt-8 sm:pb-8">
              <Link
                href="/campanhas/escala-6x1"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#f2c94c] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f6d66d]"
              >
                Ver edição atual
              </Link>
            </div>
          </div>

          <div className="border-t border-white/15 pt-5">
            <p className="max-w-lg text-sm leading-6 text-white/45">
              Uma edição por vez. Um tema por edição.
            </p>
          </div>
        </div>
      </section>

      {/* EDIÇÃO ATUAL */}
      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">

          <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black/40">
                Edição atual
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                Fim da escala 6x1
              </h2>
            </div>

            <span className="hidden text-sm text-black/35 sm:block">
              01
            </span>
          </div>

          <Link
  href="/campanhas/escala-6x1"
  className="group block"
>
  <div className="border-t border-black/15 pt-5">

    <div className="mb-5 flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
        Trabalho
      </span>

      <span className="text-[11px] font-semibold tracking-[0.18em] text-black/35">
        01
      </span>
    </div>

    <div className="w-full overflow-hidden bg-black">
  <Image
    src="/edicoes/edicao-01-fim-da-escala-6x1-matriz.png"
    alt="Edição 01 — Fim da escala 6x1"
    width={1536}
    height={1024}
    priority
    className="h-auto w-full"
    sizes="(max-width: 1024px) 100vw, 1100px"
  />
</div>

    <div className="py-7 sm:py-9 lg:py-6">
      <h3 className="max-w-2xl text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl">
        Entenda o que está em discussão.
      </h3>

      <p className="mt-5 max-w-2xl text-[17px] leading-8 text-black/60 sm:text-lg">
        Entenda a proposta, veja os argumentos dos dois lados,
        acompanhe a tramitação e consulte quem já se posicionou.
      </p>

      <div className="mt-7 flex items-center justify-between border-t border-black/10 pt-5">
        <div className="flex items-center gap-3">
          <span
            className="h-[3px] w-8 bg-[#f2c94c]"
            aria-hidden="true"
          />

          <span className="text-sm font-semibold">
            Abrir edição
          </span>
        </div>

        <span
          className="text-2xl transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </div>

  </div>
</Link>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-t border-black/10 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-black/40">
              Como funciona
            </p>
          </div>

          <div>
            <p className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-4xl">
              Cada edição escolhe um tema e vai além da frase.
            </p>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">
              Você pode chegar por uma camiseta, por um compartilhamento
              ou diretamente pelo site. A ideia é sempre a mesma:
              entender melhor antes de tirar uma conclusão.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-5 py-10 text-white sm:px-8 sm:py-14 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">

          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={180}
            height={130}
            className="h-auto w-[105px]"
          />

          <div className="sm:text-right">
            <p className="text-base font-medium">
              Há mais para entender.
            </p>

            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">
              foradapauta.org
            </p>
          </div>

        </div>
      </footer>

    </main>
  );
}