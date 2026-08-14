import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignPage } from "@/components/CampaignPage";
import { campaigns, getCampaign } from "@/data/campanhas";

type CampaignRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({
  params,
}: CampaignRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) {
    return {};
  }

  return {
    title: campaign.title,
    description: campaign.summary,
  };
}

export default async function CampaignRoute({ params }: CampaignRouteProps) {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  return <CampaignPage campaign={campaign} />;
}
