import type {
  CampaignComparison as CampaignComparisonData,
} from "@/data/campanhas";

type CampaignComparisonProps = {
  comparison: CampaignComparisonData;
};

export function CampaignComparison({
  comparison,
}: CampaignComparisonProps) {
  return (
    <section className="border-t border-black/15 py-8 sm:py-10">
      {comparison.eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          {comparison.eyebrow}
        </p>
      ) : null}

      <h2 className="max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
        {comparison.title}
      </h2>

      <div className="mt-8 grid border-y border-black/15 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <div className="py-7 text-center sm:px-6 sm:py-9">
          <p className="text-6xl font-semibold tracking-[-0.065em]">
            {comparison.left.label}
          </p>

          <div className="mt-4 space-y-1 text-base font-medium leading-6 sm:text-lg">
            {comparison.left.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="grid place-items-center border-y border-black/10 py-3 sm:border-x sm:border-y-0 sm:px-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">
            {comparison.connector}
          </p>
        </div>

        <div className="py-7 text-center sm:px-6 sm:py-9">
          <p className="text-6xl font-semibold tracking-[-0.065em]">
            {comparison.right.label}
          </p>

          <div className="mt-4 space-y-1 text-base font-medium leading-6 sm:text-lg">
            {comparison.right.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {comparison.right.emphasis ? (
            <div className="mt-5">
              <span className="inline-block border-b-[3px] border-[#f2c94c] pb-1 text-xs font-bold uppercase tracking-[0.08em]">
                {comparison.right.emphasis}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {comparison.summary ? (
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-black/60">
          {comparison.summary}
        </p>
      ) : null}
    </section>
  );
}