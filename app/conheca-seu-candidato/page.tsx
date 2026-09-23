import { CandidateSelector } from "@/components/CandidateSelector";

export default function CandidateSearchPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto w-full max-w-5xl px-5 pb-5 pt-3 sm:px-8 sm:pb-11 sm:pt-6">
          <div className="flex justify-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Eleições 2026
            </p>
          </div>

          <div className="mt-3 border-t border-white/15 pt-4 sm:mt-6 sm:pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Ficha do candidato
            </p>

            <h1 className="mt-3 max-w-2xl text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:mt-4 sm:text-5xl sm:leading-[0.98]">
              Qual candidato você quer consultar?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:mt-4 sm:text-lg sm:leading-7">
              Digite o nome ou use os filtros para localizar a candidatura.
            </p>
          </div>
        </div>
      </header>

      <section className="px-5 py-5 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <CandidateSelector />

          <div className="mt-12 border-t border-black/10 pt-6">
            <p className="max-w-2xl text-sm leading-6 text-black/45">
              Os resultados identificam candidaturas registradas na base eleitoral utilizada pelo Fora da Pauta. A seleção de um nome abre a respectiva ficha documental.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}