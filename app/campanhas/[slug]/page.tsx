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

  const ehEdicao01 =
    campaign.slug === "fim-escala-6x1";

  const socialTitle =
    ehEdicao01
      ? "Você trabalha 6 dias para descansar 1?"
      : campaign.title;

  const socialDescription =
    ehEdicao01
      ? "Entenda como funciona a escala 6x1, o que está em debate e quais são as propostas de mudança."
      : `${campaign.statement} Entenda a mensagem. Confira os argumentos.`;

  return {
    title: `${campaign.title} | Fora da Pauta`,
    description: ehEdicao01
      ? socialDescription
      : campaign.statement,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: socialTitle,
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
      title: socialTitle,
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