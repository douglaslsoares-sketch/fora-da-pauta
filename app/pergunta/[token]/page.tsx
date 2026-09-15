import type {
  Metadata,
} from "next";

import {
  QuestionTrackingExperience,
} from "@/components/QuestionTrackingExperience";

export const metadata: Metadata = {
  title:
    "Acompanhar pergunta | Fora da Pauta",
  description:
    "Acompanhe a situação da pergunta enviada ao Fora da Pauta.",
};

type QuestionPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function QuestionPage({
  params,
}: QuestionPageProps) {
  const {
    token,
  } =
    await params;

  return (
    <main className="min-h-screen bg-[#eeeee9] px-5 py-14 text-[#151515] sm:px-8 sm:py-20 lg:px-10">
      <section className="mx-auto w-full max-w-3xl">
        <QuestionTrackingExperience
          token={token}
        />
      </section>
    </main>
  );
}