import { CandidateSelector } from "@/components/CandidateSelector";

export default function CandidateSearchPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <style data-consulta-hierarquia-mobile>{`
        @media (max-width: 639px) {
          body > header img[alt="Fora da Pauta"] {
            width: 44px !important;
          }

          body > header > div > div:first-child {
            min-height: 56px !important;
          }
        }
      `}</style>
      <header className="bg-black text-white">
        <div className="mx-auto w-full max-w-5xl px-5 pb-0 pt-0 sm:px-8 sm:pb-11 sm:pt-6">
          <div className="-mt-9 flex justify-end sm:mt-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Eleições 2026
            </p>
          </div>

          <div className="mt-4 border-t border-white/15 py-4 sm:mt-6 sm:pb-0 sm:pt-6">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45 sm:block">
              Ficha do candidato
            </p>

            <h1 className="mt-0 max-w-2xl text-[2rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:mt-4 sm:text-5xl sm:leading-[0.98]">
              <span className="sm:hidden">
                <span className="block">Qual candidato você</span>
                <span className="block">quer consultar?</span>
              </span>
              <span className="hidden sm:inline">
                Qual candidato você quer consultar?
              </span>
            </h1>

            <p className="hidden mt-3 max-w-xl text-sm leading-6 text-white/60 sm:mt-4 sm:block sm:text-lg sm:leading-7">
              Digite o nome ou use os filtros para localizar a candidatura.
            </p>
          </div>
        </div>
      </header>

      <section className="px-5 pb-20 pt-4 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <CandidateSelector />

          <div className="hidden mt-12 border-t border-black/10 pt-6 sm:block"><p className="max-w-2xl text-sm leading-6 text-black/45">
              Os resultados identificam candidaturas registradas na base eleitoral utilizada pelo Fora da Pauta. A seleção de um nome abre a respectiva ficha documental.
            </p></div>
        </div>
      </section>
    </main>
  );
}