import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eleições 2026 | Fora da Pauta",
  description:
    "Conheça os candidatos das Eleições 2026 antes de decidir seu voto.",
};

export default function Eleicoes2026CampanhaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-14">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45"
        >
          ← Fora da Pauta
        </Link>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Eleições 2026
          </p>

          <h1 className="mt-4 max-w-full break-words text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
            Conheça seu candidato.
          </h1>

          <p className="mt-6 max-w-full text-[1.05rem] leading-7 text-black/60 sm:max-w-2xl sm:text-lg sm:leading-8">
            Antes de votar, conheça quem está pedindo o seu voto.
          </p>
        </header>

        <section className="mt-8 rounded-[24px] bg-white p-5 sm:mt-10 sm:rounded-[30px] sm:p-8">
          <h2 className="break-words text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl">
            O que você pode descobrir
          </h2>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-[#f5f5f1] p-4">
              <p className="font-semibold">
                Quem é o candidato
              </p>

              <p className="mt-1 text-sm leading-6 text-black/55">
                Nome, partido, cargo e outras informações da candidatura.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f1] p-4">
              <p className="font-semibold">
                Por onde ele passou
              </p>

              <p className="mt-1 text-sm leading-6 text-black/55">
                Sua trajetória política e os cargos que já ocupou.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f1] p-4">
              <p className="font-semibold">
                O que ele fez
              </p>

              <p className="mt-1 text-sm leading-6 text-black/55">
                Projetos, votações, posições e atuação durante os mandatos.
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f1] p-4">
              <p className="font-semibold">
                Patrimônio e outras informações
              </p>

              <p className="mt-1 text-sm leading-6 text-black/55">
                Informações declaradas e fontes para você conferir.
              </p>
            </div>
          </div>

          <Link
            href="/eleicoes-2026"
            className="mt-7 flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-black/80"
          >
            Conhecer os candidatos →
          </Link>
        </section>

        <section className="mt-6 rounded-[24px] border border-black/10 p-5 sm:mt-8 sm:rounded-[30px] sm:p-8">
          <p className="text-xl font-semibold tracking-[-0.025em]">
            A escolha é sua.
          </p>

          <p className="mt-2 text-base leading-7 text-black/55 sm:text-lg sm:leading-8">
            Nosso trabalho é mostrar informações, explicar de onde elas vêm
            e deixar você tirar suas próprias conclusões.
          </p>
        </section>

        <footer className="mt-10 border-t border-black/10 pt-5 sm:mt-14 sm:pt-6">
          <p className="text-xs leading-5 text-black/40">
            As informações são acompanhadas de fontes sempre que disponíveis.
            O Fora da Pauta não recomenda candidatos.
          </p>
        </footer>
      </div>
    </main>
  );
}