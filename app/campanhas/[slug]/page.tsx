import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignPage } from "@/components/CampaignPage";
import { campaigns, getCampaign } from "@/data/campanhas";

type CampaignRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return campaigns.map((campaign) => ({
    slug: campaign.slug,
  }));
}

export async function generateMetadata({
  params,
}: CampaignRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) {
    return {};
  }

  const pageUrl =
    `https://www.foradapauta.org/campanhas/${campaign.slug}`;

  const imageUrl = campaign.shareImage
    ? `https://www.foradapauta.org${campaign.shareImage}`
    : undefined;

  const socialDescription =
    `${campaign.statement} Entenda a mensagem. Confira os argumentos.`;

  return {
    title: `${campaign.title} | Fora da Pauta`,
    description: campaign.statement,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: campaign.title,
      description: socialDescription,
      url: pageUrl,
      siteName: "Fora da Pauta",
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: campaign.title,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description: socialDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function CampaignRoute({
  params,
}: CampaignRouteProps) {
  const { slug } = await params;
  const campaign = getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  return <CampaignPage campaign={campaign} />;
}