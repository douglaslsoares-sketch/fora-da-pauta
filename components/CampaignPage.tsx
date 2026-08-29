import Link from "next/link";
import type { Campaign } from "@/data/campanhas";
import { ExpandableCard } from "@/components/ExpandableCard";
import { CampaignComparison } from "@/components/CampaignComparison";
import { ShareCard } from "@/components/ShareCard";
import { CandidatesCard } from "@/components/CandidatesCard";
import { StoreCard } from "@/components/StoreCard";
import { EconomicIndicators } from "@/components/EconomicIndicators";

type CampaignPageProps = {
  campaign: Campaign;
};

export function CampaignPage({ campaign }: CampaignPageProps) {
  return (
    <main
      className="min-h-screen bg-[#eeeee9] text-[#151515]"
      data-share-statement={campaign.statement}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">

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
          {campaign.comparison ? (
            <CampaignComparison comparison={campaign.comparison} />
          ) : null}
          {campaign.sections.map((section) => (
            <ExpandableCard key={section.title} {...section} />
          ))}
          {campaign.pautaId ? (
            <CandidatesCard href={`/campanhas/${campaign.slug}/candidatos`} />
          ) : null}
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
