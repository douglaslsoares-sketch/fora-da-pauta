import Link from "next/link";
import type { Campaign } from "@/data/campanhas";
import { ExpandableCard } from "@/components/ExpandableCard";
import { ShareCard } from "@/components/ShareCard";
import { StoreCard } from "@/components/StoreCard";
import { EconomicIndicators } from "@/components/EconomicIndicators";

type CampaignPageProps = {
  campaign: Campaign;
};

export function CampaignPage({ campaign }: CampaignPageProps) {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
        <header className="mb-14 flex items-center justify-between gap-6 sm:mb-20">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.22em] text-black/70"
          >
            {campaign.brand}
          </Link>
          <span className="h-2.5 w-2.5 rounded-full bg-black" aria-hidden="true" />
        </header>

        <section className="mb-12 sm:mb-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
            Campanha
          </p>
          <h1 className="max-w-3xl text-[clamp(3rem,10vw,6rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            {campaign.title}
          </h1>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-8 tracking-[-0.02em] sm:text-2xl sm:leading-9">
            {campaign.statement}
          </p>
        </section>

        <section className="space-y-4" aria-label="Conteúdo da campanha">
          {campaign.sections.map((section) => (
            <ExpandableCard key={section.title} {...section} />
          ))}
          {campaign.slug === "compare-os-dados" ? (
            <EconomicIndicators />
          ) : null}

          <ShareCard statement={campaign.statement} />

          <StoreCard storeUrl={campaign.storeUrl} />
        </section>

        <footer className="mt-auto pt-16 text-center text-xs uppercase tracking-[0.2em] text-black/35">
          Fora da Pauta · uma mensagem de cada vez
        </footer>
      </div>
    </main>
  );
}
