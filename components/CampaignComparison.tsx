import type { CampaignComparison as CampaignComparisonData } from "@/data/campanhas";

type CampaignComparisonProps = {
  comparison: CampaignComparisonData;
};

export function CampaignComparison({
  comparison,
}: CampaignComparisonProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-black/10 bg-white px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:px-8 sm:py-8">
      {comparison.eyebrow ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          {comparison.eyebrow}
        </p>
      ) : null}

      <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
        {comparison.title}
      </h2>

      <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-[24px] bg-[#f2f2ef] px-5 py-6 text-center">
          <p className="text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
            {comparison.left.label}
          </p>

          <div className="mt-4 space-y-1 text-base font-medium leading-6 sm:text-lg">
            {comparison.left.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-black/40">
          {comparison.connector}
        </p>

        <div className="rounded-[24px] bg-[#f2f2ef] px-5 py-6 text-center">
          <p className="text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
            {comparison.right.label}
          </p>

          <div className="mt-4 space-y-1 text-base font-medium leading-6 sm:text-lg">
            {comparison.right.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {comparison.right.emphasis ? (
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.08em]">
              {comparison.right.emphasis}
            </p>
          ) : null}
        </div>
      </div>

      {comparison.summary ? (
        <p className="mt-6 border-t border-black/10 pt-5 text-[17px] leading-7 text-black/65">
          {comparison.summary}
        </p>
      ) : null}
    </section>
  );
}