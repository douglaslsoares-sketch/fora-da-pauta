import Image from "next/image";
import Link from "next/link";

import { campaigns } from "@/data/campanhas";

const capasConhecidas: Record<string, string> = {
  "fim-escala-6x1": "/edicoes/edicao-01-fim-da-6x1-capa-grade.png",
};

function obterCapa(slug: string, coverImage?: string) {
  return coverImage ?? capasConhecidas[slug] ?? null;
}

function obterEdicoesPublicadas() {
  return campaigns
    .map((campaign, index) => ({
      campaign,
      index,
      coverImage: obterCapa(campaign.slug, campaign.coverImage),
    }))
    .filter((item) => item.coverImage !== null)
    .sort((a, b) => {
      const dataA = a.campaign.publishedAt
        ? Date.parse(`${a.campaign.publishedAt}T00:00:00`)
        : null;

      const dataB = b.campaign.publishedAt
        ? Date.parse(`${b.campaign.publishedAt}T00:00:00`)
        : null;

      if (dataA !== null && dataB !== null) {
        return dataB - dataA;
      }

      if (dataA !== null) return -1;
      if (dataB !== null) return 1;

      return a.index - b.index;
    });
}

export default function Home() {
  const edicoes = obterEdicoesPublicadas();

  return (
    <main className="flex min-h-screen flex-col bg-[#eeeee9] text-[#151515]">
      <header className="bg-black px-5 py-2.5 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" aria-label="Fora da Pauta">
            <Image
              src="/marca/fora-da-pauta-branca.png"
              alt="Fora da Pauta"
              width={180}
              height={130}
              priority
              className="h-auto w-[60px] sm:w-[68px]"
            />
          </Link>

          <span
            className="h-2 w-2 rounded-full bg-[#FFC400]"
            aria-hidden="true"
          />
        </div>
      </header>

      <section className="flex-1 px-5 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,420px))] justify-center gap-x-8 gap-y-10">
            {edicoes.map(({ campaign, coverImage }, index) => (
              <article key={campaign.slug}>
                <Link
                  href={`/campanhas/${campaign.slug}`}
                  className="group block"
                  aria-label={`Abrir ${campaign.title}`}
                >
                  <div className="overflow-hidden bg-black">
                    <Image
                      src={coverImage!}
                      alt={campaign.title}
                      width={1200}
                      height={675}
                      priority={index === 0}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.012]"
                    />
                  </div>


                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black px-5 py-5 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between">
          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={160}
            height={115}
            className="h-auto w-[66px]"
          />

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC400]">
            Há mais para entender.
          </p>
        </div>
      </footer>
    </main>
  );
}




